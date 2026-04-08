"use client";

import { useActionState } from "react";
import { updateArtisanConsent } from "@/lib/actions/consent";

interface Props {
  consentTerms: boolean;
  consentTermsAt: string | null;
  consentMarketing: boolean;
  consentMarketingAt: string | null;
  consentSocialMedia: boolean;
  consentSocialMediaAt: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ConsentForm({
  consentTerms,
  consentTermsAt,
  consentMarketing,
  consentMarketingAt,
  consentSocialMedia,
  consentSocialMediaAt,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateArtisanConsent,
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

      {/* T&C — no revocable */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={consentTerms}
            disabled
            className="mt-1 h-4 w-4 rounded border-border text-accent"
          />
          <div>
            <p className="text-sm font-medium text-text">
              Términos y Condiciones y Política de Privacidad
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Requerido para operar en la Plataforma. No es revocable sin
              eliminar la cuenta.
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Otorgado el {formatDate(consentTermsAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Redes sociales — revocable */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consentSocialMedia"
            defaultChecked={consentSocialMedia}
            className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <div>
            <p className="text-sm font-medium text-text">
              Uso de fotografías en redes sociales
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Autorizo a Casa Orfebre a exhibir mis fotografías de productos
              en Instagram, Pinterest, Google Shopping y publicidad digital.
            </p>
            {consentSocialMediaAt && (
              <p className="mt-1 text-xs text-text-tertiary">
                Última actualización: {formatDate(consentSocialMediaAt)}
              </p>
            )}
          </div>
        </label>
      </div>

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
              Acepto recibir newsletters, novedades y comunicaciones de
              marketing de Casa Orfebre.
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
