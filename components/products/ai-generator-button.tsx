"use client";

import { useState, useCallback } from "react";
import type { ProductListing } from "@/lib/ai/product-generator";

interface AIGeneratorButtonProps {
  imageUrls: string[];
  artisanName: string;
  onApply: (listing: ProductListing) => void;
}

export function AIGeneratorButton({ imageUrls, artisanName, onApply }: AIGeneratorButtonProps) {
  const [open, setOpen] = useState(false);
  const [extraContext, setExtraContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<ProductListing | null>(null);

  const disabled = imageUrls.length === 0;

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setListing(null);

    try {
      const res = await fetch("/api/ai/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls: imageUrls.slice(0, 4),
          artisanName,
          extraContext: extraContext.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error al generar" }));
        throw new Error(data.error || "Error al generar el listado");
      }

      const data = await res.json();
      setListing(data.listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar el listado");
    } finally {
      setLoading(false);
    }
  }, [imageUrls, artisanName, extraContext]);

  const handleApply = useCallback(() => {
    if (!listing) return;
    onApply(listing);
    setOpen(false);
    setListing(null);
    setExtraContext("");
  }, [listing, onApply]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setListing(null);
    setError(null);
    setExtraContext("");
  }, []);

  return (
    <>
      {/* Trigger button */}
      <div className="relative inline-block">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-[#8B7355] px-4 py-2 text-sm font-medium text-[#8B7355] transition-colors hover:bg-[#8B7355] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          title={disabled ? "Sube al menos una foto primero" : "Generar listado con IA"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Generar con IA
        </button>
      </div>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-lg rounded-lg border border-[#e8e5df] bg-[#FAFAF8] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e8e5df] px-5 py-4">
              <h3 className="font-serif text-lg font-semibold text-text">
                Generar con IA
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-text-tertiary hover:text-text"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {!listing && !loading && (
                <>
                  <p className="text-sm text-text-secondary">
                    La IA analizará {imageUrls.length} foto{imageUrls.length !== 1 ? "s" : ""} y generará un borrador de listado que puedes editar.
                  </p>
                  <div className="mt-4 space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={extraContext}
                      onChange={(e) => setExtraContext(e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-[#e8e5df] bg-white px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:ring-offset-1"
                      placeholder="Ej: inspirada en el mar de Chiloé, hecha con plata reciclada..."
                    />
                  </div>
                </>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <svg className="h-8 w-8 animate-spin text-[#8B7355]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-text-secondary">Analizando tus fotos y generando descripción...</p>
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {listing && !loading && (
                <div className="space-y-4">
                  {/* Title preview */}
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Título</span>
                    <p className="mt-0.5 font-serif text-lg font-semibold text-text">{listing.title}</p>
                  </div>

                  {/* Description preview */}
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Descripción</span>
                    <p className="mt-0.5 text-sm leading-relaxed text-text-secondary line-clamp-3">
                      {listing.description}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#f0ede8] px-2.5 py-1 text-xs font-medium text-[#8B7355]">
                      {listing.suggestedCategory}
                    </span>
                    {listing.suggestedMaterials.map((m) => (
                      <span key={m} className="rounded-full bg-[#f0ede8] px-2.5 py-1 text-xs font-medium text-[#8B7355]">
                        {m}
                      </span>
                    ))}
                    <span className="rounded-full bg-[#f0ede8] px-2.5 py-1 text-xs font-medium text-[#8B7355]">
                      {listing.suggestedTechnique}
                    </span>
                    <span className="rounded-full bg-[#f0ede8] px-2.5 py-1 text-xs font-medium text-[#8B7355]">
                      {listing.suggestedStyle}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-[#e8e5df] px-5 py-3">
              {!listing && !loading && (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:text-text"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="rounded-md bg-[#8B7355] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#7a6548]"
                  >
                    Generar
                  </button>
                </>
              )}

              {listing && !loading && (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:text-text"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#8B7355] px-3 py-1.5 text-sm font-medium text-[#8B7355] transition-colors hover:bg-[#8B7355] hover:text-white"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Regenerar
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#8B7355] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#7a6548]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Aplicar al formulario
                  </button>
                </>
              )}

              {error && !loading && (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:text-text"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="rounded-md bg-[#8B7355] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#7a6548]"
                  >
                    Reintentar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
