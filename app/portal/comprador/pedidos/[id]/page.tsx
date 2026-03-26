import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import {
  getBuyerOrderDetail,
  getUserReviewsForOrder,
  getReturnRequestsForItems,
} from "@/lib/queries/buyer-orders";
import { formatCLP } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ReviewForm } from "./review-form";
import { ResumePaymentButton } from "./resume-payment-button";
import type { OrderStatus, FulfillmentStatus } from "@prisma/client";

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pendiente de Pago",
  PAID: "Pagado",
  PARTIALLY_SHIPPED: "Parcialmente Enviado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  PARTIALLY_SHIPPED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  PENDING: "Pendiente",
  PREPARING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  RETURNED: "Devuelto",
};

const fulfillmentColors: Record<FulfillmentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-800",
  PREPARING: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  RETURNED: "bg-red-100 text-red-800",
};

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const order = await getBuyerOrderDetail(orderId, session.user.id);
  if (!order) notFound();

  const productIds = order.items.map((item: any) => item.productId);
  const orderItemIds = order.items.map((item: any) => item.id);

  const [reviewedProductIds, returnRequests] = await Promise.all([
    getUserReviewsForOrder(session.user.id, productIds),
    getReturnRequestsForItems(orderItemIds),
  ]);

  // Fetch certificates for delivered items
  const deliveredProductIds = order.items
    .filter((item: any) => item.fulfillmentStatus === "DELIVERED")
    .map((item: any) => item.productId);

  const certificates =
    deliveredProductIds.length > 0
      ? await prisma.certificate.findMany({
          where: { productId: { in: deliveredProductIds } },
        })
      : [];
  const certByProduct = new Map(
    certificates.map((c: any) => [c.productId, c])
  );

  const hasOpenDispute = order.disputes.some((d: any) => d.status !== "CLOSED");

  // Group items by artisan
  const grouped = new Map<string, typeof order.items>();
  for (const item of order.items) {
    const key = item.artisan.displayName;
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/portal/comprador/pedidos"
        className="mb-4 inline-block text-sm text-text-secondary hover:text-text"
      >
        &larr; Volver a Mis Pedidos
      </Link>

      {/* Order header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-text">
            Pedido #{order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            {order.createdAt.toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      {order.status === "PENDING_PAYMENT" && (
        <Card className="mt-6 border-amber-200 bg-amber-50/80">
          <p className="text-sm font-medium text-text">
            Este pedido aún no está pagado
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Puedes completar el pago con Mercado Pago aquí. El monto y los
            productos son los de este pedido (no hace falta volver al carrito).
          </p>
          <div className="mt-4">
            <ResumePaymentButton orderId={order.id} />
          </div>
        </Card>
      )}

      {/* Shipping address */}
      {order.shippingAddress && (
        <Card className="mt-6">
          <p className="mb-2 text-sm font-medium text-text">
            Direccion de envio
          </p>
          <p className="text-sm text-text-secondary whitespace-pre-line">
            {typeof order.shippingAddress === "object"
              ? Object.values(order.shippingAddress as Record<string, string>).join("\n")
              : String(order.shippingAddress)}
          </p>
        </Card>
      )}

      {/* Items grouped by artisan */}
      <div className="mt-8 space-y-6">
        {[...grouped.entries()].map(([artisanName, items]) => (
          <Card key={artisanName} className="space-y-4">
            <p className="text-sm font-medium text-text-secondary">
              Orfebre: {artisanName}
            </p>
            <div className="divide-y divide-border">
              {items.map((item: any) => {
                const daysSinceDelivery = item.deliveredAt
                  ? (Date.now() - item.deliveredAt.getTime()) /
                    (1000 * 60 * 60 * 24)
                  : 0;
                const hasReview = reviewedProductIds.has(item.productId);
                const hasReturn = returnRequests.has(item.id);

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <Link
                          href={`/coleccion/${item.product.slug}`}
                          className="text-sm font-medium text-text hover:text-accent"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-text-tertiary">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm font-semibold text-text">
                          {formatCLP(item.productPrice)}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${fulfillmentColors[item.fulfillmentStatus as FulfillmentStatus]}`}
                        >
                          {fulfillmentLabels[item.fulfillmentStatus as FulfillmentStatus]}
                        </span>
                      </div>
                    </div>

                    {/* Tracking info */}
                    {item.fulfillmentStatus === "SHIPPED" &&
                      item.trackingNumber && (
                        <p className="mt-2 text-xs text-text-secondary">
                          Tracking: {item.trackingNumber}
                          {item.trackingCarrier && ` (${item.trackingCarrier})`}
                        </p>
                      )}

                    {/* Delivery date */}
                    {item.fulfillmentStatus === "DELIVERED" &&
                      item.deliveredAt && (
                        <p className="mt-2 text-xs text-text-secondary">
                          Entregado el{" "}
                          {item.deliveredAt.toLocaleDateString("es-CL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}

                    {/* Conditional action buttons for delivered items */}
                    {item.fulfillmentStatus === "DELIVERED" && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {/* Review: 3+ days after delivery, no existing review */}
                        {daysSinceDelivery >= 3 && !hasReview && (
                          <ReviewForm
                            productId={item.productId}
                            artisanId={item.artisanId}
                            orderId={order.id}
                          />
                        )}

                        {/* Return: within 14 days, NOT customMade */}
                        {daysSinceDelivery <= 14 &&
                          !item.product.isCustomMade &&
                          !hasReturn && (
                            <Link
                              href={`/portal/comprador/pedidos/${order.id}/devolucion?item=${item.id}`}
                              className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
                            >
                              Solicitar Devolucion
                            </Link>
                          )}
                        {item.product.isCustomMade && (
                          <span className="text-xs text-text-tertiary">
                            Pieza personalizada &middot; Sin devolucion
                          </span>
                        )}

                        {/* Dispute: within 14 days, no open dispute */}
                        {daysSinceDelivery <= 14 && !hasOpenDispute && (
                          <Link
                            href={`/portal/comprador/pedidos/${order.id}/disputa`}
                            className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
                          >
                            Abrir Disputa
                          </Link>
                        )}

                        {/* Certificate download or pending */}
                        {certByProduct.has(item.productId) ? (
                          <a
                            href={`/api/certificates/${certByProduct.get(item.productId)!.code}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent hover:underline"
                          >
                            Descargar Certificado
                          </a>
                        ) : (
                          <span className="text-xs text-text-tertiary">
                            Certificado en proceso
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Order total */}
      <div className="mt-6 flex justify-end">
        <p className="text-lg font-semibold text-text">
          Total: {formatCLP(order.total)}
        </p>
      </div>
    </div>
  );
}
