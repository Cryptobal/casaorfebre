import type { Metadata } from "next";
import { generateQRCodeSVG } from "@/lib/certificates";

export const metadata: Metadata = {
  title: "Certificado de Ejemplo — Casa Orfebre",
  description:
    "Ejemplo de certificado de autenticidad con QR verificable de Casa Orfebre.",
  robots: "noindex, nofollow",
};

const DEMO_CERT = {
  code: "CO-CERT-A7K3M9X2",
  productName: "Anillo Raíces de Plata",
  materials: "Plata 950, Cuarzo rosa",
  technique: "Forjado y engaste artesanal",
  artisanName: "María Elena Contreras",
};

export default async function VerificarDemoPage() {
  // Pass "demo" so the QR URL points to /verificar/demo (this same page)
  const qrSvg = await generateQRCodeSVG("demo");

  const issuedDate = new Date().toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Demo banner */}
        <div className="mb-4 rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800">
            Este es un certificado de ejemplo con fines demostrativos
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          {/* Green checkmark */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
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
            Registro verificado
          </h1>
          <p className="mt-3 text-sm font-light text-text-secondary">
            Certificado digital de trazabilidad Casa Orfebre
          </p>

          <p className="mt-2 font-mono text-sm tracking-wider text-accent">
            {DEMO_CERT.code}
          </p>

          {/* Info cards */}
          <div className="mt-8 space-y-3 text-left">
            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Pieza
              </p>
              <p className="text-sm font-medium text-accent">
                {DEMO_CERT.productName}
              </p>
            </div>

            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Materiales
              </p>
              <p className="text-sm text-text">{DEMO_CERT.materials}</p>
            </div>

            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Tecnica
              </p>
              <p className="text-sm text-text">{DEMO_CERT.technique}</p>
            </div>

            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Orfebre
              </p>
              <p className="text-sm text-text">{DEMO_CERT.artisanName}</p>
            </div>

            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Fecha de emision
              </p>
              <p className="text-sm text-text">{issuedDate}</p>
            </div>
          </div>

          {/* QR Code — generated server-side from trusted hardcoded demo code */}
          <div className="mt-8 flex justify-center">
            <div
              className="inline-block"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>

          <p className="mt-6 text-left text-xs leading-relaxed text-text-tertiary">
            Este registro confirma que la pieza está asociada a su publicación y al
            orfebre en Casa Orfebre (código verificable). La declaración de materiales
            en la ficha es responsabilidad del orfebre; Casa Orfebre no sustituye un
            ensayo metalúrgico de laboratorio.
          </p>
        </div>
      </div>
    </div>
  );
}
