import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { ProductCard } from "@/components/products/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anillos Artesanales | Casa Orfebre",
  description:
    "Anillos artesanales de autor hechos a mano en Chile. Alianzas, anillos statement y piezas únicas en plata 950, oro y piedras naturales. Certificado de autenticidad incluido.",
  alternates: { canonical: "/coleccion/anillos" },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Anillos", url: "/coleccion/anillos" },
]);

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Anillos Artesanales",
  description: "Colección de anillos artesanales de joyería de autor chilena",
  url: "https://casaorfebre.cl/coleccion/anillos",
});

export default async function AnillosPage() {
  const session = await auth();
  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  const products = await prisma.product.findMany({
    where: { status: "APPROVED", category: "ANILLO" },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <script
        type="application/ld+json"
        // Static JSON-LD structured data — no user input, safe to inject
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Anillos Artesanales
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-text-secondary">
            Descubre anillos forjados a mano por los mejores orfebres de Chile.
            Desde alianzas minimalistas en plata 950 hasta anillos statement con
            piedras naturales montadas artesanalmente, cada pieza refleja horas
            de dedicación y un oficio heredado por generaciones. Un anillo de
            autor que llevarás con orgullo.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={favoriteIds.has(product.id)}
            />
          ))}
        </div>
        {products.length === 0 && (
          <p className="py-20 text-center text-text-tertiary">
            Próximamente nuevos anillos en nuestra colección.
          </p>
        )}
      </div>
    </>
  );
}
