export const revalidate = 60;
export const dynamic = "force-static";

import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";


export const metadata = {
  title: "Regalos de Joyería Artesanal bajo $50.000 | Casa Orfebre",
  description:
    "El punto dulce entre calidad artesanal y precio justo. Las piezas más buscadas de Casa Orfebre bajo $50.000.",
  alternates: { canonical: "/regalos-bajo-50000" },
  openGraph: {
    title: "Regalos de Joyería Artesanal bajo $50.000 | Casa Orfebre",
    description:
      "El punto dulce entre calidad artesanal y precio justo. Las piezas más buscadas de Casa Orfebre bajo $50.000.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Regalos de Joyería Artesanal bajo $50.000 | Casa Orfebre",
    description:
      "El punto dulce entre calidad artesanal y precio justo. Las piezas más buscadas de Casa Orfebre bajo $50.000.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function RegalosBajo50000Page() {
    const products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        price: { lte: 50000 },
      },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        specialties: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    });

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="pt-20 pb-12">
        <FadeIn>
          <SectionHeading
            title="Regalos bajo $50.000"
            subtitle="El punto dulce entre calidad artesanal y precio justo. Las piezas más buscadas de Casa Orfebre."
            as="h1"
          />
        </FadeIn>
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
            Estamos incorporando más opciones en este rango. Mientras tanto,
            explora nuestra{" "}
            <a href="/coleccion" className="text-accent hover:underline">
              colección completa
            </a>
            .
          </p>
        </div>
      )}
    </section>
  );
}
