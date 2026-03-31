"use client";

import { useState, useTransition } from "react";
import { markArtisanPaid } from "@/lib/actions/admin";

interface MarkPaidButtonProps {
  artisanId: string;
  artisanName: string;
}

export function MarkPaidButton({ artisanId, artisanName }: MarkPaidButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleClick() {
    if (!confirm(`Confirmar pago a ${artisanName}?`)) return;

    startTransition(async () => {
      const result = await markArtisanPaid(artisanId);
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
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {isPending ? "Procesando..." : "Marcar como pagado"}
      </button>
      {feedback?.type === "error" && (
        <p className="mt-1 text-xs text-red-600">{feedback.message}</p>
      )}
    </div>
  );
}
