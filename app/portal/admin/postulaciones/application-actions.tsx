"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  approveApplication,
  rejectApplication,
  deleteArtisanApplication,
} from "@/lib/actions/admin";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";

interface ApplicationActionsProps {
  applicationId: string;
}

export function ApplicationActions({
  applicationId,
}: ApplicationActionsProps) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveApplication(applicationId);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Postulacion aprobada" });
        router.refresh();
      }
    });
  }

  function handleReject() {
    const formData = new FormData();
    formData.set("reason", reason);
    startTransition(async () => {
      const result = await rejectApplication(applicationId, formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Postulacion rechazada" });
        setShowReject(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteArtisanApplication(applicationId);
      if (result.error) {
        setDeleteError(result.error);
        setShowDelete(false);
      } else {
        setShowDelete(false);
        router.refresh();
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
      {deleteError && (
        <p className="text-sm text-red-700">{deleteError}</p>
      )}
      <ConfirmDestructiveModal
        open={showDelete}
        title="Eliminar postulación"
        description="Se eliminarán de forma permanente todos los datos de esta postulación en el servidor (nombre, contacto, biografía, materiales, etc.). Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
        pending={isPending}
      />

      <div className="flex flex-wrap gap-2">
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
        <Button
          size="sm"
          variant="secondary"
          className="border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => setShowDelete(true)}
          disabled={isPending}
        >
          Eliminar
        </Button>
      </div>
      {showReject && (
        <div className="space-y-2">
          <textarea
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            rows={3}
            placeholder="Razon del rechazo (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
