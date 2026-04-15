"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCLP } from "@/lib/utils";

interface CollectionProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: string;
  images: { url: string }[];
  artisan: { displayName: string };
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: string;
  image: string | null;
  artisanName: string;
}

interface CollectionProductsManagerProps {
  collectionId: string;
  initialProducts: CollectionProduct[];
}

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Publicado",
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pendiente",
  PAUSED: "Pausado",
  REJECTED: "Rechazado",
};

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  PAUSED: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function CollectionProductsManager({
  collectionId,
  initialProducts,
}: CollectionProductsManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<CollectionProduct[]>(initialProducts);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const existingIds = new Set(products.map((p) => p.id));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/admin/curated-collections/${collectionId}/search-products?q=${encodeURIComponent(query.trim())}`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products ?? []);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, collectionId]);

  const handleAdd = useCallback(
    async (product: SearchResult) => {
      setAddingId(product.id);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/curated-collections/${collectionId}/products`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          },
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Error" }));
          throw new Error(data.error);
        }
        setProducts((prev) => [
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            status: product.status,
            images: product.image ? [{ url: product.image }] : [],
            artisan: { displayName: product.artisanName },
          },
          ...prev,
        ]);
        setResults((prev) => prev.filter((p) => p.id !== product.id));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al agregar");
      } finally {
        setAddingId(null);
      }
    },
    [collectionId, router],
  );

  const handleRemove = useCallback(
    async (productId: string) => {
      setRemovingId(productId);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/curated-collections/${collectionId}/products?productId=${productId}`,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Error" }));
          throw new Error(data.error);
        }
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al quitar");
      } finally {
        setRemovingId(null);
      }
    },
    [collectionId, router],
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add products */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="font-serif text-lg font-medium text-text">
          Agregar piezas
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Busca por nombre, orfebre o categoría para añadir piezas a esta colección.
        </p>
        <div className="mt-3">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar piezas…"
          />
        </div>

        {query.trim() && (
          <div className="mt-3 space-y-2">
            {searching ? (
              <p className="text-xs text-text-tertiary">Buscando…</p>
            ) : results.length === 0 ? (
              <p className="text-xs text-text-tertiary">Sin resultados.</p>
            ) : (
              results.map((r) => {
                const alreadyIn = existingIds.has(r.id);
                return (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background p-3 sm:flex-nowrap"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
                      {r.image ? (
                        <Image
                          src={r.image}
                          alt={r.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="h-full w-full bg-border/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">
                        {r.name}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                        <span>{r.artisanName}</span>
                        <span>·</span>
                        <span>{formatCLP(r.price)}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {STATUS_LABELS[r.status] ?? r.status}
                        </span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyIn ? "ghost" : "primary"}
                      disabled={alreadyIn || addingId === r.id}
                      loading={addingId === r.id}
                      onClick={() => handleAdd(r)}
                      className="w-full sm:w-auto"
                    >
                      {alreadyIn ? "En colección" : "Agregar"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Current products */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-medium text-text">
          Piezas en esta colección ({products.length})
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            Esta colección aún no tiene piezas. Agrega una desde el buscador de
            arriba.
          </p>
        ) : (
          <ul className="space-y-2">
            {products.map((p) => {
              const isApproved = p.status === "APPROVED";
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-3 sm:flex-nowrap"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-background">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="h-full w-full bg-border/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {p.name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                      <span>{p.artisan.displayName}</span>
                      <span>·</span>
                      <span>{formatCLP(p.price)}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                      {!isApproved && (
                        <span className="text-[10px] text-amber-700">
                          (no visible al público)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <a
                      href={`/coleccion/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-secondary underline-offset-2 hover:text-accent hover:underline"
                    >
                      Ver
                    </a>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={removingId === p.id}
                      loading={removingId === p.id}
                      onClick={() => handleRemove(p.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
