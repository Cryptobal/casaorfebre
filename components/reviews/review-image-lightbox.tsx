"use client";

import { useState } from "react";
import Image from "next/image";

interface ReviewImageLightboxProps {
  images: string[];
}

export function ReviewImageLightbox({ images }: ReviewImageLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="mt-3 flex gap-2">
        {images.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="relative h-[60px] w-[60px] overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
          >
            <Image
              src={url}
              alt={`Foto de opinion ${index + 1}`}
              fill
              className="object-cover"
              sizes="60px"
            />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="relative max-h-[80vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[openIndex]}
              alt={`Foto de opinion ${openIndex + 1}`}
              width={800}
              height={800}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
              sizes="90vw"
            />
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                {openIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenIndex(openIndex - 1)}
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Anterior"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                )}
                {openIndex < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setOpenIndex(openIndex + 1)}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Siguiente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
