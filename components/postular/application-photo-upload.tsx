"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

const MAX_PHOTOS = 6;

interface ApplicationPhotoUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function ApplicationPhotoUpload({ urls, onChange }: ApplicationPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setError(null);
      const remaining = MAX_PHOTOS - urls.length;
      if (remaining <= 0) {
        setError(`Máximo ${MAX_PHOTOS} fotos`);
        return;
      }
      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);
      try {
        const next = [...urls];
        for (const file of toUpload) {
          const fd = new FormData();
          fd.set("file", file);
          const res = await fetch("/api/upload/application-photo", {
            method: "POST",
            body: fd,
          });
          const data = (await res.json()) as { url?: string; error?: string };
          if (!res.ok || !data.url) {
            setError(data.error || "Error al subir");
            break;
          }
          next.push(data.url);
        }
        onChange(next);
      } finally {
        setUploading(false);
      }
    },
    [urls, onChange]
  );

  function remove(url: string) {
    onChange(urls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="portfolioImageUrls" value={JSON.stringify(urls)} />
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            disabled={uploading || urls.length >= MAX_PHOTOS}
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <span
            className={`inline-flex rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors ${
              uploading || urls.length >= MAX_PHOTOS
                ? "cursor-not-allowed opacity-50"
                : "hover:border-accent/50 hover:text-accent"
            }`}
          >
            {uploading ? "Subiendo…" : "Elegir fotos"}
          </span>
        </label>
        <span className="text-xs text-text-tertiary">
          JPG, PNG o WebP · máx. 5 MB c/u · hasta {MAX_PHOTOS} fotos
        </span>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-background"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
              />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Quitar foto"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
