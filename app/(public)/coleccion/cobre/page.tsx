export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joyería en Cobre Artesanal | Casa Orfebre",
  description:
    "Joyas artesanales en cobre hechas a mano por orfebres chilenos. Piezas únicas con pátinas naturales, texturas orgánicas y diseño de autor. Chile, tierra del cobre.",
  alternates: { canonical: "/coleccion/cobre" },
  openGraph: {
    title: "Joyería en Cobre Artesanal | Casa Orfebre",
    description:
      "Joyas artesanales en cobre hechas a mano por orfebres chilenos. Piezas únicas con pátinas naturales, texturas orgánicas y diseño de autor.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joyería en Cobre Artesanal | Casa Orfebre",
    description:
      "Joyas artesanales en cobre hechas a mano por orfebres chilenos. Piezas únicas con pátinas naturales, texturas orgánicas y diseño de autor.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Cobre", url: "/coleccion/cobre" },
]);

export default async function CobrePage() {
    const products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        materials: { some: { name: { in: ["Cobre"] } } },
      },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        materials: { select: { id: true, name: true } },
        specialties: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    });

  const jsonLd = buildCollectionWithItemsJsonLd({
    name: "Joyería en Cobre Artesanal",
    description: "Joyas artesanales en cobre hechas a mano por orfebres chilenos",
    url: "/coleccion/cobre",
    products,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Joyería en Cobre
          </h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Chile es la tierra del cobre, y nuestros orfebres lo transforman en
            joyas extraordinarias. El cobre permite texturas orgánicas,
            pátinas naturales que evolucionan con el tiempo y un carácter cálido
            que ningún otro metal puede igualar. Descubre piezas que honran la
            tradición minera chilena con diseño contemporáneo.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 60}>
                <ProductCard
                  product={product}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-sm text-text-secondary">
              Pronto tendremos piezas en cobre disponibles. Explora nuestra{" "}
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
