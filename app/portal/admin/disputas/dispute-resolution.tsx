"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resolveDispute } from "@/lib/actions/admin";

interface DisputeResolutionProps {
  disputeId: string;
}

const statusOptions = [
  { value: "RESOLVED_REFUND", label: "Reembolso Total" },
  { value: "RESOLVED_PARTIAL_REFUND", label: "Reembolso Parcial" },
  { value: "RESOLVED_NO_REFUND", label: "Sin Reembolso" },
  { value: "CLOSED", label: "Cerrar" },
];

export function DisputeResolution({ disputeId }: DisputeResolutionProps) {
  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!status || !resolution) {
      setFeedback({
        type: "error",
        message: "Selecciona un estado y escribe la resolucion",
      });
      return;
    }

    const formData = new FormData();
    formData.set("status", status);
    formData.set("resolution", resolution);

    startTransition(async () => {
      const result = await resolveDispute(disputeId, formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Disputa resuelta" });
      }
    });
  }

  if (feedback?.type === "success") {
    return (
      <p className="text-sm text-green-700">{feedback.message}</p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-text-tertiary">
          Resolucion
        </label>
        <select
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isPending}
        >
          <option value="">Seleccionar estado...</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-text-tertiary">
          Notas de resolucion
        </label>
        <textarea
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          rows={3}
          placeholder="Describe la resolucion..."
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          disabled={isPending}
        />
      </div>

      {feedback?.type === "error" && (
        <p className="text-sm text-red-700">{feedback.message}</p>
      )}

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={isPending}
        loading={isPending}
      >
        Resolver disputa
      </Button>
    </div>
  );
}
