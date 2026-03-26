export const revalidate = 60;

import { Suspense } from "react";
import { getApprovedProducts, getAllMaterials, getUserFavoriteIds } from "@/lib/queries/products";
import { getApprovedArtisans } from "@/lib/queries/artisans";
import { getActiveCategories, getActiveMaterials } from "@/lib/queries/catalog";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { CatalogFilters } from "./catalog-filters";
import { auth } from "@/lib/auth";
import type { ProductCategory } from "@prisma/client";

export const metadata = {
  title: "Colección",
  description:
    "Explora piezas únicas de joyería artesanal chilena. Aros, collares, anillos y más de orfebres verificados.",
};

const VALID_CATEGORIES = new Set([
  "AROS",
  "COLLAR",
  "ANILLO",
  "PULSERA",
  "BROCHE",
  "COLGANTE",
  "OTRO",
]);

function parsePriceRange(price: string | undefined) {
  if (!price) return {};
  // "50000" → max only
  // "50000-100000" → min and max
  // "200000" alone with no dash → min only (Más de $200.000)
  if (price.includes("-")) {
    const [min, max] = price.split("-").map(Number);
    return { minPrice: min, maxPrice: max };
  }
  const num = Number(price);
  if (Number.isNaN(num)) return {};
  // Disambiguate: 50000 means "up to 50k", 200000 means "over 200k"
  if (num <= 50000) return { maxPrice: num };
  return { minPrice: num };
}

export default async function ColeccionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const categoryParam = typeof params.category === "string" ? params.category : undefined;
  const category = categoryParam && VALID_CATEGORIES.has(categoryParam)
    ? (categoryParam as ProductCategory)
    : undefined;
  const material = typeof params.material === "string" ? params.material : undefined;
  const artisanSlug = typeof params.artisan === "string" ? params.artisan : undefined;
  const sortParam = typeof params.sort === "string" ? params.sort : undefined;
  const sort = (sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "newest" || sortParam === "rating")
    ? sortParam as "price_asc" | "price_desc" | "newest" | "rating"
    : undefined;
  const priceParam = typeof params.price === "string" ? params.price : undefined;
  const { minPrice, maxPrice } = parsePriceRange(priceParam);

  const session = await auth();
  const [products, materials, artisans, favoriteIds, dbCategories, dbMaterials] = await Promise.all([
    getApprovedProducts({ category, material, minPrice, maxPrice, artisanSlug, sort }),
    getAllMaterials(),
    getApprovedArtisans(),
    getUserFavoriteIds(session?.user?.id),
    getActiveCategories(),
    getActiveMaterials(),
  ]);

  // Use DB materials if available, fallback to product-derived materials
  const materialNames = dbMaterials.length > 0 ? dbMaterials.map((m) => m.name) : materials;

  const artisanOptions = artisans.map((a) => ({
    slug: a.slug,
    displayName: a.displayName,
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <SectionHeading
        title="Colección"
        subtitle="Piezas de orfebres chilenos verificados"
        as="h1"
      />

      <div className="mt-8">
        <Suspense fallback={null}>
          <CatalogFilters categories={dbCategories} materials={materialNames} artisans={artisanOptions} />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product, i) => (
            <FadeIn key={product.id} delay={i * 60}>
              <ProductCard product={product} isFavorited={favoriteIds.has(product.id)} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            No encontramos piezas con esos filtros.
          </p>
        </div>
      )}
    </section>
  );
}
