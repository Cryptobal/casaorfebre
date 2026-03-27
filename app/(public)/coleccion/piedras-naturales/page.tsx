export const revalidate = 300;

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joyas con Piedras Naturales | Casa Orfebre",
  description:
    "Joyería artesanal con piedras naturales chilenas: lapislázuli, cuarzo, turquesa y más. Engaste artesanal por orfebres verificados. Piezas únicas con certificado.",
  alternates: { canonical: "/coleccion/piedras-naturales" },
  openGraph: {
    title: "Joyas con Piedras Naturales | Casa Orfebre",
    description:
      "Joyería artesanal con piedras naturales chilenas: lapislázuli, cuarzo, turquesa y más. Engaste artesanal por orfebres verificados. Piezas únicas con certificado.",
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Inicio", url: "/" },
  { name: "Colección", url: "/coleccion" },
  { name: "Piedras Naturales", url: "/coleccion/piedras-naturales" },
]);

export default async function PiedrasNaturalesPage() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        materials: {
          hasSome: [
            "Piedras Naturales",
            "Cuarzo",
            "Turquesa",
            "Ágata",
            "Amatista",
            "Ojo de Tigre",
          ],
        },
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
            Joyas con Piedras Naturales
          </h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Las piedras naturales aportan color, energía y significado a cada
            joya. Nuestros orfebres seleccionan y engastan a mano cuarzos,
            turquesas, ágatas y otras gemas para crear piezas verdaderamente
            únicas. Cada piedra es diferente, haciendo que tu joya sea
            irrepetible por naturaleza.
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
              Pronto tendremos piezas con piedras naturales disponibles. Explora
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
