export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { getApprovedProducts, getAllMaterials } from "@/lib/queries/products";
import { getApprovedArtisans } from "@/lib/queries/artisans";
import { getActiveCategories, getActiveMaterials, getActiveOccasions, getActiveSpecialties } from "@/lib/queries/catalog";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { CatalogFilters } from "./catalog-filters";
import { ListTracker } from "./list-tracker";

export const metadata = {
  title: "Colección de Joyería de Plata Artesanal",
  description:
    "Explora el catálogo completo de joyería de plata hecha a mano: aros, anillos, collares, pulseras y colgantes de orfebres chilenos verificados. Envío a todo Chile.",
  alternates: { canonical: "https://casaorfebre.cl/coleccion" },
  openGraph: {
    type: "website" as const,
    title: "Colección de Joyería de Plata Artesanal | Casa Orfebre",
    description:
      "Explora el catálogo completo de joyería de plata hecha a mano: aros, anillos, collares, pulseras y colgantes de orfebres chilenos verificados. Envío a todo Chile.",
    url: "https://casaorfebre.cl/coleccion",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Colección de Joyería de Plata Artesanal | Casa Orfebre",
    description:
      "Explora el catálogo completo de joyería de plata hecha a mano: aros, anillos, collares, pulseras y colgantes de orfebres chilenos verificados. Envío a todo Chile.",
    creator: "@casaorfebre",
    site: "@casaorfebre",
    images: ["/casaorfebre-og-image.png"],
  },
};

// Category slugs are validated against the DB below

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

  const categorySlug = typeof params.category === "string" ? params.category.toLowerCase() : undefined;
  const material = typeof params.material === "string" ? params.material : undefined;
  const artisanSlug = typeof params.artisan === "string" ? params.artisan : undefined;
  const occasionSlug = typeof params.occasion === "string" ? params.occasion : undefined;
  const specialtySlug = typeof params.specialty === "string" ? params.specialty : undefined;
  const audiencia = typeof params.audiencia === "string" ? params.audiencia.toUpperCase() : undefined;
  const sortParam = typeof params.sort === "string" ? params.sort : undefined;
  const sort = (sortParam === "price_asc" || sortParam === "price_desc" || sortParam === "newest" || sortParam === "rating" || sortParam === "popular")
    ? sortParam as "price_asc" | "price_desc" | "newest" | "rating" | "popular"
    : undefined;
  const priceParam = typeof params.price === "string" ? params.price : undefined;
  const { minPrice, maxPrice } = parsePriceRange(priceParam);
  const q = typeof params.q === "string" ? params.q : undefined;
  const [products, materials, artisans, dbCategories, dbMaterials, dbOccasions, dbSpecialties] = await Promise.all([
    getApprovedProducts({ categorySlug, material, minPrice, maxPrice, artisanSlug, occasionSlug, specialtySlug, audiencia, q, sort }),
    getAllMaterials(),
    getApprovedArtisans(),
    getActiveCategories(),
    getActiveMaterials(),
    getActiveOccasions(),
    getActiveSpecialties(),
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
          <CatalogFilters categories={dbCategories} materials={materialNames} artisans={artisanOptions} occasions={dbOccasions} specialties={dbSpecialties} />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <>
        <ListTracker
          listName={categorySlug ?? "Colección"}
          items={products.slice(0, 20).map((p) => ({
            item_id: p.id,
            item_name: p.name,
            item_category: p.categories?.[0]?.name ?? "",
            item_brand: p.artisan.displayName,
            price: p.price,
            quantity: 1,
          }))}
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product, i) => (
            <FadeIn key={product.id} delay={i * 60}>
              <ProductCard product={product} listName={categorySlug ?? "Colección"} />
            </FadeIn>
          ))}
        </div>
        </>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-tertiary"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <div>
            <p className="font-serif text-lg text-text">
              No encontramos piezas con esos filtros
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Prueba quitando algún filtro o explora toda la colección.
            </p>
          </div>
          <Link
            href="/coleccion"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Ver toda la colección
          </Link>
        </div>
      )}
    </section>
  );
}
