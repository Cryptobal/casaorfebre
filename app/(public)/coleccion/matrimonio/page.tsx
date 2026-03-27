export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";

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
        specialty: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-light sm:text-4xl">
          Joyería para Matrimonio
        </h1>
        <p className="mt-4 text-text-secondary leading-relaxed">
          Celebra el día más importante con joyas que llevan la esencia de Chile.
          Argollas, aros y accesorios creados a mano por orfebres verificados,
          para que cada detalle de tu matrimonio sea tan especial como tu
          historia juntos.
        </p>
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
  );
}
