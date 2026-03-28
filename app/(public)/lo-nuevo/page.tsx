export const revalidate = 60;

import { Suspense } from "react";
import Link from "next/link";
import { getNewProducts, getUserFavoriteIds } from "@/lib/queries/products";
import { getActiveCategories, getActiveMaterials } from "@/lib/queries/catalog";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { LoNuevoFilters } from "./lo-nuevo-filters";
import { auth } from "@/lib/auth";
import type { ProductCategory } from "@prisma/client";

export const metadata = {
  title: "Lo Nuevo — Joyería Artesanal Reciente | Casa Orfebre",
  description:
    "Descubre las últimas piezas de joyería artesanal chilena. Nuevos diseños de orfebres verificados, actualizados cada semana.",
  alternates: { canonical: "/lo-nuevo" },
  openGraph: {
    title: "Lo Nuevo — Joyería Artesanal Reciente | Casa Orfebre",
    description:
      "Descubre las últimas piezas de joyería artesanal chilena. Nuevos diseños de orfebres verificados, actualizados cada semana.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Lo Nuevo — Joyería Artesanal Reciente | Casa Orfebre",
    description:
      "Descubre las últimas piezas de joyería artesanal chilena. Nuevos diseños de orfebres verificados.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const VALID_CATEGORIES = new Set([
  "AROS", "COLLAR", "ANILLO", "PULSERA", "BROCHE", "COLGANTE", "OTRO",
]);

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

export default async function LoNuevoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const categoryParam = typeof params.category === "string" ? params.category : undefined;
  const category = categoryParam && VALID_CATEGORIES.has(categoryParam)
    ? (categoryParam as ProductCategory)
    : undefined;
  const material = typeof params.material === "string" ? params.material : undefined;
  const priceParam = typeof params.price === "string" ? params.price : undefined;
  const { minPrice, maxPrice } = parsePriceRange(priceParam);

  const session = await auth();
  const [{ products, total, totalPages }, favoriteIds, dbCategories, dbMaterials] = await Promise.all([
    getNewProducts({ page, category, material, minPrice, maxPrice }),
    getUserFavoriteIds(session?.user?.id),
    getActiveCategories(),
    getActiveMaterials(),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <SectionHeading
        title="Lo Nuevo"
        subtitle="Las últimas piezas que se unieron a Casa Orfebre"
        as="h1"
      />

      <div className="mt-8">
        <Suspense fallback={null}>
          <LoNuevoFilters categories={dbCategories} materials={dbMaterials.map((m) => m.name)} />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-text-tertiary">
            {total} {total === 1 ? "pieza nueva" : "piezas nuevas"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 60}>
                <ProductCard
                  product={product}
                  isFavorited={favoriteIds.has(product.id)}
                  listName="Lo Nuevo"
                />
              </FadeIn>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginación">
              {page > 1 && (
                <PaginationLink page={page - 1} params={params} label="← Anterior" />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  page={p}
                  params={params}
                  label={String(p)}
                  active={p === page}
                />
              ))}
              {page < totalPages && (
                <PaginationLink page={page + 1} params={params} label="Siguiente →" />
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            No hay piezas nuevas con esos filtros.
          </p>
        </div>
      )}
    </section>
  );
}

function PaginationLink({
  page,
  params,
  label,
  active,
}: {
  page: number;
  params: Record<string, string | string[] | undefined>;
  label: string;
  active?: boolean;
}) {
  const sp = new URLSearchParams();
  if (page > 1) sp.set("page", String(page));
  for (const [k, v] of Object.entries(params)) {
    if (k !== "page" && typeof v === "string" && v) sp.set(k, v);
  }
  const qs = sp.toString();
  return (
    <Link
      href={`/lo-nuevo${qs ? `?${qs}` : ""}`}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition-colors ${
        active
          ? "bg-accent text-white"
          : "border border-border text-text-secondary hover:border-accent/50 hover:text-text"
      }`}
    >
      {label}
    </Link>
  );
}
