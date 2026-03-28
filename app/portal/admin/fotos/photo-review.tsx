"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import {
  approvePhoto,
  approvePhotosBatch,
  rejectPhoto,
  replacePhoto,
  adminDeletePhoto,
} from "@/lib/actions/admin";

interface PhotoItem {
  id: string;
  url: string;
  altText: string | null;
  status: string;
  productName: string;
  artisanName: string;
}

interface PhotoReviewProps {
  photos: PhotoItem[];
}

const STATUS_TABS = [
  { key: "PENDING_REVIEW", label: "Pendientes" },
  { key: "APPROVED", label: "Aprobadas" },
  { key: "REJECTED", label: "Rechazadas" },
  { key: "REPLACED", label: "Reemplazadas" },
] as const;

const STATUS_BADGE_STYLES: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  REPLACED: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  REPLACED: "Reemplazada",
};

export function PhotoReview({ photos }: PhotoReviewProps) {
  const [activeTab, setActiveTab] = useState<string>("PENDING_REVIEW");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [feedback, setFeedback] = useState<Record<string, { type: "success" | "error"; message: string }>>({});
  const [isPending, startTransition] = useTransition();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filtered = photos.filter((p) => p.status === activeTab);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleApprove(imageId: string) {
    startTransition(async () => {
      const result = await approvePhoto(imageId);
      if (result.error) {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "error", message: result.error! } }));
      } else {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "success", message: "Aprobada" } }));
      }
    });
  }

  function handleReject(imageId: string) {
    const formData = new FormData();
    formData.set("reason", rejectReason);
    startTransition(async () => {
      const result = await rejectPhoto(imageId, formData);
      if (result.error) {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "error", message: result.error! } }));
      } else {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "success", message: "Rechazada" } }));
        setRejectingId(null);
        setRejectReason("");
      }
    });
  }

  function handleReplace(imageId: string, file: File) {
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await replacePhoto(imageId, formData);
      if (result.error) {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "error", message: result.error! } }));
      } else {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "success", message: "Reemplazada" } }));
      }
    });
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      const result = await adminDeletePhoto(imageId);
      if (result.error) {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "error", message: result.error! } }));
      } else {
        setFeedback((prev) => ({ ...prev, [imageId]: { type: "success", message: "Eliminada" } }));
      }
    });
  }

  function handleBatchApprove() {
    const formData = new FormData();
    formData.set("imageIds", JSON.stringify(Array.from(selected)));
    startTransition(async () => {
      const result = await approvePhotosBatch(formData);
      if (result.error) {
        // Show generic error
        setFeedback((prev) => ({
          ...prev,
          __batch: { type: "error", message: result.error! },
        }));
      } else {
        selected.forEach((id) => {
          setFeedback((prev) => ({
            ...prev,
            [id]: { type: "success", message: "Aprobada" },
          }));
        });
        setSelected(new Set());
      }
    });
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => {
          const count = photos.filter((p) => p.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelected(new Set());
              }}
              className={`px-4 py-2 text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-accent font-medium text-text"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Batch action bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-md bg-accent/10 px-4 py-3">
          <span className="text-sm">
            {selected.size} seleccionada{selected.size > 1 ? "s" : ""}
          </span>
          <Button
            size="sm"
            className="bg-green-700 text-white hover:bg-green-800"
            onClick={handleBatchApprove}
            disabled={isPending}
            loading={isPending}
          >
            Aprobar Seleccionadas ({selected.size})
          </Button>
          {feedback.__batch && (
            <span
              className={`text-sm ${
                feedback.__batch.type === "error"
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {feedback.__batch.message}
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay fotos en esta categoria
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-lg border border-border bg-surface"
            >
              {/* Checkbox + image */}
              <div className="relative">
                {activeTab === "PENDING_REVIEW" && !feedback[photo.id] && (
                  <label className="absolute left-2 top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-border bg-white/80">
                    <input
                      type="checkbox"
                      checked={selected.has(photo.id)}
                      onChange={() => toggleSelect(photo.id)}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                  </label>
                )}
                <div className="aspect-square relative">
                  {photo.url.startsWith("r2://") ? (
                    <ImagePlaceholder
                      name={photo.productName}
                      className="h-full w-full"
                    />
                  ) : (
                    <Image
                      src={photo.url}
                      alt={photo.altText ?? photo.productName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 p-3">
                <p className="text-sm font-medium">{photo.productName}</p>
                <p className="text-xs text-text-tertiary">
                  {photo.artisanName}
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                    STATUS_BADGE_STYLES[photo.status] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {STATUS_LABELS[photo.status] ?? photo.status}
                </span>

                {/* Feedback */}
                {feedback[photo.id] && (
                  <p
                    className={`text-xs ${
                      feedback[photo.id].type === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {feedback[photo.id].message}
                  </p>
                )}

                {/* Actions */}
                {!feedback[photo.id] && (activeTab === "PENDING_REVIEW" || activeTab === "APPROVED" || activeTab === "REJECTED") && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {(activeTab === "PENDING_REVIEW" || activeTab === "REJECTED") && (
                        <Button
                          size="sm"
                          className="bg-green-700 text-white hover:bg-green-800"
                          onClick={() => handleApprove(photo.id)}
                          disabled={isPending}
                        >
                          Aprobar
                        </Button>
                      )}
                      {(activeTab === "PENDING_REVIEW" || activeTab === "APPROVED") && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setRejectingId(
                              rejectingId === photo.id ? null : photo.id
                            )
                          }
                          disabled={isPending}
                        >
                          Rechazar
                        </Button>
                      )}
                      {!photo.url.startsWith("r2://") && (
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-background"
                        >
                          Descargar
                        </a>
                      )}
                      {(activeTab === "PENDING_REVIEW" || activeTab === "APPROVED") && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              fileInputRefs.current[photo.id]?.click()
                            }
                            disabled={isPending}
                          >
                            Reemplazar
                          </Button>
                          <input
                            ref={(el) => {
                              fileInputRefs.current[photo.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleReplace(photo.id, file);
                            }}
                          />
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(photo.id)}
                        disabled={isPending}
                      >
                        Eliminar
                      </Button>
                    </div>

                    {rejectingId === photo.id && (
                      <div className="space-y-1.5">
                        <textarea
                          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                          rows={2}
                          placeholder="Razón del rechazo (opcional)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(photo.id)}
                          disabled={isPending}
                        >
                          Confirmar rechazo
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
