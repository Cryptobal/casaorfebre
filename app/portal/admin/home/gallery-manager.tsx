"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  addGalleryFromProductImages,
  addGalleryImages,
  deleteImage,
  moveImage,
  updateImageCaption,
  updateImageFocal,
} from "@/lib/actions/home-content";
import { compressImageFile, ImageCompressError } from "@/lib/image-compress";
import { showToast } from "@/components/ui/toast";
import { notifyHomeActionError } from "./notify-error";
import { ProductPhotoPicker } from "./product-photo-picker";
import { GalleryCropEditor, cropFromImage, sameCrop } from "./gallery-crop";
import type { GalleryCrop } from "@/lib/home-defaults";
import type {
  AdminHomeGalleryImage,
  GalleryProductPhoto,
} from "@/lib/queries/home-content";

type GalleryManagerProps = {
  images: AdminHomeGalleryImage[];
  productPhotos: GalleryProductPhoto[];
};

type PendingUpload = {
  id: string;
  name: string;
  status: "compressing" | "uploading" | "error";
  error?: string;
};

export function GalleryManager({ images, productPhotos }: GalleryManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const [isMutating, startMutate] = useTransition();

  const total = images.length;
  const disabled = isUploading || isMutating;

  function patchUpload(id: string, patch: Partial<PendingUpload>) {
    setPendingUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function handlePick() {
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

  function handleFocalCommit(id: string, current: GalleryCrop, next: GalleryCrop) {
    if (sameCrop(current, next)) return;
    setBusyId(id);
    startMutate(async () => {
      const result = await updateImageFocal(
        id,
        next.focalX,
        next.focalY,
        next.zoom
      );
      setBusyId(null);
      if (result.error) {
        notifyHomeActionError(result.error);
        return;
      }
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

  function handleAddFromProducts(ids: string[]) {
    startMutate(async () => {
      const result = await addGalleryFromProductImages(ids);
      if (result.error && !result.success) {
        notifyHomeActionError(result.error);
        return;
      }
      const added = result.added ?? 0;
      showToast({
        message:
          added === 1 ? "Foto agregada a la galería" : `${added} fotos agregadas a la galería`,
      });
      setPickerOpen(false);
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl font-light">Galería</h2>
        <p className="text-sm text-text-secondary">
          {total === 1 ? "1 foto" : `${total} fotos`}
        </p>
      </div>
      <p className="mt-2 text-sm text-text-secondary">
        Estas fotos aparecen en la home. Sube nuevas o elige de tus productos. No hay un máximo: se guardan en Cloudflare. Si no hay ninguna aquí, la galería de la home queda vacía.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handlePick}
          disabled={disabled}
          className="flex min-h-12 flex-1 items-center justify-center rounded-md bg-accent px-5 text-base font-medium text-white transition-colors hover:bg-accent-dark disabled:pointer-events-none disabled:opacity-50"
        >
          {isUploading ? "Subiendo…" : "Subir fotos"}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          className="flex min-h-12 flex-1 items-center justify-center rounded-md border border-border px-5 text-base font-medium text-text transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-50"
        >
          Elegir de productos
        </button>
      </div>

      {images.length === 0 && pendingUploads.length === 0 && (
        <p className="mt-4 rounded-md bg-background px-3 py-3 text-sm text-text-secondary">
          Todavía no hay fotos en la galería. Elige de tus productos o sube fotos nuevas.
        </p>
      )}

      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            onFocalCommit={handleFocalCommit}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      <ProductPhotoPicker
        open={pickerOpen}
        photos={productPhotos}
        busy={isMutating}
        onClose={() => {
          if (!isMutating) setPickerOpen(false);
        }}
        onConfirm={handleAddFromProducts}
      />
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
  onFocalCommit,
  onDelete,
}: {
  image: AdminHomeGalleryImage;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMove: (id: string, direction: "up" | "down") => void;
  onCaptionBlur: (id: string, current: string | null, next: string) => void;
  onFocalCommit: (id: string, current: GalleryCrop, next: GalleryCrop) => void;
  onDelete: (id: string) => void;
}) {
  const [caption, setCaption] = useState(image.caption ?? "");
  const crop = cropFromImage(image);

  useEffect(() => {
    setCaption(image.caption ?? "");
  }, [image.caption]);

  return (
    <li className="flex flex-col rounded-md border border-border bg-background p-2">
      <GalleryCropEditor
        src={image.url}
        alt={image.caption || "Foto de la galería"}
        value={crop}
        disabled={busy}
        onCommit={(next) => onFocalCommit(image.id, crop, next)}
      />
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
