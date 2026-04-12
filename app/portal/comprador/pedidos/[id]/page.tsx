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
import Image from "next/image";
import { ReviewForm } from "./review-form";
import { ResumePaymentButton } from "./resume-payment-button";
import { ConfirmReceiptButton } from "./confirm-receipt-button";
import { TrackingLink } from "@/components/tracking-link";
import { getOrderMessages } from "@/lib/actions/order-messages";
import { OrderChat } from "@/components/order-chat/order-chat";
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

/* Status timeline — shows where the order is in the lifecycle */
const TIMELINE_STEPS = [
  { key: "PENDING_PAYMENT", label: "Pago", icon: CreditCardIcon },
  { key: "PAID", label: "Confirmado", icon: CheckCircleIcon },
  { key: "PREPARING", label: "Preparando", icon: HammerIcon },
  { key: "SHIPPED", label: "Enviado", icon: TruckIcon },
  { key: "DELIVERED", label: "Entregado", icon: PackageIcon },
] as const;

function computeTimelineStep(orderStatus: OrderStatus, items: { fulfillmentStatus: string }[]): number {
  // Check the most advanced fulfillment status across all items
  const hasDelivered = items.some((i) => i.fulfillmentStatus === "DELIVERED");
  const hasShipped = items.some((i) => i.fulfillmentStatus === "SHIPPED");
  const hasPreparing = items.some((i) => i.fulfillmentStatus === "PREPARING");

  if (orderStatus === "PENDING_PAYMENT") return 0;
  if (hasDelivered || orderStatus === "DELIVERED" || orderStatus === "COMPLETED") return 4;
  if (hasShipped || orderStatus === "SHIPPED" || orderStatus === "PARTIALLY_SHIPPED") return 3;
  if (hasPreparing) return 2;
  // PAID but all items still PENDING
  return 1;
}

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

  // Fetch messages for all order items
  const messagesMap = new Map<string, Awaited<ReturnType<typeof getOrderMessages>>>();
  await Promise.all(
    order.items.map(async (item: any) => {
      const msgs = await getOrderMessages(item.id);
      messagesMap.set(item.id, msgs);
    })
  );

  const hasOpenDispute = order.disputes.some(
    (d: any) => d.status !== "CLOSED"
  );

  const grouped = new Map<string, typeof order.items>();
  for (const item of order.items) {
    const key = item.artisan.displayName;
    const group = grouped.get(key) || [];
    group.push(item);
    grouped.set(key, group);
  }

  const currentStep = computeTimelineStep(order.status, order.items);
  const isCancelled =
    order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back */}
      <Link
        href="/portal/comprador/pedidos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a Mis Pedidos
      </Link>

      {/* Header */}
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

      {/* Timeline (visible except for cancelled/refunded) */}
      {!isCancelled && (
        <div className="mt-6">
          {/* Desktop: horizontal */}
          <div className="hidden items-center justify-between md:flex">
            {TIMELINE_STEPS.map((step, i) => {
              const done = currentStep >= i;
              const active = currentStep === i;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          currentStep >= i ? "bg-accent" : "bg-border"
                        }`}
                      />
                    )}
                    <div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                        done
                          ? "border-accent bg-accent text-white"
                          : active
                            ? "border-accent bg-surface text-accent"
                            : "border-border bg-surface text-text-tertiary"
                      }`}
                    >
                      <Icon />
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          currentStep > i ? "bg-accent" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium ${
                      done ? "text-accent" : "text-text-tertiary"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Mobile: vertical */}
          <div className="space-y-0 md:hidden">
            {TIMELINE_STEPS.map((step, i) => {
              const done = currentStep >= i;
              const active = currentStep === i;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        done
                          ? "border-accent bg-accent text-white"
                          : active
                            ? "border-accent bg-surface text-accent"
                            : "border-border bg-surface text-text-tertiary"
                      }`}
                    >
                      <Icon />
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 ${
                          currentStep > i ? "bg-accent" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <span
                      className={`text-sm font-medium ${
                        done ? "text-accent" : "text-text-tertiary"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending payment CTA */}
      {order.status === "PENDING_PAYMENT" && (
        <Card className="mt-6 border-amber-200 bg-amber-50/80">
          <div className="flex items-start gap-3">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 flex-shrink-0 text-amber-600"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-text">
                Este pedido aún no ha sido pagado
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Completa el pago con Mercado Pago para que el orfebre comience a
                preparar tu pieza.
              </p>
              <div className="mt-4">
                <ResumePaymentButton orderId={order.id} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Shipping address */}
      {order.shippingAddress && (
        <Card className="mt-6">
          <div className="flex items-start gap-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 flex-shrink-0 text-text-tertiary"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div>
              <p className="text-sm font-medium text-text">
                Dirección de envío
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {order.shippingName}
              </p>
              <p className="text-sm text-text-secondary">
                {order.shippingAddress}
              </p>
              <p className="text-sm text-text-secondary">
                {[order.shippingCity, order.shippingRegion]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {order.shippingPostalCode && (
                <p className="text-sm text-text-secondary">
                  CP {order.shippingPostalCode}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Gift info */}
      {order.isGift && (
        <Card className="mt-6 border-amber-200 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="Regalo">🎁</span>
            <p className="text-sm font-semibold text-amber-900">
              Este pedido es un regalo
            </p>
          </div>
          {order.giftMessage && (
            <p className="mt-2 text-sm italic text-text-secondary">
              Tu mensaje: &ldquo;{order.giftMessage}&rdquo;
            </p>
          )}
          {order.giftWrapping && (
            <p className="mt-1 text-xs text-amber-700">
              Empaque de regalo incluido
            </p>
          )}
        </Card>
      )}

      {/* Items grouped by artisan */}
      <div className="mt-8 space-y-6">
        {[...grouped.entries()].map(([artisanName, items]) => (
          <Card key={artisanName} className="space-y-4">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-tertiary"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-sm font-medium text-text-secondary">
                Orfebre: {artisanName}
              </p>
            </div>
            <div className="divide-y divide-border">
              {items.map((item: any) => {
                const daysSinceDelivery = item.deliveredAt
                  ? (Date.now() - item.deliveredAt.getTime()) /
                    (1000 * 60 * 60 * 24)
                  : 0;
                const hasReview = reviewedProductIds.has(item.productId);
                const hasReturn = returnRequests.has(item.id);
                const img = item.product.images?.[0];

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      {img ? (
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-background">
                          <Image
                            src={img.url}
                            alt={img.altText || item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background text-text-tertiary">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
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
                          <div className="flex flex-col items-end gap-1.5">
                            <p className="text-sm font-semibold text-text tabular-nums">
                              {formatCLP(item.productPrice * item.quantity)}
                            </p>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${fulfillmentColors[item.fulfillmentStatus as FulfillmentStatus]}`}
                            >
                              {
                                fulfillmentLabels[
                                  item.fulfillmentStatus as FulfillmentStatus
                                ]
                              }
                            </span>
                          </div>
                        </div>

                        {/* Tracking */}
                        {item.fulfillmentStatus === "SHIPPED" &&
                          item.trackingNumber && (
                            <div className="mt-2">
                              <TrackingLink
                                carrier={item.trackingCarrier}
                                trackingNumber={item.trackingNumber}
                              />
                            </div>
                          )}

                        {/* Confirm receipt button */}
                        {item.fulfillmentStatus === "SHIPPED" &&
                          !item.receivedAt && (
                            <div className="mt-3">
                              <ConfirmReceiptButton orderItemId={item.id} />
                              <p className="mt-1 text-[11px] text-text-tertiary">
                                Al confirmar, inicias el proceso de liberación del pago al orfebre
                              </p>
                            </div>
                          )}

                        {/* Receipt confirmed info */}
                        {item.receivedAt && item.fulfillmentStatus !== "DELIVERED" && (
                          <p className="mt-2 text-xs text-green-700">
                            Recibido el{" "}
                            {item.receivedAt.toLocaleDateString("es-CL", {
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                        )}

                        {/* Delivery date + payout info */}
                        {item.fulfillmentStatus === "DELIVERED" && (
                          <div className="mt-2 space-y-1">
                            {item.receivedAt && (
                              <p className="text-xs text-green-700">
                                Recibido el{" "}
                                {item.receivedAt.toLocaleDateString("es-CL", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                            {!item.receivedAt && item.deliveredAt && (
                              <p className="text-xs text-text-secondary">
                                Entregado el{" "}
                                {item.deliveredAt.toLocaleDateString("es-CL", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                            {item.trackingNumber && (
                              <TrackingLink
                                carrier={item.trackingCarrier}
                                trackingNumber={item.trackingNumber}
                              />
                            )}
                          </div>
                        )}

                        {/* Actions for delivered */}
                        {item.fulfillmentStatus === "DELIVERED" && (
                          <div className="mt-3 space-y-3">
                            <div className="flex flex-wrap items-start gap-2">
                            {daysSinceDelivery >= 3 && !hasReview && (
                              <ReviewForm
                                productId={item.productId}
                                artisanId={item.artisanId}
                                orderId={order.id}
                              />
                            )}

                            {daysSinceDelivery <= 14 &&
                              item.product.productionType !== "MADE_TO_ORDER" &&
                              !hasReturn && (
                                <Link
                                  href={`/portal/comprador/pedidos/${order.id}/devolucion?item=${item.id}`}
                                  className="min-h-[44px] rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background hover:text-text"
                                >
                                  Devolver este producto
                                  <span className="text-[11px] text-text-tertiary block mt-0.5">Reembolso tras devolución física</span>
                                </Link>
                              )}
                            {item.product.productionType === "MADE_TO_ORDER" && (
                              <span className="text-[11px] text-text-tertiary">
                                Hecha por encargo · Sin devolución
                              </span>
                            )}

                            {daysSinceDelivery <= 14 && !hasOpenDispute && (
                              <Link
                                href={`/portal/comprador/pedidos/${order.id}/disputa`}
                                className="min-h-[44px] rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background hover:text-text"
                              >
                                Reportar un problema
                                <span className="text-[11px] text-text-tertiary block mt-0.5">Mediación por parte de Casa Orfebre</span>
                              </Link>
                            )}

                            {daysSinceDelivery <= 14 && (
                              <span className={`self-center text-[11px] ${14 - Math.floor(daysSinceDelivery) <= 3 ? 'text-amber-600' : 'text-text-tertiary'}`}>
                                Te quedan {14 - Math.floor(daysSinceDelivery)} días
                              </span>
                            )}

                            {certByProduct.has(item.productId) ? (
                              <a
                                href={`/api/certificates/${certByProduct.get(item.productId)!.code}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                </svg>
                                Certificado
                              </a>
                            ) : (
                              <span className="text-[11px] text-text-tertiary">
                                Certificado en proceso
                              </span>
                            )}
                            </div>

                            {daysSinceDelivery <= 14 && (
                              <details className="mt-3 rounded-lg border border-border bg-background">
                                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-text-secondary hover:text-text">
                                  ¿Necesitas ayuda con este pedido?
                                </summary>
                                <div className="space-y-3 px-4 pb-4 pt-1">
                                  <div>
                                    <p className="text-sm font-medium text-text">Devolver este producto</p>
                                    <p className="text-xs text-text-secondary">
                                      Quiero devolver la pieza y recibir un reembolso. El producto debe estar sin uso y en su empaque original.
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-text">Reportar un problema</p>
                                    <p className="text-xs text-text-secondary">
                                      Tengo un problema con mi pedido que necesita mediación (no coincide con la descripción, llegó dañado, producto equivocado).
                                    </p>
                                  </div>
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Order Chat per item */}
                    <div className="mt-4">
                      <OrderChat
                        orderItemId={item.id}
                        currentUserId={session.user!.id}
                        currentUserRole="BUYER"
                        messages={messagesMap.get(item.id) || []}
                        artisanName={item.product?.artisan?.displayName || item.productName}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Order total */}
      <div className="mt-6 rounded-lg border border-border bg-surface px-6 py-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text tabular-nums">{formatCLP(order.subtotal)}</span>
          </div>
          {order.shippingCost > 0 ? (
            <div className="flex justify-between">
              <span className="text-text-secondary">Envío</span>
              <span className="text-text tabular-nums">{formatCLP(order.shippingCost)}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-text-secondary">Envío</span>
              <span className="font-medium text-green-700">Gratis</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Descuento</span>
              <span className="text-green-700 tabular-nums">-{formatCLP(order.discountAmount)}</span>
            </div>
          )}
          {order.giftCardDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Gift Card</span>
              <span className="text-green-700 tabular-nums">-{formatCLP(order.giftCardDiscount)}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-medium text-text">Total del pedido</span>
          <span className="text-xl font-semibold text-text tabular-nums">
            {formatCLP(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* --- Inline icon components for the timeline --- */
function CreditCardIcon() {
  return (
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function HammerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" />
      <path d="m18 15 4-4" />
      <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function TruckIcon() {
  return (
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function PackageIcon() {
  return (
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
