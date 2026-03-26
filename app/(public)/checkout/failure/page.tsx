import Link from "next/link";

export const metadata = {
  title: "Error en el Pago",
  description: "Hubo un problema con tu pago. Puedes intentar nuevamente.",
};

export default function CheckoutFailurePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
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
        <h1 className="mb-2 text-2xl font-serif text-text">
          Hubo un problema con tu pago
        </h1>
        <p className="mb-6 text-text-secondary">
          Puedes intentar nuevamente.
        </p>
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
        >
          Volver al checkout
        </Link>
      </div>
    </div>
  );
}
