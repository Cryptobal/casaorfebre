import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { formatGiftCardCode } from "@/lib/gift-cards";
import { GiftCardActions } from "./gift-card-actions";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Activa", color: "bg-green-100 text-green-800" },
  PARTIALLY_USED: { label: "Parcial", color: "bg-amber-100 text-amber-800" },
  REDEEMED: { label: "Agotada", color: "bg-gray-100 text-gray-600" },
  EXPIRED: { label: "Expirada", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

export default async function AdminGiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const search = params.q || "";

  const where: any = {};
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (search) {
    where.OR = [
      { code: { contains: search.replace(/-/g, "").toUpperCase() } },
      { recipientEmail: { contains: search, mode: "insensitive" } },
      { purchaser: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [giftCards, stats] = await Promise.all([
    prisma.giftCard.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        purchaser: { select: { email: true, name: true } },
        usedInOrders: { select: { amount: true, orderId: true, createdAt: true } },
      },
      take: 100,
    }),
    prisma.giftCard.groupBy({
      by: ["status"],
      _sum: { amount: true, balance: true },
      _count: true,
    }),
  ]);

  const totalSold = stats.reduce((sum, s) => sum + (s._sum.amount || 0), 0);
  const totalCirculating = stats
    .filter((s) => s.status === "ACTIVE" || s.status === "PARTIALLY_USED")
    .reduce((sum, s) => sum + (s._sum.balance || 0), 0);
  const totalRedeemed = stats
    .filter((s) => s.status === "REDEEMED")
    .reduce((sum, s) => sum + (s._sum.amount || 0), 0);
  const totalCount = stats.reduce((sum, s) => sum + s._count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-text">Gift Cards</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Gestión de Gift Cards digitales.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-tertiary">Total vendido</p>
          <p className="mt-1 text-xl font-semibold text-text">{formatCLP(totalSold)}</p>
          <p className="text-xs text-text-tertiary">{totalCount} gift cards</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-tertiary">En circulación</p>
          <p className="mt-1 text-xl font-semibold text-amber-600">{formatCLP(totalCirculating)}</p>
          <p className="text-xs text-text-tertiary">saldo activo</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-tertiary">Redimido</p>
          <p className="mt-1 text-xl font-semibold text-green-700">{formatCLP(totalRedeemed)}</p>
          <p className="text-xs text-text-tertiary">completamente usadas</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-text-tertiary">Tasa de uso</p>
          <p className="mt-1 text-xl font-semibold text-text">
            {totalSold > 0 ? Math.round(((totalSold - totalCirculating) / totalSold) * 100) : 0}%
          </p>
          <p className="text-xs text-text-tertiary">del monto vendido</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-text-tertiary">Estado</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Activa</option>
            <option value="PARTIALLY_USED">Parcialmente usada</option>
            <option value="REDEEMED">Agotada</option>
            <option value="EXPIRED">Expirada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-tertiary">Buscar</label>
          <input
            name="q"
            defaultValue={search}
            placeholder="Código o email..."
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium text-text-tertiary">Código</th>
              <th className="px-4 py-3 font-medium text-text-tertiary">Monto</th>
              <th className="px-4 py-3 font-medium text-text-tertiary">Saldo</th>
              <th className="px-4 py-3 font-medium text-text-tertiary">Comprador</th>
              <th className="px-4 py-3 font-medium text-text-tertiary">Destinatario</th>
              <th className="px-4 py-3 font-medium text-text-tertiary">Estado</th>
              <th className="px-4 py-3 font-medium text-text-tertiary">Fecha</th>
              <th className="px-4 py-3 font-medium text-text-tertiary">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {giftCards.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-tertiary">
                  No hay gift cards{statusFilter || search ? " con esos filtros" : ""}.
                </td>
              </tr>
            ) : (
              giftCards.map((gc) => {
                const status = STATUS_LABELS[gc.status] || { label: gc.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={gc.id} className="hover:bg-background/50">
                    <td className="px-4 py-3 font-mono text-xs tracking-wider">
                      {formatGiftCardCode(gc.code)}
                    </td>
                    <td className="px-4 py-3">{formatCLP(gc.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={gc.balance > 0 ? "font-medium text-green-700" : "text-text-tertiary"}>
                        {formatCLP(gc.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {gc.purchaser?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {gc.recipientEmail}
                      {gc.recipientName && <span className="block text-text-tertiary">{gc.recipientName}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-tertiary">
                      {gc.createdAt.toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-4 py-3">
                      <GiftCardActions
                        giftCardId={gc.id}
                        status={gc.status}
                        usages={gc.usedInOrders.map((u) => ({
                          amount: u.amount,
                          orderId: u.orderId,
                          date: u.createdAt.toLocaleDateString("es-CL"),
                        }))}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
