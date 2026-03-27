"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface VideoUploaderProps {
  productId: string;
  videoEnabled: boolean;
  existingVideo?: {
    cloudflareStreamUid: string;
    status: string;
  } | null;
}

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MAX_DURATION_SECONDS = 30;

export function VideoUploader({ productId, videoEnabled, existingVideo }: VideoUploaderProps) {
  const [video, setVideo] = useState(existingVideo ?? null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [polling, setPolling] = useState(existingVideo?.status === "PROCESSING");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling for video processing status
  useEffect(() => {
    if (!polling || !video) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/upload/video/status?productId=${productId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "READY") {
          setVideo({ cloudflareStreamUid: data.uid, status: "READY" });
          setPolling(false);
        } else if (data.status === "ERROR") {
          setVideo({ cloudflareStreamUid: data.uid, status: "ERROR" });
          setPolling(false);
          setError("Error al procesar el video. Intenta subirlo nuevamente.");
        }
      } catch {
        // Continue polling on network errors
      }
    };

    pollingRef.current = setInterval(poll, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [polling, video, productId]);

  const validateFile = useCallback((file: File): string | null => {
    if (file.type !== "video/mp4") {
      return "Solo se permiten videos en formato MP4.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `El video no debe superar ${MAX_SIZE_MB} MB.`;
    }
    return null;
  }, []);

  const validateDuration = useCallback((file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.onloadedmetadata = () => {
        URL.revokeObjectURL(videoEl.src);
        if (videoEl.duration > MAX_DURATION_SECONDS) {
          resolve(`El video no debe superar ${MAX_DURATION_SECONDS} segundos (actual: ${Math.round(videoEl.duration)}s).`);
        } else {
          resolve(null);
        }
      };
      videoEl.onerror = () => {
        URL.revokeObjectURL(videoEl.src);
        resolve("No se pudo leer el archivo de video.");
      };
      videoEl.src = URL.createObjectURL(file);
    });
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);

    // Frontend validations
    const typeError = validateFile(file);
    if (typeError) { setError(typeError); return; }

    const durationError = await validateDuration(file);
    if (durationError) { setError(durationError); return; }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get upload URL from our backend
      const res = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al solicitar URL de subida");
      }

      const { uploadURL, uid } = await res.json();

      // Step 2: Upload directly to Cloudflare using XHR for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadURL);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Error al subir el video a Cloudflare"));
          }
        };

        xhr.onerror = () => reject(new Error("Error de red al subir el video"));

        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });

      // Step 3: Start polling for processing status
      setVideo({ cloudflareStreamUid: uid, status: "PROCESSING" });
      setPolling(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el video");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [productId, validateFile, validateDuration]);

  const handleDelete = useCallback(async () => {
    if (!confirm("¿Eliminar este video?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/upload/video?productId=${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar el video");
      }
      setVideo(null);
      setPolling(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el video");
    } finally {
      setDeleting(false);
    }
  }, [productId]);

  // If plan doesn't allow video, show upgrade prompt
  if (!videoEnabled) {
    return (
      <div className="space-y-2">
        <h3 className="font-serif text-lg font-semibold text-text">Video del Producto</h3>
        <div className="relative overflow-hidden rounded-lg border border-border bg-background p-6 text-center">
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-[1px]" />
          <div className="relative space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text">
              Los videos están disponibles en el plan Maestro.
            </p>
            <p className="text-xs text-text-secondary">
              Actualiza tu plan para mostrar tus piezas en movimiento.
            </p>
            <a
              href="/portal/orfebre/plan"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              Actualizar Plan
            </a>
          </div>
        </div>
      </div>
    );
  }

  const CF_CUSTOMER_CODE = process.env.NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE;

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-text">Video del Producto</h3>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No video yet — upload zone */}
      {!video && !uploading && (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-accent/50"
          onClick={() => inputRef.current?.click()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-text-secondary">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <p className="text-sm text-text-secondary">
            Haz clic para subir un video de tu pieza
          </p>
          <p className="mt-1 text-xs text-text-secondary/70">
            MP4 — máx. {MAX_DURATION_SECONDS} segundos — máx. {MAX_SIZE_MB} MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* Uploading — progress bar */}
      {uploading && (
        <div className="rounded-lg border border-border bg-background p-6">
          <div className="space-y-3 text-center">
            <svg className="mx-auto h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-text-secondary">Subiendo video... {progress}%</p>
            <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Processing state */}
      {video && video.status === "PROCESSING" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <svg className="mx-auto mb-2 h-8 w-8 animate-spin text-amber-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium text-amber-800">Procesando video...</p>
          <p className="mt-1 text-xs text-amber-700">Esto puede tomar unos minutos. No cierres esta página.</p>
        </div>
      )}

      {/* Ready — show preview */}
      {video && video.status === "READY" && CF_CUSTOMER_CODE && (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              src={`https://${CF_CUSTOMER_CODE}/${video.cloudflareStreamUid}/iframe?muted=true&loop=true&controls=true`}
              allow="autoplay"
              allowFullScreen
              style={{ border: "none", width: "100%", aspectRatio: "16/9" }}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            disabled={deleting}
          >
            Eliminar Video
          </Button>
        </div>
      )}

      {/* Error state */}
      {video && video.status === "ERROR" && (
        <div className="space-y-2">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-medium text-red-800">Error al procesar el video</p>
            <p className="mt-1 text-xs text-red-700">Elimina este video e intenta nuevamente.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            disabled={deleting}
          >
            Eliminar Video
          </Button>
        </div>
      )}
    </div>
  );
}
