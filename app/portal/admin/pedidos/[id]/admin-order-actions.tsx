"use client";

import { useTransition } from "react";
import { updateOrderStatus, releasePayoutManually } from "@/lib/actions/admin-orders";
import { formatCLP } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, { value: OrderStatus; label: string }[]>> = {
  PAID: [{ value: "CANCELLED", label: "Cancelar pedido" }],
  SHIPPED: [{ value: "DELIVERED", label: "Forzar entrega" }],
  PARTIALLY_SHIPPED: [{ value: "DELIVERED", label: "Forzar entrega" }],
  DELIVERED: [{ value: "REFUNDED", label: "Reembolsar" }],
  COMPLETED: [{ value: "REFUNDED", label: "Reembolsar" }],
};

export function AdminStatusChanger({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const transitions = ALLOWED_TRANSITIONS[currentStatus];

  if (!transitions || transitions.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-secondary">Cambiar estado:</span>
      {transitions.map((t) => (
        <button
          key={t.value}
          disabled={isPending}
          onClick={() => {
            if (!confirm(`¿Cambiar estado a "${t.label}"? Esta acción no se puede deshacer.`)) return;
            startTransition(async () => {
              await updateOrderStatus(orderId, t.value);
            });
          }}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background hover:text-text disabled:opacity-50"
        >
          {isPending ? "..." : t.label}
        </button>
      ))}
    </div>
  );
}

export function ReleasePayoutButton({
  orderItemId,
  artisanName,
  amount,
}: {
  orderItemId: string;
  artisanName: string;
  amount: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (
          !confirm(
            `¿Liberar ${formatCLP(amount)} al orfebre ${artisanName}? Esta acción no se puede deshacer.`
          )
        )
          return;
        startTransition(async () => {
          await releasePayoutManually(orderItemId);
        });
      }}
      className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
    >
      {isPending ? "Liberando..." : "Liberar pago"}
    </button>
  );
}
