export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/seo";

export const metadata = {
  title: "Día de la Madre — Joyería Artesanal | Casa Orfebre",
  description:
    "Regala algo hecho a mano con amor. Joyería artesanal chilena para la persona más importante.",
  alternates: { canonical: "/coleccion/dia-de-la-madre" },
  openGraph: {
    title: "Día de la Madre — Joyería Artesanal | Casa Orfebre",
    description:
      "Regala algo hecho a mano con amor. Joyería artesanal chilena para la persona más importante.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Día de la Madre — Joyería Artesanal | Casa Orfebre",
    description:
      "Regala algo hecho a mano con amor. Joyería artesanal chilena para la persona más importante.",
    images: ["/casaorfebre-og-image.png"],
  },
};


export default async function DiaDeLaMadrePage() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        occasions: { some: { slug: "dia-de-la-madre" } },
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
    { name: "Día de la Madre", url: "/coleccion/dia-de-la-madre" },
  ]);
  const jsonLd = buildCollectionWithItemsJsonLd({
    name: "Día de la Madre — Joyería Artesanal",
    description:
      "Regala algo hecho a mano con amor. Joyería artesanal chilena para la persona más importante.",
    url: "/coleccion/dia-de-la-madre",
    products,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="pt-20 pb-12">
        <FadeIn>
          <SectionHeading
            title="Día de la Madre"
            subtitle="Regala algo hecho a mano con amor. Joyería artesanal chilena para la persona más importante."
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
            Pronto tendremos joyas para el Día de la Madre disponibles. Explora
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
