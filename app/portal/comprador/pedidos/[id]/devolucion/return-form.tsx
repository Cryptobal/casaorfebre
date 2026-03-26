"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createReturnRequest } from "@/lib/actions/returns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const reasonOptions = [
  { value: "", label: "Selecciona un motivo" },
  { value: "NOT_AS_DESCRIBED", label: "No coincide con la descripcion" },
  { value: "DAMAGED_ON_ARRIVAL", label: "Llego danado" },
  { value: "WRONG_ITEM", label: "Producto equivocado" },
  { value: "BUYER_REGRET", label: "Arrepentimiento" },
  { value: "DEFECTIVE", label: "Defecto de fabricacion" },
  { value: "OTHER", label: "Otro" },
];

interface ReturnFormProps {
  orderItemId: string;
  orderId: string;
}

export function ReturnForm({ orderItemId, orderId }: ReturnFormProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return createReturnRequest(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/portal/comprador/pedidos/${orderId}`);
    }
  }, [state?.success, orderId, router]);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="orderItemId" value={orderItemId} />
      <input type="hidden" name="imageUrls" value="[]" />

      <div>
        <Label htmlFor="reason">Motivo de la devolucion</Label>
        <select
          id="reason"
          name="reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        >
          {reasonOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic shipping info based on reason */}
      {reason === "BUYER_REGRET" && (
        <p className="text-sm text-amber-700">
          El envio de devolucion corre por tu cuenta
        </p>
      )}
      {reason && reason !== "BUYER_REGRET" && (
        <p className="text-sm text-green-700">
          El envio de devolucion es cubierto por la plataforma
        </p>
      )}

      <div>
        <Label htmlFor="description">
          Descripcion <span className="text-text-tertiary">(opcional)</span>
        </Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          placeholder="Informacion adicional sobre la devolucion..."
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={isPending}>
          Solicitar Devolucion
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/portal/comprador/pedidos/${orderId}`)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
