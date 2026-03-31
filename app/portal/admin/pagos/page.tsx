import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPendingPayouts, getPaidPayoutsHistory } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { MarkPaidButton } from "./mark-paid-button";

export default async function AdminPagosPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [pendingGroups, paidHistory] = await Promise.all([
    getPendingPayouts(),
    getPaidPayoutsHistory(),
  ]);

  const hasMissingBanking = pendingGroups.some(
    (g: any) => !g.artisan.bankAccountNumber
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-light">Pagos a Orfebres</h1>
        <div>
          <a
            href="/api/admin/generate-payroll"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Descargar nomina Santander
          </a>
          <p className="text-xs text-text-tertiary mt-1">
            Descarga el CSV, subelo a Office Banking de Santander, y una vez
            procesadas las transferencias, marca los pagos como completados aqui.
          </p>
        </div>
      </div>

      {hasMissingBanking && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Algunos orfebres con pagos pendientes no tienen datos bancarios completos.
          No se podra generar su linea en la nomina.
        </div>
      )}

      {/* Pending payouts */}
      <h2 className="mt-8 text-xs font-medium uppercase tracking-widest text-text-tertiary">
        Pagos pendientes de transferencia
      </h2>

      {pendingGroups.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-text-secondary">No hay pagos pendientes</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {pendingGroups.map((group: any) => (
            <div
              key={group.artisan.id}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-text">
                    {group.artisan.displayName}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {group.items.length} item{group.items.length > 1 ? "s" : ""}{" "}
                    &middot; Total:{" "}
                    <span className="font-medium text-text">
                      {formatCLP(group.totalAmount)}
                    </span>
                  </p>
                  {!group.artisan.bankAccountNumber && (
                    <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      Sin datos bancarios
                    </span>
                  )}
                </div>
                <MarkPaidButton
                  artisanId={group.artisan.id}
                  artisanName={group.artisan.displayName}
                />
              </div>
              <div className="mt-3 space-y-1">
                {group.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs text-text-secondary"
                  >
                    <span>
                      {item.product.name} &middot; Orden {item.order.orderNumber}
                    </span>
                    <span className="tabular-nums">
                      {formatCLP(item.artisanPayout)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paid history */}
      <h2 className="mt-12 text-xs font-medium uppercase tracking-widest text-text-tertiary">
        Historial de pagos
      </h2>

      {paidHistory.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-text-secondary">Sin pagos completados aun</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Fecha
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Orfebre
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Producto
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Orden
                </th>
                <th className="px-4 py-3 font-medium text-text-secondary">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paidHistory.map((item: any) => (
                <tr key={item.id} className="hover:bg-background/50">
                  <td className="px-4 py-3 text-text-secondary">
                    {item.payoutAt
                      ? new Date(item.payoutAt).toLocaleDateString("es-CL")
                      : "N/D"}
                  </td>
                  <td className="px-4 py-3 text-text">
                    {item.artisan.displayName}
                  </td>
                  <td className="px-4 py-3 text-text">
                    {item.product.name}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {item.order.orderNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-700 tabular-nums">
                    {formatCLP(item.artisanPayout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
