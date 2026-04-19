import Link from "next/link";
import Image from "next/image";
import { formatCLP } from "@/lib/utils";
import { getEditionLabel } from "@/lib/utils/edition";
import type { Product, Artisan, ProductImage, Material } from "@prisma/client";

type PiezaDelMes = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
  materials?: Pick<Material, "id" | "name">[];
};

interface PiezaDelMesSectionProps {
  product: PiezaDelMes;
}

/**
 * Bloque "Pieza del mes" — full-bleed diptych (imagen izquierda, texto derecha).
 * Estructura según brief editorial v1 §2.6.
 * Si no hay pieza marcada featuredOfMonth, la página home NO renderiza este bloque.
 */
export function PiezaDelMesSection({ product }: PiezaDelMesSectionProps) {
  const img = product.images[0];
  const material = product.materials?.[0]?.name;
  const metaLine = [material, product.technique, product.year ? String(product.year) : null]
    .filter(Boolean)
    .join(" · ");
  const edition = getEditionLabel(product);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[60%_40%]">
      {/* Imagen */}
      <Link
        href={`/coleccion/${product.slug}`}
        className="group relative block aspect-square bg-background lg:aspect-auto"
      >
        {img?.url ? (
          <Image
            src={img.url}
            alt={img.altText ?? product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.02]"
          />
        ) : null}
      </Link>

      {/* Texto */}
      <div className="flex flex-col justify-center bg-background px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
        <p className="text-[11px] font-light uppercase tracking-[0.3em] text-accent">
          Pieza del mes
        </p>

        <h2 className="mt-6 font-serif text-4xl font-light italic leading-tight text-text sm:text-5xl">
          {product.name}
        </h2>

        <p className="mt-3 font-serif text-base font-light text-text-secondary">
          Por {product.artisan.displayName}
        </p>

        {product.curatorNote ? (
          <p className="mt-8 max-w-prose font-serif text-base font-light leading-relaxed text-text">
            {product.curatorNote}
          </p>
        ) : (
          // TODO CONTENIDO: texto curatorial de la Pieza del Mes —
          // Camila o Carlos lo escriben cada vez que rota la pieza.
          <p className="mt-8 max-w-prose font-serif text-base font-light italic leading-relaxed text-text-tertiary">
            Texto curatorial pendiente de editorial.
          </p>
        )}

        <div className="mt-10 space-y-1 text-sm font-light text-text-secondary">
          {metaLine && <p>{metaLine}</p>}
          {edition && <p className="text-text-tertiary">{edition}</p>}
          <p className="pt-2 font-normal text-text">{formatCLP(product.price)}</p>
        </div>

        <div className="mt-10">
          <Link
            href={`/coleccion/${product.slug}`}
            className="inline-block border border-text px-8 py-3 text-sm font-light tracking-wide text-text transition-colors hover:bg-text hover:text-background"
          >
            Ver pieza →
          </Link>
        </div>
      </div>
    </section>
  );
}
