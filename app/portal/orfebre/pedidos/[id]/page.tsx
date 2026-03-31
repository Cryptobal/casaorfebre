import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getArtisanOrderDetail } from "@/lib/queries/orders";
import { confirmPreparation } from "@/lib/actions/orders";
import { TrackingLink } from "@/components/tracking-link";
import { ShippingForm } from "./shipping-form";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "Preparando",
  SHIPPED: "Despachado",
  DELIVERED: "Entregado",
  RETURNED: "Devuelto",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PREPARING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  RETURNED: "bg-red-100 text-red-700",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const item = await getArtisanOrderDetail(id, artisan.id);
  if (!item) notFound();

  // Calculate days since order
  const daysSinceOrder = Math.floor(
    (Date.now() - new Date(item.order.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysWarningClass =
    daysSinceOrder >= 5
      ? "text-red-600 font-semibold"
      : daysSinceOrder >= 3
        ? "text-amber-600 font-semibold"
        : "text-text-secondary";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/portal/orfebre/pedidos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a pedidos
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-text">
          Pedido {item.order.orderNumber}
        </h1>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            STATUS_STYLES[item.fulfillmentStatus] ?? "bg-zinc-100 text-zinc-700"
          }`}
        >
          {STATUS_LABELS[item.fulfillmentStatus] ?? item.fulfillmentStatus}
        </span>
      </div>

      {/* Days since order warning */}
      {item.fulfillmentStatus === "PENDING" && (
        <p className={`mt-2 text-sm ${daysWarningClass}`}>
          {daysSinceOrder === 0
            ? "Pedido recibido hoy"
            : `Hace ${daysSinceOrder} dia${daysSinceOrder > 1 ? "s" : ""}`}
          {daysSinceOrder >= 5 && " - Urgente: despacha este pedido lo antes posible"}
          {daysSinceOrder >= 3 && daysSinceOrder < 5 && " - Atencion: este pedido lleva varios dias sin preparar"}
        </p>
      )}

      {/* Order details */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="text-sm font-medium text-text-secondary">Detalle del producto</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="text-text-secondary">Producto:</span> <span className="font-medium text-text">{item.product.name}</span></p>
            <p><span className="text-text-secondary">Cantidad:</span> <span className="text-text">{item.quantity}</span></p>
            <p><span className="text-text-secondary">Precio unitario:</span> <span className="text-text">{formatCLP(item.productPrice)}</span></p>
            <p><span className="text-text-secondary">Total:</span> <span className="font-medium text-text">{formatCLP(item.productPrice * item.quantity)}</span></p>
          </div>
          <div className="mt-3 border-t border-border pt-3 text-sm">
            <p><span className="text-text-secondary">Tu pago neto:</span> <span className="font-medium text-green-700">{formatCLP(item.artisanPayout)}</span></p>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-medium text-text-secondary">Direccion de envio</h2>
          <div className="mt-3 space-y-1 text-sm text-text">
            <p className="font-medium">{item.order.shippingName}</p>
            <p>{item.order.shippingAddress}</p>
            <p>
              {item.order.shippingCity}, {item.order.shippingRegion}
            </p>
            {item.order.shippingPostalCode && (
              <p>CP: {item.order.shippingPostalCode}</p>
            )}
            <p>{item.order.shippingCountry === "CL" ? "Chile" : item.order.shippingCountry}</p>
          </div>
        </Card>
      </div>

      {/* Gift info */}
      {item.order.isGift && (
        <Card className="mt-6 border-amber-200 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="Regalo">🎁</span>
            <h2 className="text-sm font-semibold text-amber-900">
              Este pedido es un regalo
            </h2>
          </div>

          {item.order.giftMessage && (
            <div className="mt-3 rounded-md border border-amber-200 bg-white p-3">
              <p className="text-xs font-medium text-text-secondary">
                Mensaje del comprador para incluir en el paquete:
              </p>
              <p className="mt-1.5 text-sm italic text-text">
                &ldquo;{item.order.giftMessage}&rdquo;
              </p>
            </div>
          )}

          {item.order.giftWrapping && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-white p-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0 text-amber-600"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <p className="text-xs text-amber-800">
                El comprador solicitó empaque de regalo. Por favor incluye caja
                de regalo y escribe el mensaje en una tarjeta.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Fulfillment actions */}
      <Card className="mt-6">
        <h2 className="text-sm font-medium text-text-secondary">Acciones</h2>

        {item.fulfillmentStatus === "PENDING" && (
          <form
            action={async () => {
              "use server";
              await confirmPreparation(item.id);
            }}
            className="mt-4"
          >
            <p className="mb-3 text-sm text-text">
              Confirma que estas preparando este pedido. El comprador sera notificado.
            </p>
            <Button type="submit">Confirmar preparacion</Button>
          </form>
        )}

        {item.fulfillmentStatus === "PREPARING" && (
          <ShippingForm orderItemId={item.id} />
        )}

        {item.fulfillmentStatus === "SHIPPED" && (
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-text">Este pedido ya fue despachado.</p>
            <div className="rounded-md bg-background p-3 space-y-2">
              {item.trackingNumber && (
                <TrackingLink
                  carrier={item.trackingCarrier}
                  trackingNumber={item.trackingNumber}
                />
              )}
              {item.shippedAt && (
                <p><span className="text-text-secondary">Fecha de despacho:</span> <span className="text-text">{new Date(item.shippedAt).toLocaleDateString("es-CL")}</span></p>
              )}
            </div>
          </div>
        )}

        {item.fulfillmentStatus === "DELIVERED" && (
          <div className="mt-4 space-y-3">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              Entregado
            </span>
            {item.deliveredAt && (
              <p className="text-sm text-text-secondary">
                {item.receivedAt
                  ? `Recepción confirmada por el comprador el ${new Date(item.receivedAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}`
                  : item.autoReceivedAt
                    ? `Recepción confirmada automáticamente el ${new Date(item.autoReceivedAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}`
                    : `Entregado el ${new Date(item.deliveredAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}`}
              </p>
            )}

            {/* Payout info */}
            <div className="rounded-md border border-border bg-background p-3 space-y-1">
              <p className="text-sm">
                <span className="text-text-secondary">Tu pago neto:</span>{" "}
                <span className="font-semibold text-green-700">{formatCLP(item.artisanPayout)}</span>
              </p>
              {item.payoutStatus === "HELD" && item.payoutEligibleAt && (
                <p className="text-sm text-text-secondary">
                  Se liberará el{" "}
                  <span className="font-medium text-text">
                    {new Date(item.payoutEligibleAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </p>
              )}
              {item.payoutStatus === "RELEASED" && (
                <p className="text-sm text-green-700 font-medium">
                  Pago liberado{item.payoutAt ? ` el ${new Date(item.payoutAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}` : ""}
                </p>
              )}
              {item.payoutStatus === "DISPUTED" && (
                <p className="text-sm text-red-600 font-medium">
                  Pago retenido por disputa en curso
                </p>
              )}
            </div>

            {item.trackingNumber && (
              <TrackingLink
                carrier={item.trackingCarrier}
                trackingNumber={item.trackingNumber}
              />
            )}
          </div>
        )}

        {item.fulfillmentStatus === "RETURNED" && (
          <div className="mt-4">
            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              Devuelto
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
