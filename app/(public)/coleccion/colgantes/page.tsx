import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd, buildCollectionWithItemsJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductCard } from "@/components/products/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colgantes de Autor | Casa Orfebre",
  description:
    "Colgantes artesanales diseñados por orfebres chilenos. Dijes, medallas y colgantes de autor en plata 950, oro y piedras naturales. Piezas únicas con certificado de autenticidad.",
  alternates: { canonical: "/coleccion/colgantes" },
  openGraph: {
    title: "Colgantes de Autor | Casa Orfebre",
    description:
      "Colgantes artesanales diseñados por orfebres chilenos. Dijes, medallas y colgantes de autor en plata 950, oro y piedras naturales.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colgantes de Autor | Casa Orfebre",
    description:
      "Colgantes artesanales diseñados por orfebres chilenos. Dijes, medallas y colgantes de autor en plata 950, oro y piedras naturales.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Colgantes", url: "/coleccion/colgantes" },
]);

export default async function ColgantesPage() {
  const session = await auth();
  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  const products = await prisma.product.findMany({
    where: { status: "APPROVED", categories: { some: { slug: "colgante" } } },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { publishedAt: "desc" },
  });

  const jsonLd = buildCollectionWithItemsJsonLd({
    name: "Colgantes de Autor",
    description: "Colección de colgantes artesanales de joyería de autor chilena",
    url: "/coleccion/colgantes",
    products,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Colgantes de Autor
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-text-secondary">
            Los colgantes son la expresión más personal de la joyería: una pieza
            que llevas cerca del corazón. Nuestra colección reúne dijes,
            medallas y colgantes esculturales creados por orfebres chilenos con
            técnicas de fundición, calado y engaste artesanal. En plata 950, oro
            y piedras naturales, cada colgante es una obra de arte en miniatura.
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
            Próximamente nuevos colgantes en nuestra colección.
          </p>
        )}
      </div>
    </>
  );
}
