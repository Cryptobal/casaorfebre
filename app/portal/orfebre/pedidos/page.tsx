import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getArtisanOrders } from "@/lib/queries/orders";
import type { FulfillmentStatus } from "@prisma/client";

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

const FILTER_TABS = [
  { label: "Todos", value: "" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Preparando", value: "PREPARING" },
  { label: "Despachados", value: "SHIPPED" },
  { label: "Entregados", value: "DELIVERED" },
];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const validStatuses: FulfillmentStatus[] = ["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED"];
  const filterStatus = status && validStatuses.includes(status as FulfillmentStatus)
    ? (status as FulfillmentStatus)
    : undefined;

  const orders = await getArtisanOrders(artisan.id, filterStatus);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-text">Pedidos</h1>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = (tab.value === "" && !status) || tab.value === status;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/portal/orfebre/pedidos?status=${tab.value}` : "/portal/orfebre/pedidos"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-background text-text-secondary hover:bg-background/80 hover:text-text"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-text-secondary">No tienes pedidos aun</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">N. Pedido</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Producto</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Fecha</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Estado</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((item: any) => (
                  <tr key={item.id} className="hover:bg-background/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/orfebre/pedidos/${item.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {item.order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text">{item.product.name}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(item.createdAt).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[item.fulfillmentStatus] ?? "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {STATUS_LABELS[item.fulfillmentStatus] ?? item.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.trackingNumber ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {orders.map((item: any) => (
              <Link
                key={item.id}
                href={`/portal/orfebre/pedidos/${item.id}`}
                className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-background/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-accent">{item.order.orderNumber}</p>
                    <p className="mt-0.5 text-sm text-text">{item.product.name}</p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {new Date(item.createdAt).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[item.fulfillmentStatus] ?? "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {STATUS_LABELS[item.fulfillmentStatus] ?? item.fulfillmentStatus}
                  </span>
                </div>
                {item.trackingNumber && (
                  <p className="mt-2 text-xs text-text-tertiary">
                    Tracking: {item.trackingNumber}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
