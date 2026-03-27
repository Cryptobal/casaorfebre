"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";

interface ImageGalleryProps {
  images: { id: string; url: string; altText: string | null }[];
  productName: string;
  video?: { cloudflareStreamUid: string; status: string } | null;
}

export function ImageGallery({ images, productName, video }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasReadyVideo = video?.status === "READY";
  const totalSlides = images.length + (hasReadyVideo ? 1 : 0);
  const isVideoSlide = hasReadyVideo && selectedIndex === images.length;

  if (images.length === 0 && !hasReadyVideo) {
    return (
      <ImagePlaceholder
        name={productName}
        className="aspect-[3/4] w-full rounded-lg"
      />
    );
  }

  const cfCustomerCode = process.env.NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-lg bg-background"
        aria-label="Ampliar imagen"
      >
        {isVideoSlide && cfCustomerCode ? (
          <iframe
            src={`https://${cfCustomerCode}/${video.cloudflareStreamUid}/iframe?autoplay=true&muted=true&loop=true&controls=true`}
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
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        ) : null}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/40 p-1.5 text-white/80 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      </button>

      {totalSlides > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                index === selectedIndex
                  ? "border-accent"
                  : "border-transparent hover:border-border"
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
                  : "border-transparent hover:border-border"
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
