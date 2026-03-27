import Link from "next/link";
import { getAllOrders } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";

const ORDER_STATUSES = [
  { value: "", label: "Todos" },
  { value: "PENDING_PAYMENT", label: "Pago Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "PARTIALLY_SHIPPED", label: "Parcialmente Enviado" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "COMPLETED", label: "Completado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
];

const statusStyles: Record<string, string> = {
  PENDING_PAYMENT: "bg-gray-100 text-gray-800",
  PAID: "bg-blue-100 text-blue-800",
  PARTIALLY_SHIPPED: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-red-100 text-red-800",
};

const fulfillmentStyles: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-800",
  PREPARING: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  RETURNED: "bg-red-100 text-red-800",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await getAllOrders(status || undefined);

  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Todos los Pedidos</h1>

      {/* Status filter links */}
      <div className="mt-6 flex flex-wrap gap-2">
        {ORDER_STATUSES.map((s) => {
          const isActive = (status ?? "") === s.value;
          return (
            <Link
              key={s.value}
              href={
                s.value
                  ? `/portal/admin/pedidos?status=${s.value}`
                  : "/portal/admin/pedidos"
              }
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-background text-text-secondary hover:bg-border"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay pedidos
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-widest text-text-tertiary">
                <th className="pb-3 pr-4 font-medium">Pedido</th>
                <th className="pb-3 pr-4 font-medium">Fecha</th>
                <th className="pb-3 pr-4 font-medium">Comprador</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 font-medium">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order: any) => {
                const hasLateItems = order.items.some(
                  (item: any) =>
                    ["PENDING", "PREPARING"].includes(
                      item.fulfillmentStatus
                    ) && new Date(item.createdAt) < fiveDaysAgo
                );

                return (
                  <tr
                    key={order.id}
                    className={hasLateItems ? "bg-red-50" : ""}
                  >
                    <td className="py-3 pr-4">
                      <details>
                        <summary className="cursor-pointer font-medium">
                          {order.orderNumber}
                          {hasLateItems && (
                            <span className="ml-2 text-xs text-red-600">
                              Atrasado
                            </span>
                          )}
                        </summary>
                        <div className="mt-2 space-y-2 pl-2">
                          {order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="rounded border border-border p-2 text-xs"
                            >
                              <p className="font-medium">
                                {item.product.name}
                              </p>
                              <p className="text-text-secondary">
                                Orfebre: {item.artisan.displayName}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                    fulfillmentStyles[
                                      item.fulfillmentStatus
                                    ] ?? "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {item.fulfillmentStatus}
                                </span>
                                {item.trackingNumber && (
                                  <span className="text-text-tertiary">
                                    Tracking: {item.trackingNumber}
                                    {item.trackingCarrier
                                      ? ` (${item.trackingCarrier})`
                                      : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {order.user.name ?? order.user.email}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {formatCLP(order.total)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusStyles[order.status] ??
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ORDER_STATUSES.find((s) => s.value === order.status)
                          ?.label ?? order.status}
                      </span>
                    </td>
                    <td className="py-3">{order.items.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
