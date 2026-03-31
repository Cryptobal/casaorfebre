import { getAdminFinancials } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";

export default async function FinanzasPage() {
  const { summary, orders } = await getAdminFinancials();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Finanzas</h1>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">GMV Total</p>
          <p className="mt-1 text-xl font-medium text-text">{formatCLP(summary.gmvTotal)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Fee total MP</p>
          <p className="mt-1 text-xl font-medium text-text">{formatCLP(summary.mpFeeTotal)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Comision bruta</p>
          <p className="mt-1 text-xl font-medium text-text">{formatCLP(summary.commissionTotal)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Margen neto</p>
          <p className="mt-1 text-xl font-medium text-green-700">
            {formatCLP(summary.netMargin)}
            <span className="ml-1 text-sm text-text-tertiary">
              ({summary.netMarginPercent.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Total pagado a orfebres</p>
          <p className="mt-1 text-xl font-medium text-text">{formatCLP(summary.artisanPaidTotal)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Pendiente a orfebres</p>
          <p className="mt-1 text-xl font-medium text-amber-700">{formatCLP(summary.artisanPendingTotal)}</p>
        </div>
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Margen neto %</p>
          <p className="mt-1 text-xl font-medium text-text">{summary.netMarginPercent.toFixed(1)}%</p>
        </div>
      </div>

      {/* Orders table */}
      <h2 className="mt-10 text-xs font-medium uppercase tracking-widest text-text-tertiary">
        Ordenes pagadas
      </h2>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-text-secondary">Orden</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Fecha</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Total</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Fee MP</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Neto recibido</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Pago orfebres</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Margen real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order: any) => {
              const artisanPayout = order.items.reduce(
                (s: number, i: any) => s + i.artisanPayout,
                0
              );
              const commission = order.items.reduce(
                (s: number, i: any) => s + i.commissionAmount,
                0
              );
              const mpFee = order.mpFeeAmount ?? null;
              const margin = mpFee !== null ? commission - mpFee : null;

              return (
                <tr key={order.id} className="hover:bg-background/50">
                  <td className="px-4 py-3 text-text">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-text tabular-nums">
                    {formatCLP(order.total)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary tabular-nums">
                    {mpFee !== null ? formatCLP(mpFee) : "N/D"}
                  </td>
                  <td className="px-4 py-3 text-text tabular-nums">
                    {order.mpNetReceived != null
                      ? formatCLP(order.mpNetReceived)
                      : "N/D"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary tabular-nums">
                    {formatCLP(artisanPayout)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {margin !== null ? (
                      <span
                        className={
                          margin >= 0 ? "text-green-700" : "text-red-600"
                        }
                      >
                        {formatCLP(margin)}
                      </span>
                    ) : (
                      "N/D"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
