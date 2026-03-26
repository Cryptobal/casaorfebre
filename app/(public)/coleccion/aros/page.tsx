import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { ProductCard } from "@/components/products/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aros Artesanales | Casa Orfebre",
  description:
    "Descubre aros artesanales únicos hechos a mano por orfebres chilenos. Plata 950, cobre y piedras naturales. Piezas de autor con certificado de autenticidad.",
};

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Aros Artesanales",
  description: "Colección de aros artesanales de joyería de autor chilena",
  url: "https://casaorfebre.cl/coleccion/aros",
});

export default async function ArosPage() {
  const session = await auth();
  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  const products = await prisma.product.findMany({
    where: { status: "APPROVED", category: "AROS" },
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Aros Artesanales
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-text-secondary">
            Cada par de aros en nuestra colección es una pieza de autor, creada
            a mano por orfebres chilenos con materiales nobles. Desde diseños
            minimalistas en plata 950 hasta piezas statement con piedras
            naturales, encuentra aros que cuentan una historia.
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
            Próximamente nuevos aros en nuestra colección.
          </p>
        )}
      </div>
    </>
  );
}
