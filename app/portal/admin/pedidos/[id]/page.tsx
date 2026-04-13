import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TrackingLink } from "@/components/tracking-link";
import { AdminStatusChanger, ReleasePayoutButton } from "./admin-order-actions";
import type { OrderStatus, FulfillmentStatus, PayoutStatus } from "@prisma/client";

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pago Pendiente",
  PAID: "Pagado",
  PARTIALLY_SHIPPED: "Parcialmente Enviado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-gray-100 text-gray-800",
  PAID: "bg-blue-100 text-blue-800",
  PARTIALLY_SHIPPED: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-red-100 text-red-800",
};

const payoutColors: Record<PayoutStatus, string> = {
  HELD: "bg-amber-100 text-amber-800",
  PENDING: "bg-blue-100 text-blue-800",
  RELEASED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-red-100 text-red-800",
  DISPUTED: "bg-red-100 text-red-800",
};

const payoutLabels: Record<PayoutStatus, string> = {
  HELD: "Retenido",
  PENDING: "Disponible",
  RELEASED: "Liberado",
  PAID: "Pagado",
  REFUNDED: "Reembolsado",
  DISPUTED: "Disputado",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true } },
          artisan: {
            select: {
              id: true,
              displayName: true,
              commissionRate: true,
              commissionOverride: true,
            },
          },
        },
      },
      disputes: { select: { id: true, status: true, reason: true } },
    },
  });

  if (!order) notFound();

  // Group items by artisan for financial breakdown
  const artisanGroups = new Map<
    string,
    {
      name: string;
      commissionRate: number;
      items: typeof order.items;
      subtotal: number;
      totalCommission: number;
      totalPayout: number;
    }
  >();

  for (const item of order.items) {
    const key = item.artisan.id;
    const group = artisanGroups.get(key) || {
      name: item.artisan.displayName,
      commissionRate: item.commissionRate,
      items: [],
      subtotal: 0,
      totalCommission: 0,
      totalPayout: 0,
    };
    group.items.push(item);
    group.subtotal += item.productPrice * item.quantity;
    group.totalCommission += item.commissionAmount;
    group.totalPayout += item.artisanPayout;
    artisanGroups.set(key, group);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/portal/admin/pedidos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a pedidos
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
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </div>

      {/* Admin controls */}
      <Card className="mt-6">
        <h2 className="text-sm font-medium text-text-secondary">Controles de administrador</h2>
        <div className="mt-3">
          <AdminStatusChanger orderId={order.id} currentStatus={order.status} />
        </div>
      </Card>

      {/* Buyer info */}
      <Card className="mt-6">
        <h2 className="text-sm font-medium text-text-secondary">Comprador</h2>
        <div className="mt-2 text-sm">
          <p className="font-medium text-text">{order.user.name || "Sin nombre"}</p>
          <p className="text-text-secondary">{order.user.email}</p>
        </div>
        <div className="mt-3 border-t border-border pt-3 text-sm">
          <p className="font-medium text-text">{order.shippingName}</p>
          <p className="text-text-secondary">{order.shippingAddress}</p>
          <p className="text-text-secondary">
            {order.shippingCity}, {order.shippingRegion}
          </p>
          {order.shippingPhone && (
            <p className="text-text-secondary">Tel: +56 {order.shippingPhone}</p>
          )}
        </div>
      </Card>

      {/* Disputes */}
      {order.disputes.length > 0 && (
        <Card className="mt-6 border-red-200 bg-red-50/50">
          <h2 className="text-sm font-medium text-red-800">Disputas</h2>
          {order.disputes.map((d) => (
            <div key={d.id} className="mt-2 text-sm">
              <span className="font-medium">{d.reason}</span>
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {d.status}
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* Financial breakdown */}
      <Card className="mt-6">
        <h2 className="text-sm font-medium text-text-secondary">Desglose financiero</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal productos</span>
            <span className="font-medium text-text">{formatCLP(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Envío cobrado al comprador</span>
            <span className="text-text">
              {order.shippingCost > 0 ? formatCLP(order.shippingCost) : "Gratis"}
            </span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">
                Descuento{order.discountCode ? ` (${order.discountCode})` : ""}
              </span>
              <span className="text-green-700">-{formatCLP(order.discountAmount)}</span>
            </div>
          )}
          {order.giftCardDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">
                Gift Card{order.giftCardCode ? ` (${order.giftCardCode})` : ""}
              </span>
              <span className="text-green-700">-{formatCLP(order.giftCardDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-medium text-text">Total cobrado</span>
            <span className="text-lg font-semibold text-text">{formatCLP(order.total)}</span>
          </div>
        </div>
      </Card>

      {/* Per-artisan breakdown */}
      <div className="mt-6 space-y-4">
        <h2 className="font-serif text-lg font-medium text-text">Por orfebre</h2>
        {[...artisanGroups.entries()].map(([artisanId, group]) => {
          const shippingShare =
            order.shippingCost > 0 && order.subtotal > 0
              ? Math.round((group.subtotal / order.subtotal) * order.shippingCost)
              : 0;

          return (
            <Card key={artisanId}>
              <h3 className="text-sm font-semibold text-text">{group.name}</h3>

              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="mt-3 rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-text">{item.product.name}</p>
                      <p className="text-xs text-text-tertiary">
                        {item.quantity}x {formatCLP(item.productPrice)}
                      </p>
                      {item.trackingNumber && (
                        <div className="mt-1">
                          <TrackingLink
                            carrier={item.trackingCarrier}
                            trackingNumber={item.trackingNumber}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          payoutColors[item.payoutStatus as PayoutStatus]
                        }`}
                      >
                        {payoutLabels[item.payoutStatus as PayoutStatus]}
                      </span>
                      {item.payoutStatus === "HELD" && (
                        <ReleasePayoutButton
                          orderItemId={item.id}
                          artisanName={group.name}
                          amount={item.artisanPayout}
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-text-secondary">
                    {item.payoutEligibleAt ? (
                      <p>
                        Liberación:{" "}
                        {item.payoutEligibleAt.toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    ) : item.fulfillmentStatus === "DELIVERED" ? (
                      <p>Pendiente de fecha de liberación</p>
                    ) : (
                      <p>Pendiente de entrega</p>
                    )}
                    {item.payoutAt && (
                      <p>
                        Pagado el:{" "}
                        {item.payoutAt.toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-3 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal piezas</span>
                  <span>{formatCLP(group.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Comisión ({Math.round(group.commissionRate * 100)}%)
                  </span>
                  <span className="text-red-600">-{formatCLP(group.totalCommission)}</span>
                </div>
                {shippingShare > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monto despacho (proporcional)</span>
                    <span>+{formatCLP(shippingShare)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-medium text-text">Payout orfebre</span>
                  <span className="font-semibold text-green-700">
                    {formatCLP(group.totalPayout)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MP info */}
      {order.mpPaymentId && (
        <Card className="mt-6">
          <h2 className="text-sm font-medium text-text-secondary">Mercado Pago</h2>
          <div className="mt-2 text-sm text-text-secondary">
            <p>Payment ID: <span className="font-mono text-text">{order.mpPaymentId}</span></p>
            {order.mpMerchantOrderId && (
              <p>Merchant Order: <span className="font-mono text-text">{order.mpMerchantOrderId}</span></p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
