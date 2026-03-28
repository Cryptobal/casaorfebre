import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { generateQRCodeSVG } from "@/lib/certificates";
import Link from "next/link";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const cert = await prisma.certificate.findUnique({ where: { code } });
  if (!cert) {
    return { title: "Certificado no encontrado" };
  }
  return {
    title: `Certificado ${cert.code}`,
    description: `Registro de pieza y orfebre en Casa Orfebre (trazabilidad). Orfebre: ${cert.artisanName}.`,
    alternates: { canonical: `/verificar/${code}` },
    twitter: {
      card: "summary" as const,
      title: `Certificado ${cert.code} | Casa Orfebre`,
      description: `Registro de pieza y orfebre en Casa Orfebre (trazabilidad). Orfebre: ${cert.artisanName}.`,
    },
  };
}

export default async function VerificarPage({ params }: Props) {
  const { code } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { code },
    include: {
      product: { select: { name: true, slug: true } },
    },
  });

  if (!cert) {
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
            Certificado no encontrado
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            El codigo ingresado no corresponde a ningun certificado de
            autenticidad registrado en Casa Orfebre. Verifica que el codigo sea
            correcto e intenta nuevamente.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // QR SVG is generated from our own trusted certificate code via the qrcode library — safe to render
  const qrSvg = await generateQRCodeSVG(cert.code);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
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
            {cert.code}
          </p>

          {/* Info cards */}
          <div className="mt-8 space-y-3 text-left">
            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Pieza
              </p>
              <Link
                href={`/coleccion/${cert.product.slug}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                {cert.product.name}
              </Link>
            </div>

            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Materiales
              </p>
              <p className="text-sm text-text">{cert.materials}</p>
            </div>

            {cert.technique && (
              <div className="rounded-md bg-background px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Tecnica
                </p>
                <p className="text-sm text-text">{cert.technique}</p>
              </div>
            )}

            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Orfebre
              </p>
              <p className="text-sm text-text">{cert.artisanName}</p>
            </div>

            <div className="rounded-md bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Fecha de emision
              </p>
              <p className="text-sm text-text">
                {cert.issuedAt.toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* QR Code — generated server-side from trusted certificate code */}
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
