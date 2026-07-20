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
  /** Optional curator note rendered under the card (curator pages). */
  curatorNote?: string | null;
}

export function ProductCard({ product, listName, curatorNote }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const { isFavorite, toggle } = useFavorites();
  const favorited = isFavorite(product.id);
  const favoriteCount = product.favoriteCount;

  const badge = product.productionType === "MADE_TO_ORDER"
    ? "Hecha por Encargo"
    : product.productionType === "UNIQUE"
      ? "Pieza Única"
      : product.productionType === "LIMITED" && product.stock < 10
        ? `Quedan ${product.stock}`
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
    <div className="group relative">
      <Link href={`/coleccion/${product.slug}`} className="block" onClick={handleSelectItem}>
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
          {curatorNote && (
            <blockquote className="mt-2 border-l-2 border-accent/30 pl-3 text-xs italic text-text-secondary line-clamp-2">
              {curatorNote}
            </blockquote>
          )}
        </div>
      </Link>

      {/* Top overlay row — un solo contenedor: badge a la izquierda, corazón +
          contador unificados a la derecha. `pointer-events-none` deja pasar el
          clic al enlace/imagen; los hijos interactivos lo recuperan. El corazón
          es hermano del <a> (no anidado) para markup válido y foco predecible. */}
      <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex items-start justify-between gap-2">
        {/* Badge izquierdo — cede espacio con elipsis solo en casos extremos */}
        {product.isCuratorPick ? (
          <span className="min-w-0 truncate rounded-full bg-accent/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
            Selección del Curador ✦
          </span>
        ) : badge ? (
          <span className="min-w-0 truncate rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary backdrop-blur-sm">
            {badge}
          </span>
        ) : null}

        {/* Corazón + contador en un solo chip. Área táctil ≥44px via ::before. */}
        <button
          type="button"
          className={`pointer-events-auto relative ml-auto flex h-8 shrink-0 items-center justify-center gap-1 rounded-full backdrop-blur-sm transition-colors before:absolute before:-inset-1.5 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            favoriteCount > 0 ? "px-2.5" : "w-8"
          } ${favorited ? "text-accent" : "text-text-tertiary hover:text-accent"} ${
            isPending ? "opacity-50" : ""
          }`}
          style={{ backgroundColor: "rgba(250,250,248,.82)" }}
          onClick={handleToggleFavorite}
          aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={favorited}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={favorited ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className="shrink-0"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {favoriteCount > 0 && (
            <span className="text-[11px] leading-none tabular-nums" aria-hidden>
              {favoriteCount >= 100 ? "99+" : favoriteCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
