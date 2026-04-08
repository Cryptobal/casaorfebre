"use client";

import { useActionState } from "react";
import { updateBuyerConsent } from "@/lib/actions/consent";

interface Props {
  consentMarketing: boolean;
  consentMarketingAt: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BuyerConsentForm({
  consentMarketing,
  consentMarketingAt,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateBuyerConsent,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Preferencias actualizadas correctamente.
        </p>
      )}
      {state?.error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      {/* Marketing — revocable */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consentMarketing"
            defaultChecked={consentMarketing}
            className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <div>
            <p className="text-sm font-medium text-text">
              Comunicaciones promocionales
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Acepto recibir newsletters, novedades sobre nuevas colecciones
              y comunicaciones de marketing de Casa Orfebre. Puedo revocar
              este consentimiento en cualquier momento.
            </p>
            {consentMarketingAt && (
              <p className="mt-1 text-xs text-text-tertiary">
                Última actualización: {formatDate(consentMarketingAt)}
              </p>
            )}
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar preferencias"}
      </button>
    </form>
  );
}
