"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: { id: string; url: string; altText: string | null }[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <ImagePlaceholder
        name={productName}
        className="aspect-[3/4] w-full rounded-lg"
      />
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-background">
        <Image
          src={selectedImage.url}
          alt={selectedImage.altText ?? productName}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
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
        </div>
      )}
    </div>
  );
}
