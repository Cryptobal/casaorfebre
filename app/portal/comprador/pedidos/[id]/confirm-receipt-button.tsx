"use client";

import { useState, useTransition } from "react";
import { confirmReceipt } from "@/lib/actions/confirm-receipt";

export function ConfirmReceiptButton({ orderItemId }: { orderItemId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Recepción confirmada
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await confirmReceipt(orderItemId);
          if (result.success) setConfirmed(true);
        });
      }}
      className="min-h-[44px] rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
    >
      {isPending ? "Confirmando..." : "Confirmar recepción"}
    </button>
  );
}
