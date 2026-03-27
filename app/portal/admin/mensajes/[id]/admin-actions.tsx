"use client";

import { useState, useTransition } from "react";
import { adminBlockConversation, adminSendWarning } from "@/lib/actions/chat";
import { useRouter } from "next/navigation";

export function AdminConversationActions({
  conversationId,
  status,
  artisanId,
}: {
  conversationId: string;
  status: string;
  artisanId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [warningTarget, setWarningTarget] = useState<"BUYER" | "ARTISAN" | null>(null);
  const [warningText, setWarningText] = useState("");
  const [confirmBlock, setConfirmBlock] = useState(false);

  function handleBlock() {
    if (!confirmBlock) {
      setConfirmBlock(true);
      return;
    }
    startTransition(async () => {
      await adminBlockConversation(conversationId, "Esta conversación ha sido bloqueada por el equipo de Casa Orfebre.");
      router.refresh();
      setConfirmBlock(false);
    });
  }

  function handleSendWarning() {
    if (!warningTarget || !warningText.trim()) return;
    startTransition(async () => {
      await adminSendWarning(conversationId, warningTarget, warningText.trim());
      setWarningTarget(null);
      setWarningText("");
      router.refresh();
    });
  }

  async function handleSuspendArtisan() {
    if (!confirm("¿Seguro que quieres suspender a este orfebre? Esta acción es grave.")) return;
    if (!confirm("CONFIRMACIÓN FINAL: El orfebre será suspendido y no podrá vender. ¿Continuar?")) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/suspend-artisan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId }),
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
        Acciones del administrador
      </p>
      <div className="flex flex-wrap gap-2">
        {status !== "BLOCKED" && (
          <button
            onClick={handleBlock}
            disabled={isPending}
            className={`rounded-md px-4 py-2.5 text-sm font-medium min-h-[44px] ${
              confirmBlock
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-red-200 text-red-700 hover:bg-red-50"
            } disabled:opacity-50`}
          >
            {confirmBlock ? "Confirmar bloqueo" : "Bloquear conversación"}
          </button>
        )}
        {confirmBlock && (
          <button
            onClick={() => setConfirmBlock(false)}
            className="rounded-md border border-border px-4 py-2.5 text-sm min-h-[44px]"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={() => setWarningTarget("ARTISAN")}
          disabled={isPending}
          className="rounded-md border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 min-h-[44px]"
        >
          Aviso al orfebre
        </button>
        <button
          onClick={() => setWarningTarget("BUYER")}
          disabled={isPending}
          className="rounded-md border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 min-h-[44px]"
        >
          Aviso al comprador
        </button>
        <button
          onClick={handleSuspendArtisan}
          disabled={isPending}
          className="rounded-md border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 min-h-[44px]"
        >
          Suspender orfebre
        </button>
      </div>

      {warningTarget && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <p className="mb-2 text-sm font-medium text-amber-800">
            Enviar aviso al {warningTarget === "BUYER" ? "comprador" : "orfebre"}:
          </p>
          <textarea
            value={warningText}
            onChange={(e) => setWarningText(e.target.value)}
            placeholder="Escribe el mensaje de advertencia..."
            rows={3}
            className="mb-2 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSendWarning}
              disabled={isPending || !warningText.trim()}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 min-h-[44px]"
            >
              Enviar aviso
            </button>
            <button
              onClick={() => { setWarningTarget(null); setWarningText(""); }}
              className="rounded-md border border-border px-4 py-2 text-sm min-h-[44px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
