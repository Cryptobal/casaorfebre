"use client";

import { useEffect, useRef, useState } from "react";
import {
  clampGalleryFocalX,
  clampGalleryFocalY,
  clampGalleryZoom,
  DEFAULT_GALLERY_FOCAL_X,
  DEFAULT_GALLERY_FOCAL_Y,
  DEFAULT_GALLERY_ZOOM,
  galleryCropStyle,
  MIN_GALLERY_ZOOM,
  MAX_GALLERY_ZOOM,
  type GalleryCrop,
} from "@/lib/home-defaults";

const ZOOM_STEP = 10;

function sameCrop(a: GalleryCrop, b: GalleryCrop): boolean {
  return a.focalX === b.focalX && a.focalY === b.focalY && a.zoom === b.zoom;
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function GalleryCropEditor({
  src,
  alt,
  value,
  disabled,
  onCommit,
}: {
  src: string;
  alt: string;
  value: GalleryCrop;
  disabled?: boolean;
  onCommit: (next: GalleryCrop) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<{
    x: number;
    y: number;
    focalX: number;
    focalY: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const activeRef = useRef(false);
  const committedRef = useRef(false);
  const draftRef = useRef(value);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (activeRef.current) return;
    setDraft(value);
    draftRef.current = value;
  }, [value.focalX, value.focalY, value.zoom]);

  function applyDraft(next: GalleryCrop) {
    draftRef.current = next;
    setDraft(next);
  }

  function finishGesture() {
    activeRef.current = false;
    dragRef.current = null;
    pinchRef.current = null;
    if (committedRef.current) return;
    const next = draftRef.current;
    if (sameCrop(next, value)) return;
    committedRef.current = true;
    onCommit(next);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    committedRef.current = false;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    activeRef.current = true;

    if (pointersRef.current.size === 1) {
      pinchRef.current = null;
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        focalX: draftRef.current.focalX,
        focalY: draftRef.current.focalY,
      };
      return;
    }

    dragRef.current = null;
    const points = [...pointersRef.current.values()];
    if (points.length >= 2) {
      pinchRef.current = {
        distance: Math.max(1, distance(points[0], points[1])),
        zoom: draftRef.current.zoom,
      };
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const points = [...pointersRef.current.values()];
      const nextDistance = Math.max(1, distance(points[0], points[1]));
      applyDraft({
        ...draftRef.current,
        zoom: clampGalleryZoom(
          pinchRef.current.zoom * (nextDistance / pinchRef.current.distance)
        ),
      });
      return;
    }

    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || !frame || pointersRef.current.size !== 1) return;

    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    applyDraft({
      ...draftRef.current,
      focalX: clampGalleryFocalX(
        drag.focalX - ((event.clientX - drag.x) / rect.width) * 100
      ),
      focalY: clampGalleryFocalY(
        drag.focalY - ((event.clientY - drag.y) / rect.height) * 100
      ),
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (pointersRef.current.size === 1) {
      const remaining = [...pointersRef.current.values()][0];
      pinchRef.current = null;
      dragRef.current = {
        x: remaining.x,
        y: remaining.y,
        focalX: draftRef.current.focalX,
        focalY: draftRef.current.focalY,
      };
      return;
    }

    if (pointersRef.current.size === 0) {
      finishGesture();
    }
  }

  function bumpZoom(delta: number) {
    if (disabled) return;
    const next = {
      ...draftRef.current,
      zoom: clampGalleryZoom(draftRef.current.zoom + delta),
    };
    applyDraft(next);
    onCommit(next);
  }

  return (
    <div>
      <div
        ref={frameRef}
        role="group"
        aria-label="Encuadre de la foto. Arrastra para mover, pellizca o usa más y menos para agrandar."
        tabIndex={disabled ? -1 : 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (disabled) return;
          const step = event.shiftKey ? 10 : 5;
          const current = draftRef.current;
          let next: GalleryCrop | null = null;
          if (event.key === "ArrowLeft") {
            next = { ...current, focalX: clampGalleryFocalX(current.focalX - step) };
          } else if (event.key === "ArrowRight") {
            next = { ...current, focalX: clampGalleryFocalX(current.focalX + step) };
          } else if (event.key === "ArrowUp") {
            next = { ...current, focalY: clampGalleryFocalY(current.focalY - step) };
          } else if (event.key === "ArrowDown") {
            next = { ...current, focalY: clampGalleryFocalY(current.focalY + step) };
          } else if (event.key === "+" || event.key === "=") {
            next = { ...current, zoom: clampGalleryZoom(current.zoom + ZOOM_STEP) };
          } else if (event.key === "-" || event.key === "_") {
            next = { ...current, zoom: clampGalleryZoom(current.zoom - ZOOM_STEP) };
          }
          if (!next) return;
          event.preventDefault();
          applyDraft(next);
          onCommit(next);
        }}
        className="relative aspect-[3/4] cursor-grab touch-none select-none overflow-hidden rounded-sm bg-surface-alt outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-accent"
        style={{ touchAction: "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={galleryCropStyle(draft)}
        />
      </div>
      <p className="mt-2 text-xs leading-snug text-text-tertiary">
        Arrastra para mover. Pellizca o usa +/− para agrandar.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label="Achicar"
          disabled={disabled || draft.zoom <= MIN_GALLERY_ZOOM}
          onClick={() => bumpZoom(-ZOOM_STEP)}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-lg text-text transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-12 flex-1 text-center text-sm text-text-secondary">
          {draft.zoom}%
        </span>
        <button
          type="button"
          aria-label="Agrandar"
          disabled={disabled || draft.zoom >= MAX_GALLERY_ZOOM}
          onClick={() => bumpZoom(ZOOM_STEP)}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-lg text-text transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function cropFromImage(image: {
  focalX?: number | null;
  focalY?: number | null;
  zoom?: number | null;
}): GalleryCrop {
  return {
    focalX: image.focalX ?? DEFAULT_GALLERY_FOCAL_X,
    focalY: image.focalY ?? DEFAULT_GALLERY_FOCAL_Y,
    zoom: image.zoom ?? DEFAULT_GALLERY_ZOOM,
  };
}

export { sameCrop };
