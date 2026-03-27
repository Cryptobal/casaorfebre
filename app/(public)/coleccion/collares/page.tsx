import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { ProductCard } from "@/components/products/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collares de Autor | Casa Orfebre",
  description:
    "Explora collares artesanales diseñados por orfebres chilenos. Cadenas, gargantillas y collares de autor en plata, cobre y piedras naturales con certificado de autenticidad.",
  alternates: { canonical: "/coleccion/collares" },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Collares", url: "/coleccion/collares" },
]);

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Collares de Autor",
  description: "Colección de collares artesanales de joyería de autor chilena",
  url: "https://casaorfebre.cl/coleccion/collares",
});

export default async function CollaresPage() {
  const session = await auth();
  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  const products = await prisma.product.findMany({
    where: { status: "APPROVED", category: "COLLAR" },
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
            Collares de Autor
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-text-secondary">
            Nuestros collares son creados por orfebres chilenos que dominan
            técnicas tradicionales y contemporáneas. Desde delicadas cadenas en
            plata 950 hasta collares de autor con piedras semipreciosas
            engarzadas a mano, cada pieza es una declaración de estilo y
            artesanía. Perfectos para transformar cualquier look en algo
            verdaderamente único.
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
            Próximamente nuevos collares en nuestra colección.
          </p>
        )}
      </div>
    </>
  );
}
