export const revalidate = 300;
export const dynamic = "force-static";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata = {
  title: "Joyas para Regalar | Casa Orfebre",
  description:
    "Encuentra la joya artesanal perfecta para regalar. Piezas únicas hechas a mano por orfebres chilenos verificados. Envío a todo Chile.",
  alternates: { canonical: "/coleccion/regalos" },
  openGraph: {
    title: "Joyas para Regalar | Casa Orfebre",
    description:
      "Encuentra la joya artesanal perfecta para regalar. Piezas únicas hechas a mano por orfebres chilenos verificados.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Joyas para Regalar | Casa Orfebre",
    description:
      "Encuentra la joya artesanal perfecta para regalar. Piezas únicas hechas a mano por orfebres chilenos verificados.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function RegalosPage() {
    const products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        occasions: { some: { slug: "regalo" } },
      },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        specialties: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Colección", url: "/coleccion" },
    { name: "Regalos", url: "/coleccion/regalos" },
  ]);
  const jsonLd = buildCollectionWithItemsJsonLd({
    name: "Joyas para Regalar",
    description: "Encuentra la joya artesanal perfecta para regalar. Piezas únicas hechas a mano por orfebres chilenos verificados.",
    url: "/coleccion/regalos",
    products,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-light sm:text-4xl">
          Joyas para Regalar
        </h1>
        <p className="mt-4 text-text-secondary leading-relaxed">
          Sorprende con un regalo que cuenta una historia. Cada pieza es creada a
          mano por orfebres chilenos, haciendo de tu obsequio algo
          verdaderamente único e irrepetible.
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
            Pronto tendremos piezas ideales para regalar. Explora nuestra{" "}
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
