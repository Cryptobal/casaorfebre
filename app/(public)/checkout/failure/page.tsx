import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

export const metadata = {
  title: "Pago no completado — Casa Orfebre",
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

  const abandonedCheckout =
    isNullishParam(status) &&
    isNullishParam(collectionStatus) &&
    isNullishParam(paymentId);

  const paymentRejected =
    collectionStatus === "rejected" ||
    status === "rejected" ||
    collectionStatus === "failure" ||
    status === "failure";

  const hasOrderRef =
    externalReference && !isNullishParam(externalReference);

  const order = hasOrderRef
    ? await prisma.order.findUnique({
        where: { id: externalReference },
        select: {
          orderNumber: true,
          total: true,
          status: true,
        },
      })
    : null;

  const orderIsPending = order?.status === "PENDING_PAYMENT";

  /* ---------- Abandoned (user clicked "back to store") ---------- */
  if (abandonedCheckout) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
            <svg
              className="h-8 w-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-serif text-text">
            Volviste sin completar el pago
          </h1>
          <p className="text-text-secondary">
            No se realizó ningún cargo. Tu pedido queda guardado y puedes
            completar el pago cuando quieras.
          </p>

          {order && orderIsPending && (
            <div className="mx-auto mt-6 rounded-lg border border-border bg-surface p-4 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Pedido</span>
                <span className="font-mono font-semibold text-text">
                  #{order.orderNumber}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-text-secondary">Total</span>
                <span className="font-semibold text-text tabular-nums">
                  {formatCLP(order.total)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {hasOrderRef && orderIsPending ? (
              <Link
                href={`/portal/comprador/pedidos/${externalReference}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    width="18"
                    height="11"
                    x="3"
                    y="11"
                    rx="2"
                    ry="2"
                  />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Completar pago del pedido
              </Link>
            ) : (
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
              >
                Ir al checkout
              </Link>
            )}
            <Link
              href="/coleccion"
              className="inline-flex items-center justify-center text-sm font-medium text-text-secondary underline-offset-4 hover:text-text hover:underline"
            >
              Seguir explorando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Payment rejected or unknown error ---------- */
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
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
        <p className="text-text-secondary">
          {paymentRejected
            ? "Tu banco o medio de pago rechazó la operación. Puedes probar con otro medio de pago o contactar a tu banco."
            : "No pudimos confirmar el resultado. Si se descontó el monto, revisa tu correo o contacta soporte."}
        </p>

        {order && orderIsPending && (
          <div className="mx-auto mt-6 rounded-lg border border-border bg-surface p-4 text-left text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Pedido</span>
              <span className="font-mono font-semibold text-text">
                #{order.orderNumber}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-text-secondary">Total</span>
              <span className="font-semibold text-text tabular-nums">
                {formatCLP(order.total)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {hasOrderRef && orderIsPending ? (
            <Link
              href={`/portal/comprador/pedidos/${externalReference}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  width="18"
                  height="11"
                  x="3"
                  y="11"
                  rx="2"
                  ry="2"
                />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Reintentar pago
            </Link>
          ) : (
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              Volver al checkout
            </Link>
          )}
          <Link
            href="/portal/comprador/pedidos"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-background"
          >
            Mis pedidos
          </Link>
        </div>

        <p className="mt-6 text-xs text-text-tertiary">
          Si necesitas ayuda, escríbenos a{" "}
          <a
            href="mailto:soporte@casaorfebre.cl"
            className="text-accent hover:underline"
          >
            soporte@casaorfebre.cl
          </a>
        </p>
      </div>
    </div>
  );
}
