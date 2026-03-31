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
  title: "Joyería para Matrimonio | Casa Orfebre",
  description:
    "Joyería artesanal para tu matrimonio. Argollas, aros y accesorios únicos hechos a mano por orfebres chilenos verificados.",
  alternates: { canonical: "/coleccion/matrimonio" },
  openGraph: {
    title: "Joyería para Matrimonio | Casa Orfebre",
    description:
      "Joyería artesanal para tu matrimonio. Argollas, aros y accesorios únicos hechos a mano por orfebres chilenos verificados.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Joyería para Matrimonio | Casa Orfebre",
    description:
      "Joyería artesanal para tu matrimonio. Argollas, aros y accesorios únicos hechos a mano por orfebres chilenos verificados.",
    images: ["/casaorfebre-og-image.png"],
  },
};


export default async function MatrimonioPage() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        occasions: { some: { slug: "matrimonio" } },
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
    { name: "Matrimonio", url: "/coleccion/matrimonio" },
  ]);
  const jsonLd = buildCollectionWithItemsJsonLd({
    name: "Joyería para Matrimonio",
    description:
      "Joyería artesanal para tu matrimonio. Argollas, aros y accesorios únicos hechos a mano por orfebres chilenos verificados.",
    url: "/coleccion/matrimonio",
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
            title="Joyería para Matrimonio"
            subtitle="Celebra el día más importante con joyas que llevan la esencia de Chile. Argollas, aros y accesorios creados a mano por orfebres verificados."
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
            Pronto tendremos joyería para matrimonio disponible. Explora nuestra{" "}
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
