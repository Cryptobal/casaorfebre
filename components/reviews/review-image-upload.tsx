"use client";

import { useCallback, useRef, useState } from "react";

interface ReviewImageUploadProps {
  onImagesChange: (urls: string[]) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 3;

export function ReviewImageUpload({ onImagesChange }: ReviewImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Solo se permiten imagenes JPG, PNG o WebP");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Cada imagen no debe superar 5 MB");
        return;
      }

      setUploadingCount((c) => c + 1);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/review", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al subir la imagen");
        }

        const data = await res.json();

        setImages((prev) => {
          const next = [...prev, data.url];
          onImagesChange(next);
          return next;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al subir la imagen"
        );
      } finally {
        setUploadingCount((c) => c - 1);
      }
    },
    [onImagesChange]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        setError(`Maximo ${MAX_IMAGES} fotos por opinion`);
        return;
      }
      const toUpload = Array.from(files).slice(0, remaining);
      toUpload.forEach((file) => uploadFile(file));
    },
    [images.length, uploadFile]
  );

  const handleRemove = useCallback(
    (index: number) => {
      setImages((prev) => {
        const next = prev.filter((_, i) => i !== index);
        onImagesChange(next);
        return next;
      });
    },
    [onImagesChange]
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-tertiary">
        Agrega hasta {MAX_IMAGES} fotos (opcional)
      </p>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Thumbnails */}
      {(images.length > 0 || uploadingCount > 0) && (
        <div className="flex gap-2">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border"
            >
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Eliminar foto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          {/* Loading placeholders */}
          {Array.from({ length: uploadingCount }).map((_, i) => (
            <div
              key={`uploading-${i}`}
              className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border"
            >
              <svg
                className="h-4 w-4 animate-spin text-text-secondary"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      {images.length < MAX_IMAGES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Agregar fotos
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </button>
      )}
    </div>
  );
}
