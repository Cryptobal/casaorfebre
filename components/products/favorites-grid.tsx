import { ProductCard } from "@/components/products/product-card";
import type { Product, Artisan, ProductImage } from "@prisma/client";

type FavoriteProduct = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
};

/**
 * Grilla compartida de piezas favoritas. La usa la página pública
 * `/favoritos` (chrome de tienda). El estado de favorito de cada card se
 * hidrata client-side vía `FavoritesProvider`.
 */
export function FavoritesGrid({ products }: { products: FavoriteProduct[] }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} listName="Favoritos" />
      ))}
    </div>
  );
}
