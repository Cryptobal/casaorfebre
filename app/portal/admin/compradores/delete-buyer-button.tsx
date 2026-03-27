"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteBuyerUser } from "@/lib/actions/admin";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";

interface DeleteBuyerButtonProps {
  buyerId: string;
  /** Si hay pedidos, no se puede borrar (el servidor también valida). */
  canDelete: boolean;
  blockReason?: string;
}

export function DeleteBuyerButton({
  buyerId,
  canDelete,
  blockReason,
}: DeleteBuyerButtonProps) {
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
        router.push("/portal/admin/compradores");
        router.refresh();
      }
    });
  }

  if (!canDelete) {
    return (
      <p className="text-sm text-text-tertiary">
        {blockReason ||
          "No se puede eliminar este comprador mientras tenga datos que requieran conservarse (por ejemplo pedidos)."}
      </p>
    );
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">
        Zona de peligro
      </h2>
      {error && (
        <p className="mb-3 rounded-md bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
      )}
      <ConfirmDestructiveModal
        open={open}
        title="Eliminar comprador"
        description="Se eliminará de forma permanente la cuenta de este comprador y los datos asociados que no estén ligados a pedidos (favoritos, reseñas sin pedido vinculado, etc.). Si en el futuro necesitas borrar cuentas con historial de compras, habría que definir un proceso de anonimización por obligaciones legales y contables."
        confirmLabel="Sí, eliminar cuenta"
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
        pending={pending}
      />
      <Button
        type="button"
        variant="secondary"
        className="border-red-300 text-red-700 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        Eliminar comprador
      </Button>
    </div>
  );
}
