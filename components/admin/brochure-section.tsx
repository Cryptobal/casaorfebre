"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BrochureAsset {
  id: string;
  key: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  updatedAt: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BrochureSection({ initialAsset }: { initialAsset: BrochureAsset | null }) {
  const [asset, setAsset] = useState<BrochureAsset | null>(initialAsset);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);

    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo no debe superar los 10 MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", "brochure-orfebres");
    formData.append("name", "Guía para Orfebres");

    const res = await fetch("/api/admin/assets/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (data.success && data.asset) {
      setAsset(data.asset);
    } else {
      setError(data.error || "Error al subir el archivo");
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }

  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Brochure de Captación
          </h3>
          <p className="mt-0.5 text-sm text-text-secondary">
            PDF que se adjunta automáticamente en las invitaciones a orfebres.
          </p>
        </div>
        {asset && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
            Activo
          </span>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {asset ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-red-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{asset.fileName}</p>
              <p className="text-xs text-text-tertiary">
                {formatFileSize(asset.fileSize)} · Subido por {asset.uploadedBy} · {new Date(asset.updatedAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowPreview(true)}
            >
              Ver PDF
            </Button>
            <a
              href={asset.fileUrl}
              download={asset.fileName}
              className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-background"
            >
              Descargar
            </a>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              Reemplazar
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/40"
          }`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-text-tertiary">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="mt-2 text-sm font-medium text-text">
            {uploading ? "Subiendo..." : "Arrastra tu PDF aquí o haz clic para seleccionar"}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">PDF, máximo 10 MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* PDF Preview Modal */}
      {showPreview && asset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="font-serif text-lg">{asset.name}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={asset.fileUrl}
                  download={asset.fileName}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-background"
                >
                  Descargar
                </a>
                <button
                  onClick={() => setShowPreview(false)}
                  className="rounded-full p-1.5 text-text-tertiary hover:bg-background hover:text-text"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={asset.fileUrl}
                className="h-full w-full"
                title="Vista previa del brochure"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
