export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joyería en Oro Artesanal | Casa Orfebre",
  description:
    "Joyas artesanales en oro 18k y oro amarillo hechas a mano por orfebres chilenos verificados. Anillos de compromiso, alianzas y piezas únicas con certificado de autenticidad.",
  alternates: { canonical: "/coleccion/oro" },
  openGraph: {
    title: "Joyería en Oro Artesanal | Casa Orfebre",
    description:
      "Joyas artesanales en oro 18k y oro amarillo hechas a mano por orfebres chilenos verificados. Anillos de compromiso, alianzas y piezas únicas con certificado de autenticidad.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joyería en Oro Artesanal | Casa Orfebre",
    description:
      "Joyas artesanales en oro 18k y oro amarillo hechas a mano por orfebres chilenos verificados. Anillos de compromiso, alianzas y piezas únicas.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Oro", url: "/coleccion/oro" },
]);

export default async function OroPage() {
    const products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        materials: {
          some: {
            name: {
              in: [
                "Oro 18k",
                "Oro",
                "Oro Amarillo",
                "Oro Rosa",
                "Oro Blanco",
              ],
            },
          },
        },
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
    name: "Joyería en Oro Artesanal",
    description: "Joyas artesanales en oro 18k y oro amarillo hechas a mano por orfebres chilenos verificados",
    url: "/coleccion/oro",
    products,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Joyería en Oro
          </h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Las piezas en oro de nuestra colección son creadas por orfebres
            chilenos que dominan las técnicas más exigentes de la joyería. Oro
            18k trabajado a mano para anillos de compromiso, alianzas de
            matrimonio y joyas statement que se convierten en herencia familiar.
            Cada pieza incluye certificado de autenticidad y garantía.
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
              Pronto tendremos piezas en oro disponibles. Explora nuestra{" "}
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
