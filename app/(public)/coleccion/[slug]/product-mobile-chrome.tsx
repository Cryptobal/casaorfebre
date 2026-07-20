"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { useFavorites } from "@/lib/favorites-context";
import { trackAddToWishlist, type GA4Item } from "@/lib/analytics-events";
import { cn } from "@/lib/utils";

interface ProductMobileChromeProps {
  productId: string;
  ga4Item: Omit<GA4Item, "quantity">;
}

export function ProductMobileChrome({ productId, ga4Item }: ProductMobileChromeProps) {
  const router = useRouter();
  const { status } = useSession();
  const { isFavorite, toggle } = useFavorites();
  const [isPending, startTransition] = useTransition();
  const favorited = isFavorite(productId);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/coleccion");
    }
  }

  function handleFavorite() {
    if (status !== "authenticated") {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!favorited) trackAddToWishlist({ ...ga4Item, quantity: 1 });
    startTransition(async () => {
      await toggle(productId);
    });
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 md:hidden">
      <button
        type="button"
        onClick={handleBack}
        className="glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full text-text"
        aria-label="Volver"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleFavorite}
        disabled={isPending}
        className={cn(
          "glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full",
          favorited ? "text-accent-dark" : "text-text",
        )}
        aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
        aria-pressed={favorited}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={favorited ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>
    </div>
  );
}
