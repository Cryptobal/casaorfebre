export const revalidate = 120;
export const dynamic = "force-static";

import { getCuratorPicks } from "@/lib/queries/products";
import { FadeIn } from "@/components/shared/fade-in";
import { ProductCard } from "@/components/products/product-card";

export const metadata = {
  title: "Selección del Curador — Lo Mejor de Casa Orfebre",
  description:
    "Piezas de joyería artesanal elegidas a mano. Cada selección es curada por nuestro equipo por su calidad, diseño y técnica excepcional.",
  alternates: { canonical: "/seleccion-del-curador" },
  openGraph: {
    title: "Selección del Curador — Lo Mejor de Casa Orfebre",
    description:
      "Piezas de joyería artesanal elegidas a mano. Cada selección es curada por nuestro equipo por su calidad, diseño y técnica excepcional.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Selección del Curador | Casa Orfebre",
    description:
      "Piezas de joyería artesanal elegidas a mano por nuestro equipo.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function SeleccionDelCuradorPage() {
    const picks = await getCuratorPicks();

  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-light text-text sm:text-4xl">
          Selección del Curador <span className="text-accent">✦</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          Piezas elegidas a mano por nuestro equipo. Lo mejor de la joyería artesanal chilena.
        </p>
      </div>

      {picks.length > 0 ? (
        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2">
          {picks.map((product, i) => (
            <FadeIn key={product.id} delay={i * 100}>
              <ProductCard
                product={product}
                curatorNote={product.curatorNote}
                listName="Selección del Curador"
              />
            </FadeIn>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            Pronto publicaremos nuestras selecciones curadas.
          </p>
        </div>
      )}
    </section>
  );
}
