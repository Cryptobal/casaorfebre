import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";

export default async function FinanzasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const orderItems = await prisma.orderItem.findMany({
    where: { artisanId: artisan.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
    },
  });

  const totalSales = orderItems.reduce((sum: number, item: any) => sum + item.productPrice * item.quantity, 0);
  const totalCommissions = orderItems.reduce((sum: number, item: any) => sum + item.commissionAmount, 0);
  const totalPayout = orderItems.reduce((sum: number, item: any) => sum + item.artisanPayout, 0);

  const heldAmount = orderItems
    .filter((i: any) => i.payoutStatus === "HELD")
    .reduce((sum: number, i: any) => sum + i.artisanPayout, 0);
  const availableAmount = orderItems
    .filter((i: any) => i.payoutStatus === "RELEASED" || i.payoutStatus === "PENDING")
    .reduce((sum: number, i: any) => sum + i.artisanPayout, 0);
  const paidAmount = orderItems
    .filter((i: any) => i.payoutStatus === "PAID")
    .reduce((sum: number, i: any) => sum + i.artisanPayout, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-text">Finanzas</h1>

      {/* Summary cards — row 1 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Total ventas</p>
          <p className="mt-1 text-xl font-medium text-text">{formatCLP(totalSales)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Comisión total</p>
          <p className="mt-1 text-xl font-medium text-text">{formatCLP(totalCommissions)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Pago neto</p>
          <p className="mt-1 text-xl font-medium text-green-700">{formatCLP(totalPayout)}</p>
        </div>
      </div>

      {/* Summary cards — row 2 */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Retenido</p>
          <p className="mt-1 text-xl font-medium text-amber-700">{formatCLP(heldAmount)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Disponible</p>
          <p className="mt-1 text-xl font-medium text-blue-700">{formatCLP(availableAmount)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Pagado</p>
          <p className="mt-1 text-xl font-medium text-green-700">{formatCLP(paidAmount)}</p>
        </div>
      </div>

      <p className="text-xs text-text-tertiary mt-2">
        Los fondos de cada venta se retienen por 14 días desde la entrega como protección al comprador.
        Pasado este plazo, se liberan y quedan disponibles para transferencia.
      </p>

      {/* Commission note */}
      <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm space-y-2">
        <p className="font-medium text-text">
          Tu comisión es del {Math.round(artisan.commissionRate * 100)}%
        </p>
        <p className="text-text-secondary font-light">
          Este porcentaje cubre todos los costos de la plataforma: procesamiento de pagos (Mercado Pago),
          infraestructura tecnológica, marketing y posicionamiento, y soporte al cliente.
        </p>
        <p className="text-text-secondary font-light">
          No se te cobra ningún cargo adicional. El monto en{" "}
          <strong className="font-medium text-text">&quot;Pago neto&quot;</strong> es exactamente lo que recibirás en tu cuenta.
        </p>
      </div>

      {orderItems.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-text-secondary">Aun no tienes ventas registradas</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Fecha</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Producto</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Precio venta</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Comisión (%)</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Comisión</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Pago neto</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orderItems.map((item: any) => {
                  const statusBadge: Record<string, { label: string; className: string }> = {
                    HELD: { label: "Retenido", className: "bg-amber-100 text-amber-800" },
                    RELEASED: { label: "Liberado", className: "bg-blue-100 text-blue-800" },
                    PENDING: { label: "Disponible", className: "bg-blue-100 text-blue-800" },
                    PAID: { label: "Pagado", className: "bg-green-100 text-green-800" },
                    REFUNDED: { label: "Reembolsado", className: "bg-red-100 text-red-800" },
                  };
                  const badge = statusBadge[item.payoutStatus] || { label: item.payoutStatus, className: "bg-gray-100 text-gray-800" };
                  return (
                    <tr key={item.id} className="hover:bg-background/50">
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(item.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-4 py-3 text-text">{item.product.name}</td>
                      <td className="px-4 py-3 text-text">
                        {formatCLP(item.productPrice * item.quantity)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {Math.round(item.commissionRate * 100)}%
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {formatCLP(item.commissionAmount)}
                      </td>
                      <td className="px-4 py-3 font-medium text-green-700">
                        {formatCLP(item.artisanPayout)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {orderItems.map((item: any) => (
              <div key={item.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text">{item.product.name}</p>
                    <p className="mt-0.5 text-xs text-text-tertiary">
                      {new Date(item.createdAt).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium text-green-700">{formatCLP(item.artisanPayout)}</p>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                  <span>Venta: {formatCLP(item.productPrice * item.quantity)}</span>
                  <span>Comisión: {Math.round(item.commissionRate * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
