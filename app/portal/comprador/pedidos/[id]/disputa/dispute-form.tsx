"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createDispute } from "@/lib/actions/disputes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const reasonOptions = [
  { value: "", label: "Selecciona un motivo" },
  { value: "NOT_AS_DESCRIBED", label: "El producto no coincide con la descripcion" },
  { value: "NOT_RECEIVED", label: "No recibi el producto" },
  { value: "DAMAGED", label: "El producto llego danado" },
  { value: "WRONG_ITEM", label: "Recibi un producto equivocado" },
  { value: "OTHER", label: "Otro motivo" },
];

interface DisputeFormProps {
  orderId: string;
}

export function DisputeForm({ orderId }: DisputeFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return createDispute(formData);
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
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="imageUrls" value="[]" />

      <div>
        <Label htmlFor="reason">Motivo de la disputa</Label>
        <select
          id="reason"
          name="reason"
          required
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        >
          {reasonOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Descripcion</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          placeholder="Describe el problema con el mayor detalle posible..."
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={isPending}>
          Enviar Disputa
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
