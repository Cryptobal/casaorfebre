"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBuyerUser } from "@/lib/actions/admin";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";
import { Button } from "@/components/ui/button";

interface BuyerRowDeleteProps {
  buyerId: string;
  canDelete: boolean;
  blockReason?: string;
  /** compact = solo icono en tabla */
  compact?: boolean;
}

export function BuyerRowDelete({
  buyerId,
  canDelete,
  blockReason,
  compact,
}: BuyerRowDeleteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteBuyerUser(buyerId);
      if (result.error) {
        setError(result.error);
        setOpen(false);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!canDelete) {
    return (
      <span className="text-xs text-text-tertiary" title={blockReason}>
        —
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      {error && <span className="max-w-[200px] text-xs text-error">{error}</span>}
      <ConfirmDestructiveModal
        open={open}
        title="Eliminar comprador"
        description="Se eliminará la cuenta y los datos que no estén ligados a pedidos. No uses esta acción si el comprador tiene historial de compras."
        confirmLabel="Sí, eliminar"
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
        pending={pending}
      />
      <Button
        type="button"
        size={compact ? "sm" : "md"}
        variant="secondary"
        className="border-red-300 text-red-700 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        Eliminar
      </Button>
    </div>
  );
}
