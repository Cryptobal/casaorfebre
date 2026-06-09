import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { PurchaseTracker } from "./purchase-tracker";

export const metadata = {
  title: "Estado de tu pedido — Casa Orfebre",
  description: "Revisa el estado de tu compra en Casa Orfebre.",
  alternates: { canonical: "/checkout/success" },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const externalReference = params.external_reference as string | undefined;

  const order = externalReference
    ? await prisma.order.findUnique({
        where: { id: externalReference },
        select: {
          orderNumber: true,
          total: true,
          status: true,
          shippingCity: true,
          shippingRegion: true,
          items: {
            select: { productName: true, quantity: true, productPrice: true },
          },
        },
      })
    : null;

  // Only treat the order as confirmed once the webhook has moved it out of
  // PENDING_PAYMENT. MercadoPago can redirect here while the payment is still
  // processing (or with no reference at all), so we must not claim success.
  // Explicit allowlist: REFUNDED/CANCELLED must never show the success state.
  const PAID_STATUSES = ["PAID", "PARTIALLY_SHIPPED", "SHIPPED", "DELIVERED", "COMPLETED"];
  const isPaid = !!order && PAID_STATUSES.includes(order.status);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      {isPaid && order && (
        <PurchaseTracker
          transactionId={externalReference!}
          items={order.items.map((item, i) => ({
            item_id: `item-${i}`,
            item_name: item.productName,
            item_category: "",
            item_brand: "",
            price: item.productPrice,
            quantity: item.quantity,
          }))}
          value={order.total}
          shipping={0}
        />
      )}
      <div className="w-full max-w-lg text-center">
        {/* Status icon: confirmed (check) vs still verifying (clock) */}
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
            isPaid ? "bg-green-100" : "bg-amber-100"
          }`}
        >
          {isPaid ? (
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          ) : (
            <svg
              className="h-10 w-10 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <h1 className="mb-2 text-3xl font-serif text-text">
          {isPaid ? "¡Gracias por tu compra!" : "Estamos confirmando tu pago"}
        </h1>
        <p className="text-text-secondary">
          {isPaid
            ? "Tu pedido está siendo procesado. Recibirás un correo con la confirmación."
            : "Tu pago se está verificando con Mercado Pago. En cuanto se confirme, te enviaremos un correo y verás el pedido en tu cuenta. Esto puede tardar unos minutos."}
        </p>

        {order && (
          <div className="mx-auto mt-8 rounded-lg border border-border bg-surface p-6 text-left">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Pedido
              </p>
              <p className="text-sm font-semibold text-text font-mono">
                #{order.orderNumber}
              </p>
            </div>

            <div className="mt-4 divide-y divide-border">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-text">
                    {item.productName}
                    {item.quantity > 1 && (
                      <span className="ml-1 text-text-tertiary">
                        x{item.quantity}
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums text-text font-medium">
                    {formatCLP(item.productPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="font-medium text-text">Total</span>
              <span className="text-lg font-semibold text-text tabular-nums">
                {formatCLP(order.total)}
              </span>
            </div>

            {(order.shippingCity || order.shippingRegion) && (
              <p className="mt-3 text-xs text-text-tertiary">
                Envío a {[order.shippingCity, order.shippingRegion].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Next steps */}
        <div className="mx-auto mt-8 grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface/60 p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              1
            </div>
            <p className="text-sm font-medium text-text">Confirmación</p>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Recibirás un email con los detalles del pedido.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/60 p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              2
            </div>
            <p className="text-sm font-medium text-text">Preparación</p>
            <p className="mt-0.5 text-xs text-text-tertiary">
              El orfebre preparará tu pieza con cuidado.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/60 p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              3
            </div>
            <p className="text-sm font-medium text-text">Envío</p>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Recibirás tu pieza con certificado de autenticidad.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/portal/comprador/pedidos"
            className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Ver mis pedidos
          </Link>
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
