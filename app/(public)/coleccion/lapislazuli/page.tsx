export const revalidate = 300;
export const dynamic = "force-static";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joyería con Lapislázuli | Casa Orfebre",
  description:
    "Joyas artesanales con lapislázuli chileno, piedra nacional de Chile. Anillos, collares y aros con engaste artesanal por orfebres verificados. Envío a todo Chile.",
  alternates: { canonical: "/coleccion/lapislazuli" },
  openGraph: {
    title: "Joyería con Lapislázuli | Casa Orfebre",
    description:
      "Joyas artesanales con lapislázuli chileno, piedra nacional de Chile. Anillos, collares y aros con engaste artesanal por orfebres verificados.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joyería con Lapislázuli | Casa Orfebre",
    description:
      "Joyas artesanales con lapislázuli chileno, piedra nacional de Chile. Anillos, collares y aros con engaste artesanal por orfebres verificados.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Lapislázuli", url: "/coleccion/lapislazuli" },
]);

export default async function LapislazuliPage() {
    const products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        materials: { some: { name: { in: ["Lapislázuli"] } } },
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
    name: "Joyería con Lapislázuli",
    description: "Joyas artesanales con lapislázuli chileno, piedra nacional de Chile",
    url: "/coleccion/lapislazuli",
    products,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Joyería con Lapislázuli
          </h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            El lapislázuli es la piedra emblemática de Chile — un azul profundo
            que solo se encuentra en nuestro país y en Afganistán. Nuestros
            orfebres chilenos lo engastan artesanalmente en plata y oro,
            creando joyas que llevan la esencia del territorio chileno. Una pieza
            con lapislázuli es un símbolo de identidad y belleza natural.
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
              Pronto tendremos piezas con lapislázuli disponibles. Explora
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
