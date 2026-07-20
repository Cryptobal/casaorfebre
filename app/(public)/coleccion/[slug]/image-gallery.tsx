"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { PinItButton } from "@/components/shared/share-buttons";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";

interface ImageGalleryProps {
  images: { id: string; url: string; altText: string | null }[];
  productName: string;
  productSlug?: string;
  video?: { cloudflareStreamUid: string; status: string; muted: boolean } | null;
}

export function ImageGallery({ images, productName, productSlug, video }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasReadyVideo = video?.status === "READY";
  const totalSlides = images.length + (hasReadyVideo ? 1 : 0);
  const isVideoSlide = hasReadyVideo && selectedIndex === images.length;

  if (images.length === 0 && !hasReadyVideo) {
    return (
      <ImagePlaceholder
        name={productName}
        className="aspect-[3/4] w-full rounded-none md:rounded-lg"
      />
    );
  }

  const cfCustomerCode = process.env.NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE;

  return (
    <div className="space-y-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={cn(
            "group relative w-full cursor-zoom-in overflow-hidden bg-background",
            "h-[62vh] rounded-none md:h-auto md:aspect-[3/4] md:rounded-lg",
          )}
          aria-label="Ampliar imagen"
        >
          {isVideoSlide && cfCustomerCode ? (
            <iframe
              src={`https://${cfCustomerCode}/${video.cloudflareStreamUid}/iframe?autoplay=true&muted=${video.muted ? "true" : "false"}&loop=true&controls=true`}
              allow="autoplay"
              allowFullScreen
              style={{ border: "none", width: "100%", height: "100%" }}
              className="absolute inset-0 pointer-events-none"
            />
          ) : images[selectedIndex] ? (
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].altText ?? productName}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          ) : null}

          {!isVideoSlide && images[selectedIndex]?.url && productSlug && (
            <div className="absolute bottom-3 left-3 z-10 hidden opacity-0 transition-opacity group-hover:opacity-100 md:block">
              <PinItButton
                url={`https://casaorfebre.cl/coleccion/${productSlug}`}
                imageUrl={images[selectedIndex].url}
                description={`${productName} — Joyería artesanal chilena`}
              />
            </div>
          )}

          <div className="absolute bottom-3 right-3 hidden rounded-full bg-black/40 p-1.5 text-white/80 backdrop-blur-sm md:block">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        </button>

        {/* Dots sobre la foto — solo móvil */}
        {totalSlides > 1 && (
          <div
            className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-1.5 md:hidden"
            role="tablist"
            aria-label="Imágenes del producto"
          >
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Imagen ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(index);
                }}
                className="flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={cn(
                    "rounded-full transition-all",
                    index === selectedIndex
                      ? "h-[5px] w-[14px] bg-[#FAFAF8]"
                      : "h-[5px] w-[5px] bg-[#FAFAF8]/55",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {totalSlides > 1 && (
        <div className="hidden gap-2 overflow-x-auto pb-1 md:flex">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                index === selectedIndex
                  ? "border-accent"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${productName} - ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
          {hasReadyVideo && (
            <button
              type="button"
              onClick={() => setSelectedIndex(images.length)}
              className={cn(
                "relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border-2 bg-black/5 transition-colors",
                isVideoSlide
                  ? "border-accent"
                  : "border-transparent hover:border-border",
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          )}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={images}
          video={video}
          productName={productName}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
