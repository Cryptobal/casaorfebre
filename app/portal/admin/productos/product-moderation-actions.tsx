"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveProduct, rejectProduct } from "@/lib/actions/admin";

interface ProductModerationActionsProps {
  productId: string;
}

export function ProductModerationActions({
  productId,
}: ProductModerationActionsProps) {
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveProduct(productId);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Producto aprobado" });
      }
    });
  }

  function handleReject() {
    const formData = new FormData();
    formData.set("notes", notes);
    startTransition(async () => {
      const result = await rejectProduct(productId, formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Producto rechazado" });
        setShowReject(false);
      }
    });
  }

  if (feedback) {
    return (
      <p
        className={`text-sm ${
          feedback.type === "success" ? "text-green-700" : "text-red-700"
        }`}
      >
        {feedback.message}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-green-700 text-white hover:bg-green-800"
          onClick={handleApprove}
          disabled={isPending}
          loading={isPending && !showReject}
        >
          Aprobar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowReject(!showReject)}
          disabled={isPending}
        >
          Rechazar
        </Button>
      </div>
      {showReject && (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            rows={3}
            placeholder="Notas de rechazo (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button
            size="sm"
            variant="secondary"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={handleReject}
            disabled={isPending}
            loading={isPending}
          >
            Confirmar rechazo
          </Button>
        </div>
      )}
    </div>
  );
}
