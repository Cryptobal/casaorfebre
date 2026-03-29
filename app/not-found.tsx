import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-cormorant text-4xl font-semibold tracking-tight text-foreground">
        Página no encontrada
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
