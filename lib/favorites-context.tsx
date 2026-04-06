"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toggleFavorite as toggleFavoriteAction } from "@/lib/actions/favorites";

interface FavoritesContextValue {
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  ready: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setIds(new Set());
      setReady(status === "unauthenticated");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/favorites/ids", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { ids: string[] };
        if (!cancelled) {
          setIds(new Set(data.ids));
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const isFavorite = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    async (productId: string) => {
      // Solo usuarios autenticados pueden marcar favoritos.
      if (status !== "authenticated") return;

      // Optimistic update
      const wasFavorited = ids.has(productId);
      setIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        const result = await toggleFavoriteAction(productId);
        if (result && "error" in result) {
          // Revertir
          setIds((prev) => {
            const next = new Set(prev);
            if (wasFavorited) next.add(productId);
            else next.delete(productId);
            return next;
          });
        }
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) next.add(productId);
          else next.delete(productId);
          return next;
        });
      }
    },
    [ids, status]
  );

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggle, ready }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    // Fallback inerte para componentes renderizados fuera del provider
    return {
      isFavorite: () => false,
      toggle: async () => {},
      ready: false,
    };
  }
  return ctx;
}
