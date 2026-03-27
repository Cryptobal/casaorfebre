export const revalidate = 60;

import Link from "next/link";
import type { ProductCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActiveCategories, getActiveOccasions } from "@/lib/queries/catalog";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata = {
  title: "Colecciones",
  description:
    "Explora nuestras colecciones de joyería artesanal chilena por categoría y ocasión.",
  alternates: { canonical: "/colecciones" },
  openGraph: {
    title: "Colecciones | Casa Orfebre",
    description:
      "Explora nuestras colecciones de joyería artesanal chilena por categoría y ocasión.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Colecciones | Casa Orfebre",
    description:
      "Explora nuestras colecciones de joyería artesanal chilena por categoría y ocasión.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collares",
  ANILLO: "Anillos",
  PULSERA: "Pulseras",
  BROCHE: "Broches",
  COLGANTE: "Colgantes",
  OTRO: "Otros",
};

async function getCategoryCounts() {
  const counts = await prisma.product.groupBy({
    by: ["category"],
    where: { status: "APPROVED" },
    _count: { id: true },
  });
  return new Map(counts.map((c) => [c.category, c._count.id]));
}

async function getOccasionCounts() {
  const occasions = await prisma.occasion.findMany({
    where: { isActive: true },
    include: {
      products: {
        where: { status: "APPROVED" },
        select: { id: true },
      },
    },
    orderBy: { position: "asc" },
  });
  return occasions.map((o) => ({
    name: o.name,
    slug: o.slug,
    count: o.products.length,
  }));
}

export default async function ColeccionesPage() {
  const [categories, occasions, categoryCounts, occasionData] =
    await Promise.all([
      getActiveCategories(),
      getActiveOccasions(),
      getCategoryCounts(),
      getOccasionCounts(),
    ]);

  const occasionCountMap = new Map(
    occasionData.map((o) => [o.slug, o.count])
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <SectionHeading
        title="Colecciones"
        subtitle="Explora piezas únicas organizadas por tipo y ocasión"
        as="h1"
      />

      {/* Categories */}
      <div className="mt-12">
        <h2 className="mb-6 font-serif text-xl font-light text-text">
          Por categoría
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const categoryKey = cat.name.toUpperCase() as ProductCategory;
            const count = categoryCounts.get(categoryKey) ?? 0;
            return (
              <FadeIn key={cat.id} delay={i * 60}>
                <Link
                  href={`/coleccion?category=${categoryKey}`}
                  className="group flex flex-col items-center rounded-lg border border-border bg-surface p-6 text-center transition-all hover:border-accent hover:shadow-sm"
                >
                  <span className="font-serif text-lg font-light text-text group-hover:text-accent">
                    {CATEGORY_LABELS[categoryKey] ?? cat.name}
                  </span>
                  <span className="mt-1 text-xs text-text-tertiary">
                    {count} {count === 1 ? "pieza" : "piezas"}
                  </span>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>

      {/* Occasions */}
      {occasions.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 font-serif text-xl font-light text-text">
            Por ocasión
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {occasions.map((occ, i) => {
              const count = occasionCountMap.get(occ.slug) ?? 0;
              return (
                <FadeIn key={occ.id} delay={i * 60}>
                  <Link
                    href={`/coleccion?occasion=${occ.slug}`}
                    className="group flex flex-col items-center rounded-lg border border-border bg-surface p-6 text-center transition-all hover:border-accent hover:shadow-sm"
                  >
                    <span className="font-serif text-lg font-light text-text group-hover:text-accent">
                      {occ.name}
                    </span>
                    <span className="mt-1 text-xs text-text-tertiary">
                      {count} {count === 1 ? "pieza" : "piezas"}
                    </span>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 text-center">
        <Link
          href="/coleccion"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Ver toda la colección →
        </Link>
      </div>
    </section>
  );
}
