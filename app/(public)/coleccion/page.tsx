export const revalidate = 60;

import { Suspense } from "react";
import { getApprovedProducts, getAllMaterials, type ProductSort } from "@/lib/queries/products";
import { getApprovedArtisans } from "@/lib/queries/artisans";
import { getActiveCategories, getActiveMaterials, getActiveOccasions, getActiveSpecialties } from "@/lib/queries/catalog";
import { EditorialBreadcrumb } from "@/components/shared/editorial-breadcrumb";
import { EditorialHero } from "@/components/shared/editorial-hero";
import { CollectionGrid } from "@/components/products/collection-grid";
import { CatalogFilters, CatalogFiltersSidebar } from "./catalog-filters";
import { CatalogSort } from "./catalog-sort";
import { ListTracker } from "./list-tracker";
import { getCollectionIntro } from "@/lib/content/category-intros";

export const metadata = {
  title: "Colección — Casa Orfebre",
  description:
    "Piezas de autor hechas a mano en Chile. Anillos, aros, collares, pulseras y colgantes de orfebres verificados. Certificado digital de autenticidad incluido.",
  alternates: { canonical: "https://casaorfebre.cl/coleccion" },
  openGraph: {
    type: "website" as const,
    title: "Colección — Casa Orfebre",
    description: "Piezas de autor hechas a mano en Chile.",
    url: "https://casaorfebre.cl/coleccion",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Colección — Casa Orfebre",
    description: "Piezas de autor hechas a mano en Chile.",
    creator: "@casaorfebre",
    site: "@casaorfebre",
    images: ["/casaorfebre-og-image.png"],
  },
};

function parsePriceRange(price: string | undefined) {
  if (!price) return {};
  if (price.includes("-")) {
    const [min, max] = price.split("-").map(Number);
    return { minPrice: min, maxPrice: max };
  }
  const num = Number(price);
  if (Number.isNaN(num)) return {};
  if (num <= 50000) return { maxPrice: num };
  return { minPrice: num };
}

function parseEdition(value: string | undefined): "UNIQUE" | "MADE_TO_ORDER" | "LIMITED" | undefined {
  if (value === "UNIQUE" || value === "MADE_TO_ORDER" || value === "LIMITED") return value;
  return undefined;
}

function parseSort(value: string | undefined): ProductSort | undefined {
  const allowed: ProductSort[] = [
    "recommended",
    "newest",
    "rating",
    "most_viewed",
    "popular",
    "price_asc",
    "price_desc",
    "az",
  ];
  return allowed.includes(value as ProductSort) ? (value as ProductSort) : undefined;
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
  const sort = parseSort(typeof params.sort === "string" ? params.sort : undefined);
  const edition = parseEdition(typeof params.edition === "string" ? params.edition : undefined);
  const priceParam = typeof params.price === "string" ? params.price : undefined;
  const { minPrice, maxPrice } = parsePriceRange(priceParam);

  const [products, materials, artisans, dbCategories, dbMaterials, dbOccasions, dbSpecialties] = await Promise.all([
    getApprovedProducts({
      categorySlug,
      material,
      minPrice,
      maxPrice,
      artisanSlug,
      occasionSlug,
      specialtySlug,
      audiencia,
      productionType: edition,
      sort,
    }),
    getAllMaterials(),
    getApprovedArtisans(),
    getActiveCategories(),
    getActiveMaterials(),
    getActiveOccasions(),
    getActiveSpecialties(),
  ]);

  const materialNames = dbMaterials.length > 0 ? dbMaterials.map((m) => m.name) : materials;
  const artisanOptions = artisans.map((a) => ({ slug: a.slug, displayName: a.displayName }));

  const activeCategory = categorySlug
    ? dbCategories.find((c) => c.slug === categorySlug)
    : undefined;
  const intro = getCollectionIntro(categorySlug);
  const breadcrumbItems = [
    { label: "Casa Orfebre", href: "/" },
    { label: "Colección", href: "/coleccion" },
    ...(activeCategory ? [{ label: activeCategory.name }] : []),
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <EditorialBreadcrumb items={breadcrumbItems} />

      <div className="mt-10 lg:mt-16">
        <EditorialHero
          heading={intro.heading}
          subheading={intro.subheading}
          paragraph={intro.paragraph}
        />
      </div>

      <div className="mt-16 flex flex-col gap-10 lg:flex-row lg:gap-16">
        <CatalogFiltersSidebar
          categories={dbCategories}
          materials={materialNames}
          artisans={artisanOptions}
          occasions={dbOccasions}
          specialties={dbSpecialties}
        />

        <div className="flex-1 min-w-0">
          {/* Barra mobile: filtros + contador/orden. */}
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <Suspense fallback={null}>
              <CatalogFilters
                categories={dbCategories}
                materials={materialNames}
                artisans={artisanOptions}
                occasions={dbOccasions}
                specialties={dbSpecialties}
              />
            </Suspense>
          </div>

          <Suspense fallback={null}>
            <CatalogSort resultsCount={products.length} />
          </Suspense>

          {products.length > 0 ? (
            <div className="mt-12">
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
              <CollectionGrid products={products} listName={categorySlug ?? "Colección"} />
            </div>
          ) : (
            <div className="mt-20 border-t border-[color:var(--color-border-soft)] pt-20 text-center">
              <p className="font-serif text-xl font-light italic text-text-secondary">
                No encontramos piezas con esos filtros.
              </p>
              <p className="mt-3 text-xs font-light uppercase tracking-[0.2em] text-text-tertiary">
                Prueba con otro material, otra técnica o limpia los filtros.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
