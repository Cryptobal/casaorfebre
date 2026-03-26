import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBuyerOrders } from "@/lib/queries/buyer-orders";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";

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

export default async function BuyerOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await getBuyerOrders(session.user.id);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-semibold text-text">
        Mis Pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-text-secondary">
            No tienes pedidos aun. Explora la coleccion para encontrar piezas
            unicas.
          </p>
          <Link
            href="/coleccion"
            className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-dark"
          >
            Explorar coleccion
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/portal/comprador/pedidos/${order.id}`}
            >
              <Card className="flex items-center justify-between transition-colors hover:bg-background">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text">
                    Pedido #{order.orderNumber}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {order.createdAt.toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "pieza" : "piezas"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                  <p className="text-sm font-semibold text-text">
                    {formatCLP(order.total)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
