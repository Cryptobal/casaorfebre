"use client";

import { useState } from "react";

interface Suggestion {
  name: string;
  description: string;
  productIds: string[];
}

export function AiCollectionsButton() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const suggest = async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const res = await fetch("/api/ai/orfebre-collections");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error");
      }
      const data = await res.json();
      if (data.suggestions.length === 0) {
        setError("Necesitas al menos 3 productos para generar sugerencias.");
      } else {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando sugerencias");
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (s: Suggestion) => {
    setCreating(s.name);
    try {
      const res = await fetch("/api/ai/orfebre-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error("Error");
      setCreated((prev) => new Set([...prev, s.name]));
    } catch {
      setError(`Error creando "${s.name}"`);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={suggest}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-[#e8e5df] bg-white px-4 py-2 text-sm font-medium text-[#8B7355] transition-colors hover:bg-[#FAFAF8] disabled:opacity-50"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-[9px] font-bold text-white">AI</span>
        {loading ? "Analizando tus piezas..." : "Sugerir colecciones con IA"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-text-secondary">Sugerencias basadas en tus piezas:</p>
          {suggestions.map((s) => (
            <div key={s.name} className="rounded-lg border border-[#e8e5df] bg-[#FAFAF8] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-text">{s.name}</h4>
                  <p className="mt-0.5 text-sm text-text-secondary">{s.description}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{s.productIds.length} piezas</p>
                </div>
                {created.has(s.name) ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700">Creada</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => createCollection(s)}
                    disabled={creating === s.name}
                    className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                  >
                    {creating === s.name ? "Creando..." : "Crear"}
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-text-tertiary">Recarga la página para ver las colecciones creadas.</p>
        </div>
      )}
    </div>
  );
}
