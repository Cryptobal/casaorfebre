import Link from "next/link";

export const metadata = {
  title: "Pago no completado",
  description:
    "Volviste desde Mercado Pago o el pago no se completó. Puedes reintentar.",
};

function isNullishParam(v: string | undefined): boolean {
  return v == null || v === "" || v === "null";
}

export default async function CheckoutFailurePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string): string | undefined => {
    const v = sp[key];
    if (typeof v === "string") return v;
    if (Array.isArray(v) && v[0]) return v[0];
    return undefined;
  };

  const status = get("status");
  const collectionStatus = get("collection_status");
  const paymentId = get("payment_id");
  const externalReference = get("external_reference");

  /** Mercado Pago envía parámetros en null cuando el usuario vuelve sin pagar ("Volver a la tienda"). */
  const abandonedCheckout =
    isNullishParam(status) &&
    isNullishParam(collectionStatus) &&
    isNullishParam(paymentId);

  const paymentRejected =
    collectionStatus === "rejected" ||
    status === "rejected" ||
    collectionStatus === "failure" ||
    status === "failure";

  if (abandonedCheckout) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
            <svg
              className="h-8 w-8 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-serif text-text">
            Volviste sin completar el pago
          </h1>
          <p className="mb-6 text-text-secondary">
            No se realizó ningún cargo. Puedes volver al checkout o, si ya
            tenías un pedido pendiente, continuar el pago desde tu portal.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              Ir al checkout
            </Link>
            {externalReference && !isNullishParam(externalReference) ? (
              <Link
                href={`/portal/comprador/pedidos/${externalReference}`}
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background"
              >
                Ver mi pedido pendiente
              </Link>
            ) : (
              <Link
                href="/portal/comprador/pedidos"
                className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background"
              >
                Mis pedidos
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center text-sm font-medium text-text-secondary underline-offset-4 hover:text-text hover:underline"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-serif text-text">
          {paymentRejected
            ? "El pago fue rechazado"
            : "Hubo un problema con tu pago"}
        </h1>
        <p className="mb-6 text-text-secondary">
          {paymentRejected
            ? "Tu banco o medio de pago rechazó la operación. Puedes probar con otro medio o contactar a tu banco."
            : "No pudimos confirmar el resultado. Si se descontó el monto, revisa tu correo o contacta soporte."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Volver al checkout
          </Link>
          {externalReference && !isNullishParam(externalReference) ? (
            <Link
              href={`/portal/comprador/pedidos/${externalReference}`}
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background"
            >
              Ver pedido
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
