"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { removeOrSuspendArtisanAccount, suspendArtisan } from "@/lib/actions/admin";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";

interface ArtisanAccountActionsProps {
  artisanId: string;
  status: string;
}

export function ArtisanAccountActions({ artisanId, status }: ArtisanAccountActionsProps) {
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
    <div className="flex flex-wrap items-center gap-2">
      {info && (
        <p className="w-full rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {info}
        </p>
      )}
      {error && (
        <p className="w-full rounded-md bg-error/10 px-3 py-2 text-xs text-error">{error}</p>
      )}
      {status === "APPROVED" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="border-red-300 text-red-700 hover:bg-red-50"
          disabled={pending}
          onClick={onSuspend}
        >
          Suspender
        </Button>
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
      <Button type="button" size="sm" variant="secondary" className="border-border" onClick={() => setOpen(true)}>
        Eliminar cuenta…
      </Button>
    </div>
  );
}
