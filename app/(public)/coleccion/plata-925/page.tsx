export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joyería en Plata 925 | Casa Orfebre",
  description:
    "Joyas artesanales en plata 925 y plata 950 hechas a mano por orfebres chilenos. Anillos, collares, aros y pulseras con certificado de autenticidad. Envío a todo Chile.",
  alternates: { canonical: "/coleccion/plata-925" },
  openGraph: {
    title: "Joyería en Plata 925 | Casa Orfebre",
    description:
      "Joyas artesanales en plata 925 y plata 950 hechas a mano por orfebres chilenos. Anillos, collares, aros y pulseras con certificado de autenticidad. Envío a todo Chile.",
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Plata 925", url: "/coleccion/plata-925" },
]);

export default async function Plata925Page() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        materials: { hasSome: ["Plata 925", "Plata 950", "Plata"] },
      },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        specialty: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // Static JSON-LD structured data — no user input, safe to inject
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Joyería en Plata
          </h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            La plata es el metal noble por excelencia de la orfebrería chilena.
            Nuestros orfebres trabajan con plata 925 y 950 para crear piezas que
            combinan tradición y diseño contemporáneo. Desde delicados anillos
            hasta collares de autor, cada pieza de plata lleva la firma de su
            creador y un certificado de autenticidad que garantiza su calidad.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 60}>
                <ProductCard
                  product={product}
                  isFavorited={favoriteIds.has(product.id)}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-sm text-text-secondary">
              Pronto tendremos piezas en Plata 925 disponibles. Explora nuestra{" "}
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
