import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import type { Product, Artisan, ProductImage, Material } from "@prisma/client";

type CuratorPick = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
  materials?: Pick<Material, "id" | "name">[];
};

interface CuratorPicksSectionProps {
  products: CuratorPick[];
}

/**
 * Selección del Curador — 6 piezas máximo, grid 3x2.
 * Subtítulo firmado por Camila Torres Puga (curaduría firmada = clave editorial).
 */
export function CuratorPicksSection({ products }: CuratorPicksSectionProps) {
  if (products.length === 0) return null;
  const visible = products.slice(0, 6);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 border-b border-[color:var(--color-border-soft)] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-4xl font-light text-text sm:text-5xl">
              Selección del Curador <span className="text-accent">✦</span>
            </h2>
            <p className="mt-3 font-serif text-base font-light italic text-text-secondary">
              Firmada por Camila Torres Puga
            </p>
          </div>
          <Link
            href="/seleccion-del-curador"
            className="text-xs font-light uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-dark"
          >
            Ver toda la selección →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-24">
          {visible.map((product, i) => (
            <FadeIn key={product.id} delay={Math.min(i, 5) * 80}>
              <ProductCard product={product} listName="Selección del Curador" />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
