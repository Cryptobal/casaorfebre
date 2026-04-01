"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { CollectionSuggestion } from "@/lib/ai/collections";

interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  curatedAt: string | null;
  createdAt: string;
  _count: { products: number };
}

interface CuratedCollectionsManagerProps {
  initialCollections: CollectionRow[];
}

export function CuratedCollectionsManager({ initialCollections }: CuratedCollectionsManagerProps) {
  const router = useRouter();
  const [collections, setCollections] = useState(initialCollections);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<CollectionSuggestion[] | null>(null);
  const [creatingIndex, setCreatingIndex] = useState<number | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSuggest = useCallback(async () => {
    setSuggesting(true);
    setError(null);
    setSuggestions(null);

    try {
      const res = await fetch("/api/ai/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(data.error);
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar sugerencias");
    } finally {
      setSuggesting(false);
    }
  }, []);

  const handleCreate = useCallback(async (suggestion: CollectionSuggestion, index: number) => {
    setCreatingIndex(index);
    setError(null);

    try {
      const res = await fetch("/api/ai/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-from-suggestion", suggestion }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(data.error);
      }
      const data = await res.json();
      setCollections((prev) => [data.collection, ...prev]);
      setSuggestions((prev) => prev?.filter((_, i) => i !== index) ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear colección");
    } finally {
      setCreatingIndex(null);
    }
  }, [router]);

  const handleRefresh = useCallback(async (collectionId: string) => {
    setRefreshingId(collectionId);
    setError(null);

    try {
      const res = await fetch("/api/ai/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh", collectionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(data.error);
      }
      const data = await res.json();
      alert(`Actualizado: +${data.stats.added} agregados, -${data.stats.removed} removidos. Total: ${data.stats.total}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setRefreshingId(null);
    }
  }, [router]);

  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/curated-collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setCollections((prev) =>
          prev.map((c) => c.id === id ? { ...c, isActive: !isActive } : c)
        );
      }
    } finally {
      setTogglingId(null);
    }
  }, []);

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Suggest button */}
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          loading={suggesting}
          disabled={suggesting}
          onClick={handleSuggest}
        >
          {suggesting ? "Analizando catálogo..." : "Sugerir colecciones con IA"}
        </Button>
        <p className="text-xs text-text-tertiary">
          Analiza productos aprobados y sugiere 5 colecciones temáticas
        </p>
      </div>

      {/* Suggestions panel */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-4 rounded-lg border border-accent/30 bg-accent/5 p-4">
          <h2 className="font-serif text-lg font-medium text-text">Sugerencias de IA</h2>
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-text">{s.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                    {s.description}
                  </p>
                  <p className="mt-2 text-xs text-text-tertiary">
                    {s.productIds.length} productos
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  loading={creatingIndex === i}
                  disabled={creatingIndex !== null}
                  onClick={() => handleCreate(s, i)}
                >
                  Crear
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing collections */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-medium text-text">
          Colecciones existentes ({collections.length})
        </h2>

        {collections.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            No hay colecciones curadas. Usa el botón de arriba para generar sugerencias.
          </p>
        ) : (
          <div className="space-y-2">
            {collections.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text">{c.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.isActive ? "Visible" : "Oculta"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {c._count.products} productos &middot; /{c.slug}
                    {c.curatedAt && ` \u00b7 Curada ${new Date(c.curatedAt).toLocaleDateString("es-CL")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={togglingId === c.id}
                    onClick={() => handleToggleActive(c.id, c.isActive)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-background disabled:opacity-50"
                  >
                    {c.isActive ? "Ocultar" : "Publicar"}
                  </button>
                  <button
                    type="button"
                    disabled={refreshingId === c.id}
                    onClick={() => handleRefresh(c.id)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-background disabled:opacity-50"
                  >
                    {refreshingId === c.id ? "..." : "Actualizar productos"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
