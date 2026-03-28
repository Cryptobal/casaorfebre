"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BlogImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function BlogImage({ src, alt, className }: BlogImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-stone-100 via-amber-50/60 to-stone-200",
          className,
        )}
      >
        <span className="px-6 text-center font-serif text-sm font-light italic text-stone-400 line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
