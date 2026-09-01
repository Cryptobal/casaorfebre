"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { galleryCropStyle, DEFAULT_GALLERY_FOCAL_X, DEFAULT_GALLERY_FOCAL_Y, DEFAULT_GALLERY_ZOOM } from "@/lib/home-defaults";
import type { GalleryImage } from "@/lib/site-config";

const SIZES = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw";

export function GalleryFigure({
  src,
  alt,
  caption,
  aspectClass,
  offsetClass,
  focalX = DEFAULT_GALLERY_FOCAL_X,
  focalY = DEFAULT_GALLERY_FOCAL_Y,
  zoom = DEFAULT_GALLERY_ZOOM,
}: GalleryImage) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={cn("m-0 col-span-1", offsetClass)}>
      <div className={cn("relative overflow-hidden bg-surface-alt", aspectClass)}>
        {!failed && (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={SIZES}
            className="object-cover"
            style={galleryCropStyle({ focalX, focalY, zoom })}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {caption ? (
        <figcaption className="mt-2.5 text-[11px] font-light tracking-[0.14em] text-text-faint">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
