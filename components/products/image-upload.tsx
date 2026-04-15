"use client";

import { useCallback, useRef, useState } from "react";
import { PhotographyGuide } from "./photography-guide";
import { reorderProductImages } from "@/lib/actions/products";

const MAX_UPLOAD_SIZE = 4 * 1024 * 1024; // 4MB — Vercel serverless body limit is ~4.5MB

async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_SIZE) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Scale down proportionally — max 2400px on longest side
      const maxDim = 2400;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size > MAX_UPLOAD_SIZE) {
            // Try lower quality
            canvas.toBlob(
              (blob2) => {
                if (!blob2) { resolve(file); return; }
                resolve(new File([blob2], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
              },
              "image/jpeg",
              0.6
            );
          } else {
            resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
          }
        },
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

interface ImageItem {
  id: string;
  url: string;
  position: number;
}

interface ImageUploadProps {
  productId: string;
  existingImages: {
    id: string;
    url: string;
    altText: string | null;
    position: number;
  }[];
  onImagesChange?: (images: ImageItem[]) => void;
}

export function ImageUpload({
  productId,
  existingImages,
  onImagesChange,
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageItem[]>(
    existingImages.map((img) => ({
      id: img.id,
      url: img.url,
      position: img.position,
    }))
  );
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"idle" | "saving" | "saved">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistOrder = useCallback(
    async (orderedIds: string[]) => {
      setOrderStatus("saving");
      const result = await reorderProductImages(productId, orderedIds);
      if (result.error) {
        setError(result.error);
        setOrderStatus("idle");
        return;
      }
      setError(null);
      setOrderStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setOrderStatus("idle"), 2000);
    },
    [productId]
  );

  const updateImages = useCallback(
    (next: ImageItem[]) => {
      setImages(next);
      onImagesChange?.(next);
    },
    [onImagesChange]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploadingCount((c) => c + 1);

      try {
        const compressed = await compressImage(file);

        const formData = new FormData();
        formData.append("file", compressed);
        formData.append("productId", productId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          let message = "Error al subir la imagen";
          try {
            const data = await res.json();
            message = data.error || message;
          } catch {
            if (res.status === 413) {
              message = "La imagen es demasiado grande. Intenta con una foto más pequeña.";
            }
          }
          throw new Error(message);
        }

        const data = await res.json();
        const newImage: ImageItem = {
          id: data.imageId,
          url: data.url,
          position: 0, // will be recalculated
        };

        setImages((prev) => {
          const next = [...prev, newImage].map((img, i) => ({
            ...img,
            position: i,
          }));
          onImagesChange?.(next);
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir la imagen");
      } finally {
        setUploadingCount((c) => c - 1);
      }
    },
    [productId, onImagesChange]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDelete = useCallback(
    async (imageId: string) => {
      try {
        const res = await fetch(`/api/upload?imageId=${imageId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Error al eliminar la imagen");
        }
      } catch {
        // Even if server delete fails, remove from UI
      }

      setImages((prev) => {
        const next = prev
          .filter((img) => img.id !== imageId)
          .map((img, i) => ({ ...img, position: i }));
        onImagesChange?.(next);
        return next;
      });
    },
    [onImagesChange]
  );

  const handleMove = useCallback(
    (index: number, direction: "up" | "down") => {
      setImages((prev) => {
        const next = [...prev];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= next.length) return prev;

        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
        const reordered = next.map((img, i) => ({ ...img, position: i }));
        onImagesChange?.(reordered);
        persistOrder(reordered.map((img) => img.id));
        return reordered;
      });
    },
    [onImagesChange, persistOrder]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg font-semibold text-text">
            Imagenes del Producto
          </h3>
          {orderStatus === "saving" && (
            <span className="text-xs text-text-tertiary">Guardando orden…</span>
          )}
          {orderStatus === "saved" && (
            <span className="text-xs text-green-700">Orden guardado</span>
          )}
        </div>
        <PhotographyGuide />
      </div>
      <p className="text-xs text-text-tertiary">
        Puedes reordenar las fotos en cualquier momento: el nuevo orden se guarda automáticamente y no requiere enviar a revisión.
      </p>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-2 text-text-secondary"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm text-text-secondary">
          Arrastra tus fotos aqui o haz clic para seleccionar
        </p>
        <p className="mt-1 text-xs text-text-secondary/70">
          JPG, PNG o WebP - max 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Thumbnails grid */}
      {(images.length > 0 || uploadingCount > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-background"
            >
              <img
                src={img.url}
                alt={`Imagen ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Position badge */}
              <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-medium text-white">
                {index + 1}
              </span>

              {/* Controls overlay - always visible on mobile, hover on desktop */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1.5 py-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="rounded p-0.5 text-white hover:bg-white/20 disabled:opacity-30"
                    aria-label="Mover arriba"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === images.length - 1}
                    className="rounded p-0.5 text-white hover:bg-white/20 disabled:opacity-30"
                    aria-label="Mover abajo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="rounded p-0.5 text-white hover:bg-red-500/80"
                  aria-label="Eliminar imagen"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Loading placeholders */}
          {Array.from({ length: uploadingCount }).map((_, i) => (
            <div
              key={`uploading-${i}`}
              className="flex aspect-[3/4] items-center justify-center rounded-md border border-dashed border-border bg-background"
            >
              <svg
                className="h-6 w-6 animate-spin text-text-secondary"
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
    </div>
  );
}
