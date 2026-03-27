import type { Metadata } from "next";
import Link from "next/link";
import { ResendVerificationButton } from "./resend-button";

export const metadata: Metadata = {
  title: "Verificar email — Casa Orfebre",
};

interface Props {
  searchParams: Promise<{ verified?: string }>;
}

export default async function VerificarEmailPage({ searchParams }: Props) {
  const { verified } = await searchParams;

  if (verified === "true") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-8 w-8 text-success"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-text">
            ¡Email verificado exitosamente!
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Ya puedes comprar en Casa Orfebre.
          </p>
          <Link
            href="/coleccion"
            className="mt-6 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Explorar colección
          </Link>
        </div>
      </div>
    );
  }

  if (verified === "false") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-8 w-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-text">
            Enlace de verificación inválido
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            El enlace de verificación ha expirado o es inválido.
          </p>
          <div className="mt-6">
            <ResendVerificationButton />
          </div>
        </div>
      </div>
    );
  }

  // Default state (no query param) — informational
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <svg
            className="h-8 w-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-text">
          Revisa tu correo
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Te enviamos un enlace de verificación a tu email. Revisa tu bandeja de
          entrada (y spam) para confirmar tu cuenta.
        </p>
        <div className="mt-6">
          <ResendVerificationButton />
        </div>
      </div>
    </div>
  );
}
