"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/favorites-context";
import { trackAddToWishlist, type GA4Item } from "@/lib/analytics-events";

interface FavoriteButtonProps {
  productId: string;
  ga4Item?: Omit<GA4Item, "quantity">;
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Botón "Guardar" editorial.
 * - variant="icon": sólo icono (para ficha al lado del carrito).
 * - variant="full": icono + texto "Guardar" / "Guardada".
 * Si el usuario no está logueado, redirige a /login preservando la página actual.
 */
export function FavoriteButton({
  productId,
  ga4Item,
  variant = "full",
  className = "",
}: FavoriteButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isFavorite, toggle } = useFavorites();
  const favorited = isFavorite(productId);

  function handleClick() {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/",
      );
      router.push(`/login?callbackUrl=${next}`);
      return;
    }
    if (!favorited && ga4Item) {
      trackAddToWishlist({ ...ga4Item, quantity: 1 });
    }
    startTransition(async () => {
      await toggle(productId);
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        aria-pressed={favorited}
        className={`inline-flex h-12 w-12 items-center justify-center border border-text transition-colors disabled:opacity-60 ${
          favorited
            ? "bg-text text-background hover:bg-text-secondary"
            : "text-text hover:bg-text hover:text-background"
        } ${className}`}
      >
        <Heart
          size={18}
          strokeWidth={1.25}
          fill={favorited ? "currentColor" : "none"}
          aria-hidden
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      className={`inline-flex items-center justify-center gap-2 border border-text px-6 py-3 text-sm font-light tracking-wide transition-colors disabled:opacity-60 ${
        favorited
          ? "bg-text text-background hover:bg-text-secondary"
          : "text-text hover:bg-text hover:text-background"
      } ${className}`}
    >
      <Heart
        size={16}
        strokeWidth={1.25}
        fill={favorited ? "currentColor" : "none"}
        aria-hidden
      />
      <span>{favorited ? "Guardada" : "Guardar"}</span>
    </button>
  );
}
