"use client";

import { useCallback, useRef, useState } from "react";

interface ReviewImageUploadProps {
  onImagesChange: (urls: string[]) => void;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_MEDIA = 3;

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function ReviewImageUpload({ onImagesChange }: ReviewImageUploadProps) {
  const [media, setMedia] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Solo se permiten imágenes (JPG, PNG, WebP) o videos (MP4, WebM, MOV)");
        return;
      }

      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

      if (file.size > maxSize) {
        setError(isVideo ? "Cada video no debe superar 50 MB" : "Cada imagen no debe superar 5 MB");
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
          throw new Error(data.error || "Error al subir el archivo");
        }

        const data = await res.json();

        setMedia((prev) => {
          const next = [...prev, data.url];
          onImagesChange(next);
          return next;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al subir el archivo"
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
      const remaining = MAX_MEDIA - media.length;
      if (remaining <= 0) {
        setError(`Máximo ${MAX_MEDIA} archivos por opinión`);
        return;
      }
      const toUpload = Array.from(files).slice(0, remaining);
      toUpload.forEach((file) => uploadFile(file));
    },
    [media.length, uploadFile]
  );

  const handleRemove = useCallback(
    (index: number) => {
      setMedia((prev) => {
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
        Agrega hasta {MAX_MEDIA} fotos o videos (opcional)
      </p>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Thumbnails */}
      {(media.length > 0 || uploadingCount > 0) && (
        <div className="flex gap-2">
          {media.map((url, index) => (
            <div
              key={url}
              className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border"
            >
              {isVideoUrl(url) ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Eliminar"
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
      {media.length < MAX_MEDIA && (
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
          Agregar fotos o videos
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
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
