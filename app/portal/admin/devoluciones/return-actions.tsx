"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  approveReturn,
  rejectReturn,
  processRefund,
  markReturnReceived,
} from "@/lib/actions/admin";

interface ReturnActionsProps {
  returnRequestId: string;
  currentStatus: string;
}

export function ReturnActions({
  returnRequestId,
  currentStatus,
}: ReturnActionsProps) {
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReturn(returnRequestId);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Devolucion aprobada" });
      }
    });
  }

  function handleReject() {
    const formData = new FormData();
    formData.set("adminNotes", rejectReason);
    startTransition(async () => {
      const result = await rejectReturn(returnRequestId, formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Devolucion rechazada" });
        setShowReject(false);
      }
    });
  }

  function handleRefund() {
    if (!refundAmount) {
      setFeedback({ type: "error", message: "Ingresa el monto a reembolsar" });
      return;
    }
    const formData = new FormData();
    formData.set("refundAmount", refundAmount);
    startTransition(async () => {
      const result = await processRefund(returnRequestId, formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Reembolso procesado" });
      }
    });
  }

  if (feedback?.type === "success") {
    return <p className="text-sm text-green-700">{feedback.message}</p>;
  }

  return (
    <div className="space-y-3">
      {feedback?.type === "error" && (
        <p className="text-sm text-red-700">{feedback.message}</p>
      )}

      {currentStatus === "REQUESTED" && (
        <>
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
                placeholder="Razon del rechazo"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
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
        </>
      )}

      {currentStatus === "SHIPPED_BACK" && (
        <Button
          size="sm"
          className="bg-blue-700 text-white hover:bg-blue-800"
          onClick={() => {
            startTransition(async () => {
              const result = await markReturnReceived(returnRequestId);
              if (result.error) {
                setFeedback({ type: "error", message: result.error });
              } else {
                setFeedback({ type: "success", message: "Devolucion marcada como recibida" });
              }
            });
          }}
          disabled={isPending}
          loading={isPending}
        >
          Marcar como Recibida
        </Button>
      )}

      {["APPROVED", "SHIPPED_BACK", "RECEIVED_BY_ARTISAN"].includes(
        currentStatus
      ) && (
        <div className="space-y-2">
          <label className="mb-1 block text-xs uppercase tracking-widest text-text-tertiary">
            Monto a reembolsar (CLP)
          </label>
          <input
            type="number"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            placeholder="Ej: 25000"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            min={1}
            disabled={isPending}
          />
          <Button
            size="sm"
            onClick={handleRefund}
            disabled={isPending}
            loading={isPending}
          >
            Procesar Reembolso
          </Button>
        </div>
      )}
    </div>
  );
}
