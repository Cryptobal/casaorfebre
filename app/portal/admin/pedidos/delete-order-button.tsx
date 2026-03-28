"use client";

import { useState, useTransition } from "react";
import { adminDeleteOrder } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface DeleteOrderButtonProps {
  orderId: string;
  orderNumber: string;
}

export function DeleteOrderButton({
  orderId,
  orderNumber,
}: DeleteOrderButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteOrder(orderId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      } else {
        router.refresh();
      }
    });
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-red-600">
          ¿Eliminar #{orderNumber}?
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "…" : "Sí"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs text-text-secondary hover:text-text"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        title={`Eliminar pedido #${orderNumber}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-tertiary transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </>
  );
}
