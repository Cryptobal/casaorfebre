import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-text">
        Página no encontrada
      </h1>
      <p className="mt-4 max-w-md text-text-secondary">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
