"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface ConfirmDestructiveModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
}

export function ConfirmDestructiveModal({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  pending = false,
}: ConfirmDestructiveModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-destructive-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-label="Cerrar"
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
        <h2 id="confirm-destructive-title" className="font-serif text-lg font-medium text-text">
          {title}
        </h2>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="bg-red-700 text-white hover:bg-red-800"
            onClick={onConfirm}
            loading={pending}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
