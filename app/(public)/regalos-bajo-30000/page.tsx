export const revalidate = 60;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";

export const metadata = {
  title: "Regalos de Joyería Artesanal bajo $30.000 | Casa Orfebre",
  description:
    "Encuentra joyas artesanales chilenas bajo $30.000. Piezas únicas de orfebres verificados con certificado de autenticidad.",
  alternates: { canonical: "/regalos-bajo-30000" },
  openGraph: {
    title: "Regalos de Joyería Artesanal bajo $30.000 | Casa Orfebre",
    description:
      "Encuentra joyas artesanales chilenas bajo $30.000. Piezas únicas de orfebres verificados con certificado de autenticidad.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Regalos de Joyería Artesanal bajo $30.000 | Casa Orfebre",
    description:
      "Encuentra joyas artesanales chilenas bajo $30.000. Piezas únicas de orfebres verificados con certificado de autenticidad.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function RegalosBajo30000Page() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        price: { lte: 30000 },
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
            title="Regalos bajo $30.000"
            subtitle="Joyería artesanal chilena a precios accesibles. Perfecta para sorprender sin romper el presupuesto."
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
