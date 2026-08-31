"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/use-focus-trap";
import type { GalleryProductPhoto } from "@/lib/queries/home-content";

type ProductPhotoPickerProps = {
  open: boolean;
  photos: GalleryProductPhoto[];
  slotsLeft: number;
  busy: boolean;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
};

export function ProductPhotoPicker({
  open,
  photos,
  slotsLeft,
  busy,
  onClose,
  onConfirm,
}: ProductPhotoPickerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useFocusTrap(open, panelRef, onClose);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelected(new Set());
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return photos;
    return photos.filter(
      (photo) =>
        photo.productName.toLowerCase().includes(needle) ||
        photo.suggestedCaption.toLowerCase().includes(needle)
    );
  }, [photos, query]);

  function toggle(id: string, inGallery: boolean) {
    if (inGallery || busy) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= slotsLeft) return prev;
      next.add(id);
      return next;
    });
  }

  if (typeof window === "undefined" || !open) return null;

  const count = selected.size;
  const canAdd = count > 0 && !busy && slotsLeft > 0;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="absolute inset-0 bg-black/50" onClick={busy ? undefined : onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-2xl bg-surface shadow-2xl focus:outline-none md:inset-y-8 md:left-1/2 md:right-auto md:w-[min(720px,calc(100vw-2rem))] md:-translate-x-1/2 md:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <h2 id={titleId} className="font-serif text-xl font-light">
            Elegir de productos
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-background hover:text-text disabled:opacity-40"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="border-b border-border px-4 py-3 sm:px-5">
          <label className="sr-only" htmlFor={`${titleId}-search`}>
            Buscar producto
          </label>
          <input
            id={`${titleId}-search`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o material"
            className="min-h-12 w-full rounded-md border border-border bg-background px-3 text-base text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="mt-2 text-sm text-text-secondary">
            {slotsLeft <= 0
              ? "La galería está llena. Borra alguna foto para agregar más."
              : `Puedes agregar hasta ${slotsLeft} ${slotsLeft === 1 ? "foto" : "fotos"}.`}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {photos.length === 0
                ? "Todavía no hay fotos de productos aprobadas."
                : "No hay fotos que coincidan con la búsqueda."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((photo) => {
                const isSelected = selected.has(photo.id);
                const disabled =
                  photo.inGallery ||
                  busy ||
                  (!isSelected && selected.size >= slotsLeft);
                return (
                  <li key={photo.id}>
                    <button
                      type="button"
                      onClick={() => toggle(photo.id, photo.inGallery)}
                      disabled={disabled && !isSelected}
                      aria-pressed={isSelected}
                      className={`flex w-full flex-col overflow-hidden rounded-md border text-left transition-colors ${
                        isSelected
                          ? "border-accent ring-2 ring-accent"
                          : photo.inGallery
                            ? "border-border opacity-50"
                            : "border-border hover:border-accent"
                      }`}
                    >
                      <span className="relative block aspect-square bg-surface-alt">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.productName}
                          className="h-full w-full object-cover"
                        />
                        <span
                          className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-sm border text-xs ${
                            isSelected || photo.inGallery
                              ? "border-accent bg-accent text-white"
                              : "border-white bg-white/80 text-transparent"
                          }`}
                          aria-hidden
                        >
                          ✓
                        </span>
                      </span>
                      <span className="block truncate px-2 pt-2 text-sm text-text">
                        {photo.productName}
                      </span>
                      <span className="block truncate px-2 pb-2 text-xs text-text-tertiary">
                        {photo.inGallery ? "Ya en la galería" : photo.suggestedCaption}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex gap-2 border-t border-border px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex min-h-12 flex-1 items-center justify-center rounded-md border border-border text-base font-medium text-text hover:border-accent hover:text-accent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm([...selected])}
            disabled={!canAdd}
            className="flex min-h-12 flex-1 items-center justify-center rounded-md bg-accent px-5 text-base font-medium text-white hover:bg-accent-dark disabled:pointer-events-none disabled:opacity-50"
          >
            {busy
              ? "Agregando…"
              : count === 0
                ? "Agregar"
                : count === 1
                  ? "Agregar 1 foto"
                  : `Agregar ${count} fotos`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
