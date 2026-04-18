"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { PriceDisplay } from "@/components/shared/price-display";
import { ReviewHighlights } from "@/components/products/review-highlights";
import { useFavorites } from "@/lib/favorites-context";
import { trackAddToWishlist, trackSelectItem } from "@/lib/analytics-events";
import type { Product, Artisan, ProductImage, Material } from "@prisma/client";

type ProductWithRelations = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
  materials?: Pick<Material, "id" | "name">[];
};

interface ProductCardProps {
  product: ProductWithRelations;
  /** @deprecated favoritos se hidratan client-side via FavoritesProvider */
  isFavorited?: boolean;
  listName?: string;
}

export function ProductCard({ product, listName }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const { isFavorite, toggle } = useFavorites();
  const favorited = isFavorite(product.id);

  // En grid editorial no mostramos stock ("Quedan X" es lenguaje de Ripley).
  // Los badges de tipo de producción se mantienen; el indicador de escasez
  // sólo aparece en la ficha del producto (stock === 1 → "Última disponible").
  const badge = product.productionType === "MADE_TO_ORDER"
    ? "Hecha por Encargo"
    : product.productionType === "UNIQUE"
      ? "Pieza Única"
      : null;

  const ga4Item = {
    item_id: product.id,
    item_name: product.name,
    item_category: (product as unknown as { categories?: { name: string }[] }).categories?.[0]?.name ?? "",
    item_brand: product.artisan.displayName,
    price: product.price,
    quantity: 1,
  };

  function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!favorited) trackAddToWishlist(ga4Item);
    startTransition(async () => {
      await toggle(product.id);
    });
  }

  function handleSelectItem() {
    if (listName) trackSelectItem(listName, ga4Item);
  }

  return (
    <Link href={`/coleccion/${product.slug}`} className="group block" onClick={handleSelectItem}>
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background">
        {product.images[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder name={product.name} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        )}

        {/* Favorite heart */}
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            className={`rounded-full bg-surface/80 p-2 backdrop-blur-sm transition-colors ${
              favorited ? "text-accent" : "text-text-tertiary hover:text-accent"
            } ${isPending ? "opacity-50" : ""}`}
            onClick={handleToggleFavorite}
            aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={favorited ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          {product.favoriteCount > 0 && (
            <span className="rounded-full bg-surface/80 px-1.5 py-0.5 text-[10px] text-text-tertiary backdrop-blur-sm">
              {product.favoriteCount >= 100 ? "99+" : product.favoriteCount}
            </span>
          )}
        </div>

        {/* Curator Pick Badge */}
        {product.isCuratorPick && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#8B7355]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
            Selección del Curador ✦
          </span>
        )}

        {/* Badge */}
        {badge && !product.isCuratorPick && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="text-xs font-light text-text-tertiary">
          {product.artisan.displayName}
        </p>
        <h3 className="font-serif text-base font-medium text-text">
          {product.name}
        </h3>
        {product.materials?.[0] && (
          <p className="text-xs text-text-tertiary">
            {product.materials[0].name}
          </p>
        )}
        <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
        <ReviewHighlights highlights={product.reviewHighlights as string[] | null} max={2} />
      </div>
    </Link>
  );
}
