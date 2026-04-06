export const revalidate = 120;

import Link from "next/link";
import Image from "next/image";
import { getCuratorPicks } from "@/lib/queries/products";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { PriceDisplay } from "@/components/shared/price-display";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

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
              <Link href={`/coleccion/${product.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background">
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <ImagePlaceholder name={product.name} className="h-full w-full" />
                  )}

                  {/* Curator badge */}
                  <span className="absolute left-3 top-3 rounded-full bg-[#8B7355]/80 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                    Selección del Curador ✦
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-light text-text-tertiary">
                    {product.artisan.displayName}
                  </p>
                  <h2 className="font-serif text-lg font-medium text-text">
                    {product.name}
                  </h2>
                  <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
                </div>

                {product.curatorNote && (
                  <blockquote className="mt-3 border-l-2 border-accent/30 pl-3 text-sm italic text-text-secondary">
                    「{product.curatorNote}」
                  </blockquote>
                )}
              </Link>
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
