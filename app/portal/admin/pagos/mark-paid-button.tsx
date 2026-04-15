"use client";

import { useState, useTransition } from "react";
import { markArtisanPaid } from "@/lib/actions/admin";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface MarkPaidButtonProps {
  artisanId: string;
  artisanName: string;
}

export function MarkPaidButton({ artisanId, artisanName }: MarkPaidButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await markArtisanPaid(artisanId);
      setConfirming(false);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Marcado como pagado" });
      }
    });
  }

  if (feedback?.type === "success") {
    return (
      <span className="text-xs font-medium text-green-700">
        {feedback.message}
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={isPending}
        className="touch-manipulation rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {isPending ? "Procesando..." : "Marcar como pagado"}
      </button>
      {feedback?.type === "error" && (
        <p className="mt-1 text-xs text-red-600">{feedback.message}</p>
      )}
      <ConfirmModal
        open={confirming}
        title="Confirmar pago"
        message={`¿Confirmar pago a ${artisanName}? Esta acción no se puede deshacer.`}
        confirmLabel="Confirmar pago"
        loading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
