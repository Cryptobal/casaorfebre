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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-text">Finanzas</h1>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-text-secondary">Total ventas</p>
          <p className="mt-1 text-2xl font-semibold text-text">{formatCLP(totalSales)}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Total comisiones</p>
          <p className="mt-1 text-2xl font-semibold text-text">{formatCLP(totalCommissions)}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Pago neto</p>
          <p className="mt-1 text-2xl font-semibold text-green-700">{formatCLP(totalPayout)}</p>
        </Card>
      </div>

      {/* Commission note */}
      <div className="mt-4 rounded-md border border-border bg-background px-4 py-3 text-sm text-text-secondary">
        Tu comision es del {Math.round(artisan.commissionRate * 100)}%. Esto incluye el procesamiento de pagos.
      </div>

      {orderItems.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-text-secondary">Aun no tienes ventas registradas</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Fecha</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Producto</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Precio venta</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Comision (%)</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Comision</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Pago neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orderItems.map((item: any) => (
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
                  </tr>
                ))}
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
