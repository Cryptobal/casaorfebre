export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";

export const metadata = {
  title: "Anillos de Compromiso Artesanales | Casa Orfebre",
  description:
    "Anillos de compromiso únicos, hechos a mano por orfebres chilenos. Piezas artesanales que sellan tu historia de amor.",
  alternates: { canonical: "/coleccion/compromiso" },
  openGraph: {
    title: "Anillos de Compromiso Artesanales | Casa Orfebre",
    description:
      "Anillos de compromiso únicos, hechos a mano por orfebres chilenos. Piezas artesanales que sellan tu historia de amor.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Anillos de Compromiso Artesanales | Casa Orfebre",
    description:
      "Anillos de compromiso únicos, hechos a mano por orfebres chilenos. Piezas artesanales que sellan tu historia de amor.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function CompromisoPage() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        occasions: { some: { slug: "compromiso" } },
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
          Anillos de Compromiso Artesanales
        </h1>
        <p className="mt-4 text-text-secondary leading-relaxed">
          Un anillo de compromiso artesanal es tan único como tu historia de
          amor. Cada pieza es creada a mano por orfebres chilenos que ponen su
          alma en cada detalle, asegurando que el símbolo de tu promesa sea
          verdaderamente irrepetible.
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
            Pronto tendremos anillos de compromiso disponibles. Explora nuestra{" "}
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
