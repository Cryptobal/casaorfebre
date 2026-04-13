"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelReturnRequest } from "@/lib/actions/returns";

export function CancelReturnButton({ returnRequestId }: { returnRequestId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (feedback) {
    return <span className="text-[11px] text-green-700">{feedback}</span>;
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="min-h-[44px] rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
      >
        Cancelar devolución
        <span className="text-[11px] text-red-500 block mt-0.5">Retirar solicitud de devolución</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        className="border-red-300 text-red-700 hover:bg-red-50"
        onClick={() => {
          startTransition(async () => {
            const result = await cancelReturnRequest(returnRequestId);
            if (result.error) {
              setFeedback(result.error);
            } else {
              setFeedback("Devolución cancelada");
            }
          });
        }}
        disabled={isPending}
        loading={isPending}
      >
        Confirmar cancelación
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setShowConfirm(false)}
        disabled={isPending}
      >
        No, mantener
      </Button>
    </div>
  );
}
