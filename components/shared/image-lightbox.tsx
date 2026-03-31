"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  images: { id: string; url: string; alt: string; status?: string }[];
  productName: string;
}

export function ImageLightbox({ images, productName }: ImageLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i)),
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [openIndex, close, prev, next]);

  if (images.length === 0) {
    return <p className="text-sm text-red-600">Sin imagenes</p>;
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative h-24 w-24 flex-shrink-0 cursor-zoom-in overflow-hidden rounded transition-opacity hover:opacity-80"
          >
            <Image
              src={img.url}
              alt={img.alt}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
            {img.status && img.status !== "APPROVED" && (
              <span className={`absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center text-[9px] font-medium ${
                img.status === "PENDING_REVIEW" ? "bg-amber-500/90 text-white" :
                img.status === "REJECTED" ? "bg-red-500/90 text-white" :
                "bg-gray-500/90 text-white"
              }`}>
                {img.status === "PENDING_REVIEW" ? "Pendiente" : img.status === "REJECTED" ? "Rechazada" : img.status}
              </span>
            )}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                disabled={openIndex === 0}
                className="absolute left-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 disabled:opacity-30"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                disabled={openIndex === images.length - 1}
                className="absolute right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 disabled:opacity-30"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex].url}
              alt={images[openIndex].alt}
              width={1200}
              height={1200}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {images.length > 1 && (
              <p className="mt-2 text-center text-sm text-white/70">
                {openIndex + 1} / {images.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
