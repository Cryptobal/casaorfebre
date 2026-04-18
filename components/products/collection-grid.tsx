import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import type { Product, Artisan, ProductImage, Material } from "@prisma/client";

type ProductForCard = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
  materials?: Pick<Material, "id" | "name">[];
};

interface CollectionGridProps {
  products: ProductForCard[];
  listName?: string;
  /**
   * Cada cuántas piezas se promueve una a featured (2 columnas en desktop).
   * Pone ritmo editorial al grid. Default: 9.
   */
  featuredEvery?: number;
}

/**
 * Grid editorial de piezas.
 * - Mobile: 1 columna, gap-y-16.
 * - Tablet: 2 columnas, gap-x-8 gap-y-20.
 * - Desktop: 3 columnas, gap-x-12 gap-y-24.
 * - Cada N piezas una se marca featured (spans 2 col en desktop).
 */
export function CollectionGrid({
  products,
  listName,
  featuredEvery = 9,
}: CollectionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-24">
      {products.map((product, i) => {
        // Promueve cada Nth pieza (i=N-1, 2N-1, ...) a featured.
        const isFeatured =
          featuredEvery > 0 && i > 0 && (i + 1) % featuredEvery === 0;

        return (
          <FadeIn
            key={product.id}
            delay={Math.min(i, 8) * 60}
            className={isFeatured ? "lg:col-span-2" : undefined}
          >
            <ProductCard
              product={product}
              listName={listName}
              featured={isFeatured}
            />
          </FadeIn>
        );
      })}
    </div>
  );
}
