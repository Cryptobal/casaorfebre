"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";
import {
  adminSuspendProduct,
  adminReactivateProduct,
  adminDeleteProduct,
} from "@/lib/actions/admin";

interface AdminProductActionsProps {
  productId: string;
  status: string;
  hasSales: boolean;
}

export function AdminProductActions({ productId, status, hasSales }: AdminProductActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function onSuspend() {
    setFeedback(null);
    startTransition(async () => {
      const r = await adminSuspendProduct(productId);
      if (r.error) setFeedback({ type: "error", message: r.error });
      else setFeedback({ type: "success", message: "Producto pausado" });
      router.refresh();
    });
  }

  function onReactivate() {
    setFeedback(null);
    startTransition(async () => {
      const r = await adminReactivateProduct(productId);
      if (r.error) setFeedback({ type: "error", message: r.error });
      else setFeedback({ type: "success", message: "Producto reactivado" });
      router.refresh();
    });
  }

  function onDelete() {
    setFeedback(null);
    startTransition(async () => {
      const r = await adminDeleteProduct(productId);
      if (r.error) setFeedback({ type: "error", message: r.error });
      else setFeedback({ type: "success", message: "Producto eliminado" });
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {feedback && (
        <p className={`w-full text-xs ${feedback.type === "success" ? "text-green-700" : "text-red-700"}`}>
          {feedback.message}
        </p>
      )}

      {status === "APPROVED" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
          disabled={pending}
          onClick={onSuspend}
        >
          Pausar
        </Button>
      )}

      {status === "PAUSED" && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
          disabled={pending}
          onClick={onReactivate}
        >
          Reactivar
        </Button>
      )}

      <ConfirmDestructiveModal
        open={deleteOpen}
        title="Eliminar producto"
        description={
          hasSales
            ? "Este producto tiene ventas registradas. No se puede eliminar, pero puedes pausarlo."
            : "Se eliminará permanentemente este producto y todas sus imágenes. Esta acción no se puede deshacer."
        }
        confirmLabel={hasSales ? "Entendido" : "Eliminar"}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={hasSales ? () => setDeleteOpen(false) : onDelete}
        pending={pending}
      />

      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="border-red-300 text-red-700 hover:bg-red-50"
        onClick={() => setDeleteOpen(true)}
        disabled={pending}
      >
        Eliminar
      </Button>
    </div>
  );
}
