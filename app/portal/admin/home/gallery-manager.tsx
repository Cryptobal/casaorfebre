"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  addGalleryImages,
  deleteImage,
  moveImage,
  updateImageCaption,
} from "@/lib/actions/home-content";
import { compressImageFile, ImageCompressError } from "@/lib/image-compress";
import { MAX_HOME_GALLERY_IMAGES } from "@/lib/home-defaults";
import { showToast } from "@/components/ui/toast";
import { notifyHomeActionError } from "./notify-error";
import type { AdminHomeGalleryImage } from "@/lib/queries/home-content";

type GalleryManagerProps = {
  images: AdminHomeGalleryImage[];
};

type PendingUpload = {
  id: string;
  name: string;
  status: "compressing" | "uploading" | "error";
  error?: string;
};

export function GalleryManager({ images }: GalleryManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const [isMutating, startMutate] = useTransition();

  const total = images.length;
  const slotsLeft = MAX_HOME_GALLERY_IMAGES - total;
  const disabled = isUploading || isMutating;

  function patchUpload(id: string, patch: Partial<PendingUpload>) {
    setPendingUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function handlePick() {
    if (slotsLeft <= 0) {
      showToast({
        message: `Ya hay ${MAX_HOME_GALLERY_IMAGES} fotos. Borra alguna para agregar más.`,
      });
      return;
    }
    inputRef.current?.click();
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    if (inputRef.current) inputRef.current.value = "";

    startUpload(async () => {
      const jobs: PendingUpload[] = files.map((file, index) => ({
        id: `up-${Date.now()}-${index}`,
        name: file.name || `foto ${index + 1}`,
        status: "compressing",
      }));
      setPendingUploads(jobs);

      let added = 0;
      const failures: string[] = [];

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const job = jobs[i];
        if (total + added >= MAX_HOME_GALLERY_IMAGES) {
          patchUpload(job.id, {
            status: "error",
            error: `Máximo ${MAX_HOME_GALLERY_IMAGES} fotos`,
          });
          failures.push(job.name);
          continue;
        }

        patchUpload(job.id, { status: "compressing" });
        let blob: Blob;
        try {
          blob = await compressImageFile(file);
        } catch (error) {
          const message =
            error instanceof ImageCompressError
              ? error.message
              : "Formato no soportado, intenta con otra foto";
          patchUpload(job.id, { status: "error", error: message });
          failures.push(job.name);
          continue;
        }

        patchUpload(job.id, { status: "uploading" });
        const formData = new FormData();
        const ext = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp";
        formData.append("files", blob, `galeria.${ext}`);

        const result = await addGalleryImages(formData);
        if (result.error && !result.success) {
          patchUpload(job.id, {
            status: "error",
            error: result.error,
          });
          failures.push(job.name);
          if (result.error === "No autorizado") {
            notifyHomeActionError(result.error);
            break;
          }
          continue;
        }
        if (result.errors && result.errors.length > 0 && !result.added) {
          patchUpload(job.id, { status: "error", error: result.errors[0] });
          failures.push(job.name);
          continue;
        }
        added += result.added ?? 1;
      }

      if (added > 0) {
        showToast({
          message: added === 1 ? "Foto publicada" : `${added} fotos publicadas`,
        });
        router.refresh();
      }
      if (failures.length > 0 && added === 0) {
        showToast({ message: "No se pudo subir. Revisa el error de cada foto." });
      }

      setPendingUploads((prev) => prev.filter((item) => item.status === "error"));
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    setBusyId(id);
    startMutate(async () => {
      const result = await moveImage(id, direction);
      setBusyId(null);
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleCaptionBlur(id: string, current: string | null, next: string) {
    if ((current ?? "").trim() === next.trim()) return;
    setBusyId(id);
    startMutate(async () => {
      const result = await updateImageCaption(id, next);
      setBusyId(null);
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      showToast({ message: "Leyenda guardada" });
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("¿Borrar esta foto de la home?")) return;
    setBusyId(id);
    startMutate(async () => {
      const result = await deleteImage(id);
      setBusyId(null);
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
      showToast({
        message: result.warning ?? "Foto borrada",
      });
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl font-light">Galería</h2>
        <p className="text-sm text-text-secondary">
          {total}/{MAX_HOME_GALLERY_IMAGES}
        </p>
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        Estas fotos aparecen en la home. Si no hay ninguna aquí, se muestran las de respaldo.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <button
        type="button"
        onClick={handlePick}
        disabled={disabled || slotsLeft <= 0}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-5 text-base font-medium text-white transition-colors hover:bg-accent-dark disabled:pointer-events-none disabled:opacity-50"
      >
        {isUploading ? "Subiendo…" : "Agregar fotos"}
      </button>

      {images.length === 0 && pendingUploads.length === 0 && (
        <p className="mt-4 rounded-md bg-background px-3 py-3 text-sm text-text-secondary">
          Todavía no hay fotos propias. La home usa las de respaldo hasta que agregues las tuyas.
        </p>
      )}

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {pendingUploads.map((item) => (
          <li
            key={item.id}
            className="flex min-h-44 flex-col rounded-md border border-border bg-background p-2"
          >
            <div className="flex aspect-square items-center justify-center rounded-sm bg-surface-alt text-center text-sm text-text-secondary">
              {item.status === "error" ? (
                <span className="px-2 text-error">{item.error}</span>
              ) : (
                <span>{item.status === "compressing" ? "Comprimiendo…" : "Subiendo…"}</span>
              )}
            </div>
            <p className="mt-2 truncate text-xs text-text-tertiary">{item.name}</p>
          </li>
        ))}

        {images.map((image, index) => (
          <GalleryItem
            key={image.id}
            image={image}
            isFirst={index === 0}
            isLast={index === images.length - 1}
            busy={busyId === image.id || disabled}
            onMove={handleMove}
            onCaptionBlur={handleCaptionBlur}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </section>
  );
}

function GalleryItem({
  image,
  isFirst,
  isLast,
  busy,
  onMove,
  onCaptionBlur,
  onDelete,
}: {
  image: AdminHomeGalleryImage;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMove: (id: string, direction: "up" | "down") => void;
  onCaptionBlur: (id: string, current: string | null, next: string) => void;
  onDelete: (id: string) => void;
}) {
  const [caption, setCaption] = useState(image.caption ?? "");

  return (
    <li className="flex flex-col rounded-md border border-border bg-background p-2">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-surface-alt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.caption || "Foto de la galería"}
          className="h-full w-full object-cover"
        />
      </div>
      <label className="mt-2 block">
        <span className="sr-only">Leyenda</span>
        <input
          type="text"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          onBlur={() => onCaptionBlur(image.id, image.caption, caption)}
          placeholder="plata 950"
          disabled={busy}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <IconButton
            label="Subir"
            disabled={busy || isFirst}
            onClick={() => onMove(image.id, "up")}
          >
            ▲
          </IconButton>
          <IconButton
            label="Bajar"
            disabled={busy || isLast}
            onClick={() => onMove(image.id, "down")}
          >
            ▼
          </IconButton>
        </div>
        <IconButton
          label="Borrar"
          disabled={busy}
          onClick={() => onDelete(image.id)}
          danger
        >
          🗑
        </IconButton>
      </div>
    </li>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
  danger,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-md border text-base transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        danger
          ? "border-border text-error hover:bg-error/10"
          : "border-border text-text hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
