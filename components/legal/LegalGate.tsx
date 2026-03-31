"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptSellerAgreement } from "@/lib/actions/legal";
import Link from "next/link";

export function LegalGate() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAccept() {
    setLoading(true);
    setError(null);
    const result = await acceptSellerAgreement();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-16">
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-surface p-8">
        <h1 className="font-serif text-2xl font-light text-text">
          Antes de continuar, necesitamos tu aceptaci&oacute;n
        </h1>
        <p className="mt-4 text-sm font-light text-text-secondary">
          Para operar en Casa Orfebre, debes aceptar nuestro Acuerdo de Orfebre.
          Este documento regula la relaci&oacute;n comercial entre t&uacute; y
          la plataforma, incluyendo comisiones, obligaciones, propiedad
          intelectual y m&aacute;s.
        </p>

        <div className="mt-6">
          <Link
            href="/acuerdo-orfebre"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Leer el Acuerdo de Orfebre completo
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm font-light text-text-secondary">
            He le&iacute;do y acepto el{" "}
            <Link
              href="/acuerdo-orfebre"
              target="_blank"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Acuerdo de Orfebre
            </Link>
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!accepted || loading}
          className="mt-6 w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Continuar al portal"}
        </button>
      </div>
    </main>
  );
}
