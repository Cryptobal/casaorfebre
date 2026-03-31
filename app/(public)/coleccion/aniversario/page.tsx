export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata = {
  title: "Joyería para Aniversario | Casa Orfebre",
  description:
    "Marca cada año con una pieza que perdure tanto como tu historia juntos. Joyas artesanales chilenas para celebrar el amor.",
  alternates: { canonical: "/coleccion/aniversario" },
  openGraph: {
    title: "Joyería para Aniversario | Casa Orfebre",
    description:
      "Marca cada año con una pieza que perdure tanto como tu historia juntos. Joyas artesanales chilenas para celebrar el amor.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Joyería para Aniversario | Casa Orfebre",
    description:
      "Marca cada año con una pieza que perdure tanto como tu historia juntos. Joyas artesanales chilenas para celebrar el amor.",
    images: ["/casaorfebre-og-image.png"],
  },
};


export default async function AniversarioPage() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        occasions: { some: { slug: "aniversario" } },
      },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        specialties: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    getUserFavoriteIds(session?.user?.id),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Colección", url: "/coleccion" },
    { name: "Aniversario", url: "/coleccion/aniversario" },
  ]);
  const jsonLd = buildCollectionWithItemsJsonLd({
    name: "Joyería para Aniversario",
    description:
      "Marca cada año con una pieza que perdure tanto como tu historia juntos. Joyas artesanales chilenas para celebrar el amor.",
    url: "/coleccion/aniversario",
    products,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="pt-20 pb-12">
        <FadeIn>
          <SectionHeading
            title="Joyería para Aniversario"
            subtitle="Marca cada año con una pieza que perdure tanto como tu historia juntos."
            as="h1"
          />
        </FadeIn>
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product, i) => (
            <FadeIn key={product.id} delay={i * 60}>
              <ProductCard
                product={product}
                isFavorited={favoriteIds.has(product.id)}
              />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            Pronto tendremos joyería para aniversario disponible. Explora
            nuestra{" "}
            <a href="/coleccion" className="text-accent hover:underline">
              colección completa
            </a>
            .
          </p>
        </div>
      )}
    </section>
    </>
  );
}
