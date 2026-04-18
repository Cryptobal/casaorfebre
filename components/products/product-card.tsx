"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { useFavorites } from "@/lib/favorites-context";
import { trackAddToWishlist, trackSelectItem } from "@/lib/analytics-events";
import { formatCLP } from "@/lib/utils";
import { getEditionLabel } from "@/lib/utils/edition";
import type { Product, Artisan, ProductImage, Material } from "@prisma/client";

type ProductWithRelations = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
  materials?: Pick<Material, "id" | "name">[];
};

interface ProductCardProps {
  product: ProductWithRelations;
  /** @deprecated favoritos se hidratan client-side via FavoritesProvider. */
  isFavorited?: boolean;
  /** Lista GA4 para tracking. */
  listName?: string;
  /**
   * Cuando true, el card escala tipográficamente. El ancho real
   * (2 columnas vs 1) lo controla el grid contenedor.
   */
  featured?: boolean;
}

export function ProductCard({ product, listName, featured = false }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const { isFavorite, toggle } = useFavorites();
  const favorited = isFavorite(product.id);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];

  const material = product.materials?.[0]?.name;
  const technique = product.technique;
  const year = product.year;
  const metaParts = [material, technique, year ? String(year) : null].filter(
    (v): v is string => Boolean(v),
  );

  const edition = getEditionLabel(product);

  const ga4Item = {
    item_id: product.id,
    item_name: product.name,
    item_category:
      (product as unknown as { categories?: { name: string }[] }).categories?.[0]
        ?.name ?? "",
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

  const ariaLabel = `Ver pieza: ${product.name}, por ${product.artisan.displayName}`;

  return (
    <Link
      href={`/coleccion/${product.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      onClick={handleSelectItem}
      aria-label={ariaLabel}
    >
      {/* Imagen editorial 4:5 sin overlays sobre la obra. */}
      <div className="relative aspect-[4/5] overflow-hidden bg-background">
        {primaryImage?.url ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder
            name={product.name}
            className="h-full w-full transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
          />
        )}

        {/* Cross-fade a segunda imagen en hover (si existe). */}
        {secondaryImage?.url && (
          <Image
            src={secondaryImage.url}
            alt=""
            fill
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="absolute inset-0 object-cover opacity-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
            aria-hidden
          />
        )}

        {/* Corazón de wishlist: aparece en hover, no se monta sobre la obra por default. */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center text-text transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            favorited
              ? "opacity-100 text-accent"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          } ${isPending ? "opacity-50" : ""}`}
        >
          <Heart
            size={16}
            strokeWidth={1}
            fill={favorited ? "currentColor" : "none"}
            aria-hidden
          />
        </button>
      </div>

      {/* Bloque tipográfico editorial. */}
      <div className="relative mt-5 space-y-1.5">
        {/* Autor: uppercase letter-spaced, gold. */}
        <p
          className={`font-light uppercase tracking-[0.15em] text-accent ${
            featured ? "text-sm" : "text-xs"
          }`}
        >
          {product.artisan.displayName}
        </p>

        {/* Título: Cormorant italic, peso 400. */}
        <h3
          className={`font-serif italic font-normal leading-tight text-text ${
            featured ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"
          }`}
        >
          {product.name}
        </h3>

        {/* Metadata: Material · Técnica · Año. */}
        {metaParts.length > 0 && (
          <p
            className={`font-light text-text-secondary ${
              featured ? "text-sm" : "text-xs"
            }`}
          >
            {metaParts.join(" · ")}
          </p>
        )}

        {/* Edición / tipo de producción. */}
        {edition && (
          <p
            className={`font-light uppercase tracking-[0.15em] text-text-tertiary ${
              featured ? "text-xs" : "text-[11px]"
            }`}
          >
            {edition}
          </p>
        )}

        {/* Precio. */}
        <p
          className={`pt-1 font-normal text-text ${
            featured ? "text-base" : "text-sm"
          }`}
        >
          {formatCLP(product.price)}
        </p>

        {/* Línea dorada editorial que nace en hover. */}
        <span
          aria-hidden
          className="absolute -bottom-2 left-0 block h-px w-0 bg-accent transition-[width] duration-300 ease-out group-hover:w-full"
        />
      </div>
    </Link>
  );
}
