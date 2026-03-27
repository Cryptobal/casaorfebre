import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { ProductCard } from "@/components/products/product-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pulseras Artesanales | Casa Orfebre",
  description:
    "Pulseras artesanales de autor hechas a mano por orfebres chilenos. Brazaletes, cadenas y pulseras rígidas en plata 950, cobre y materiales nobles. Envío a todo Chile.",
  alternates: { canonical: "/coleccion/pulseras" },
  openGraph: {
    title: "Pulseras Artesanales | Casa Orfebre",
    description:
      "Pulseras artesanales de autor hechas a mano por orfebres chilenos. Brazaletes, cadenas y pulseras rígidas en plata 950, cobre y materiales nobles.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulseras Artesanales | Casa Orfebre",
    description:
      "Pulseras artesanales de autor hechas a mano por orfebres chilenos. Brazaletes, cadenas y pulseras rígidas en plata 950, cobre y materiales nobles.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Pulseras", url: "/coleccion/pulseras" },
]);

const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Pulseras Artesanales",
  description:
    "Colección de pulseras artesanales de joyería de autor chilena",
  url: "https://casaorfebre.cl/coleccion/pulseras",
});

export default async function PulserasPage() {
  const session = await auth();
  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  const products = await prisma.product.findMany({
    where: { status: "APPROVED", category: "PULSERA" },
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
            Pulseras Artesanales
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-text-secondary">
            Explora nuestra selección de pulseras creadas por orfebres chilenos
            con dedicación y maestría. Brazaletes texturados, pulseras de
            eslabones en plata 950 y diseños rígidos con acabados únicos: cada
            pieza se adapta a tu muñeca y a tu estilo. Joyería de autor que se
            siente tan bien como se ve.
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
            Próximamente nuevas pulseras en nuestra colección.
          </p>
        )}
      </div>
    </>
  );
}
