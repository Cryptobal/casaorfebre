"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { PriceDisplay } from "@/components/shared/price-display";
import { toggleFavorite } from "@/lib/actions/favorites";
import type { Product, Artisan, ProductImage } from "@prisma/client";

type ProductWithRelations = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
};

interface ProductCardProps {
  product: ProductWithRelations;
  isFavorited?: boolean;
}

export function ProductCard({ product, isFavorited = false }: ProductCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const badge = product.isCustomMade
    ? "Personalizada"
    : product.isUnique
      ? "Pieza Única"
      : product.editionSize
        ? `Ed. Limitada ${product.stock}/${product.editionSize}`
        : null;

  function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await toggleFavorite(product.id);
      router.refresh();
    });
  }

  return (
    <Link href={`/coleccion/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background">
        <ImagePlaceholder name={product.name} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />

        {/* Favorite heart */}
        <button
          className={`absolute right-3 top-3 rounded-full bg-surface/80 p-2 backdrop-blur-sm transition-colors ${
            isFavorited ? "text-accent" : "text-text-tertiary hover:text-accent"
          } ${isPending ? "opacity-50" : ""}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorited ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Badge */}
        {badge && (
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
        <p className="text-xs text-text-tertiary">
          {product.materials[0]}
        </p>
        <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
      </div>
    </Link>
  );
}
