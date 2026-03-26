import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { ProductCard } from "@/components/products/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colgantes de Autor | Casa Orfebre",
  description:
    "Colgantes artesanales diseñados por orfebres chilenos. Dijes, medallas y colgantes de autor en plata 950, oro y piedras naturales. Piezas únicas con certificado de autenticidad.",
};

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Colgantes de Autor",
  description:
    "Colección de colgantes artesanales de joyería de autor chilena",
  url: "https://casaorfebre.cl/coleccion/colgantes",
});

export default async function ColgantesPage() {
  const session = await auth();
  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  const products = await prisma.product.findMany({
    where: { status: "APPROVED", category: "COLGANTE" },
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
