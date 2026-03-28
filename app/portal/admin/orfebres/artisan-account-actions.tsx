"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  reactivateArtisan,
  removeOrSuspendArtisanAccount,
  suspendArtisan,
} from "@/lib/actions/admin";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";
import { cn } from "@/lib/utils";

interface ArtisanAccountActionsProps {
  artisanId: string;
  status: string;
  className?: string;
}

export function ArtisanAccountActions({ artisanId, status, className }: ArtisanAccountActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSuspend() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const r = await suspendArtisan(artisanId);
      if (r.error) setError(r.error);
      router.refresh();
    });
  }

  function onReactivate() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const r = await reactivateArtisan(artisanId);
      if (r.error) setError(r.error);
      router.refresh();
    });
  }

  function onConfirm() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await removeOrSuspendArtisanAccount(artisanId);
      if (result.error) {
        setError(result.error);
        setOpen(false);
        return;
      }
      setOpen(false);
      if (result.outcome === "suspended" && result.message) {
        setInfo(result.message);
      } else {
        setInfo(null);
      }
      router.refresh();
    });
  }

  if (status !== "APPROVED" && status !== "SUSPENDED") {
    return null;
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      {info && (
        <p className="max-w-md rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {info}
        </p>
      )}
      {error && (
        <p className="max-w-md rounded-md bg-error/10 px-3 py-2 text-xs text-error">{error}</p>
      )}
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {status === "APPROVED" && (
          <button
            type="button"
            title="Suspender orfebre"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={pending}
            onClick={onSuspend}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </svg>
          </button>
        )}
        {status === "SUSPENDED" && (
          <button
            type="button"
            title="Reactivar orfebre"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-emerald-200 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
            disabled={pending}
            onClick={onReactivate}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </button>
        )}
        <ConfirmDestructiveModal
          open={open}
          title="Eliminar cuenta de orfebre"
          description="Solo se elimina por completo si la cuenta no tiene productos publicados, ventas ni pedidos como comprador. Si hay actividad, la cuenta quedará suspendida (no borrada) para conservar trazabilidad."
          confirmLabel="Continuar"
          onCancel={() => setOpen(false)}
          onConfirm={onConfirm}
          pending={pending}
        />
        <button
          type="button"
          title="Eliminar cuenta"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={() => setOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
