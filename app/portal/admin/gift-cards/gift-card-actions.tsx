"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelGiftCard } from "@/lib/actions/gift-cards";
import { formatCLP } from "@/lib/utils";

interface GiftCardActionsProps {
  giftCardId: string;
  status: string;
  usages: { amount: number; orderId: string; date: string }[];
}

export function GiftCardActions({ giftCardId, status, usages }: GiftCardActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showUsages, setShowUsages] = useState(false);

  const canCancel = status === "ACTIVE" || status === "PARTIALLY_USED";

  function handleCancel() {
    if (!confirm("¿Cancelar esta Gift Card? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      const result = await cancelGiftCard(giftCardId);
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {usages.length > 0 && (
        <button
          type="button"
          onClick={() => setShowUsages(!showUsages)}
          className="text-xs text-accent hover:underline"
        >
          {showUsages ? "Ocultar" : `${usages.length} uso${usages.length > 1 ? "s" : ""}`}
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="text-xs text-red-600 hover:underline disabled:opacity-50"
        >
          {isPending ? "..." : "Cancelar"}
        </button>
      )}
      {showUsages && usages.length > 0 && (
        <div className="absolute right-0 z-10 mt-1 w-64 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="mb-2 text-xs font-medium text-text-tertiary">Historial de uso</p>
          {usages.map((u, i) => (
            <div key={i} className="flex justify-between border-t border-border py-1.5 text-xs">
              <span className="text-text-secondary">{u.date}</span>
              <span className="font-medium text-text">{formatCLP(u.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
