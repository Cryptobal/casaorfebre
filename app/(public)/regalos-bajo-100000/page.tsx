export const revalidate = 60;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";

export const metadata = {
  title: "Regalos de Joyería Artesanal bajo $100.000 | Casa Orfebre",
  description:
    "Piezas premium de orfebres verificados bajo $100.000. Para los regalos que realmente importan.",
  alternates: { canonical: "/regalos-bajo-100000" },
  openGraph: {
    title: "Regalos de Joyería Artesanal bajo $100.000 | Casa Orfebre",
    description:
      "Piezas premium de orfebres verificados bajo $100.000. Para los regalos que realmente importan.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Regalos de Joyería Artesanal bajo $100.000 | Casa Orfebre",
    description:
      "Piezas premium de orfebres verificados bajo $100.000. Para los regalos que realmente importan.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function RegalosBajo100000Page() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        price: { lte: 100000 },
      },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        specialty: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="pt-20 pb-12">
        <FadeIn>
          <SectionHeading
            title="Regalos bajo $100.000"
            subtitle="Piezas premium de orfebres verificados. Para los regalos que realmente importan."
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
            Estamos incorporando más opciones en este rango. Mientras tanto,
            explora nuestra{" "}
            <a href="/coleccion" className="text-accent hover:underline">
              colección completa
            </a>
            .
          </p>
        </div>
      )}
    </section>
  );
}
