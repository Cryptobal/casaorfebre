import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ q?: string; verified?: string; withOrders?: string; sort?: string }>;
}

export default async function AdminBuyersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const search = sp.q || "";
  const verifiedFilter = sp.verified || "";
  const withOrdersFilter = sp.withOrders || "";
  const sort = sp.sort || "recent";

  const buyers = await prisma.user.findMany({
    where: {
      role: "BUYER",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(verifiedFilter === "yes" ? { emailVerified: { not: null } } : {}),
      ...(verifiedFilter === "no" ? { emailVerified: null } : {}),
    },
    include: {
      orders: {
        where: { status: { not: "PENDING_PAYMENT" } },
        select: { total: true },
      },
      referralRewardsEarned: {
        select: { referred: { select: { name: true } } },
      },
    },
    orderBy:
      sort === "spent"
        ? { createdAt: "desc" } // We'll sort client-side for computed fields
        : sort === "orders"
          ? { createdAt: "desc" }
          : { createdAt: "desc" },
    take: 200,
  });

  // Compute totals
  let buyerList = buyers.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    emailVerified: !!b.emailVerified,
    createdAt: b.createdAt,
    totalOrders: b.orders.length,
    totalSpent: b.orders.reduce((s, o) => s + o.total, 0),
    referredBy: b.referredBy,
  }));

  // Filter by orders
  if (withOrdersFilter === "yes") {
    buyerList = buyerList.filter((b) => b.totalOrders > 0);
  } else if (withOrdersFilter === "no") {
    buyerList = buyerList.filter((b) => b.totalOrders === 0);
  }

  // Sort
  if (sort === "spent") {
    buyerList.sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sort === "orders") {
    buyerList.sort((a, b) => b.totalOrders - a.totalOrders);
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-light sm:text-3xl">Compradores</h1>
      <p className="mt-1 text-sm text-text-secondary">{buyerList.length} compradores registrados</p>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input
          name="q"
          type="text"
          placeholder="Buscar por nombre o email..."
          defaultValue={search}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px] w-full sm:w-64"
        />
        <select name="verified" defaultValue={verifiedFilter} className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]">
          <option value="">Email: todos</option>
          <option value="yes">Verificado</option>
          <option value="no">No verificado</option>
        </select>
        <select name="withOrders" defaultValue={withOrdersFilter} className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]">
          <option value="">Compras: todas</option>
          <option value="yes">Con compras</option>
          <option value="no">Sin compras</option>
        </select>
        <select name="sort" defaultValue={sort} className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]">
          <option value="recent">Más recientes</option>
          <option value="spent">Mayor gasto</option>
          <option value="orders">Más pedidos</option>
        </select>
        <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark min-h-[44px]">
          Filtrar
        </button>
      </form>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-text-tertiary">
              <th className="pb-2 pr-4">Nombre</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Registro</th>
              <th className="pb-2 pr-4">Pedidos</th>
              <th className="pb-2 pr-4">Total gastado</th>
              <th className="pb-2 pr-4">Verificado</th>
              <th className="pb-2">Referido</th>
            </tr>
          </thead>
          <tbody>
            {buyerList.map((b) => (
              <tr key={b.id} className="border-b border-border/50">
                <td className="py-3 pr-4">
                  <Link href={`/portal/admin/compradores/${b.id}`} className="text-accent hover:underline">
                    {b.name || "Sin nombre"}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-text-secondary">{b.email}</td>
                <td className="py-3 pr-4 text-text-tertiary">
                  {new Date(b.createdAt).toLocaleDateString("es-CL")}
                </td>
                <td className="py-3 pr-4">{b.totalOrders}</td>
                <td className="py-3 pr-4">{formatCLP(b.totalSpent)}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${b.emailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {b.emailVerified ? "Sí" : "No"}
                  </span>
                </td>
                <td className="py-3">{b.referredBy || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-2 sm:hidden">
        {buyerList.map((b) => (
          <Link
            key={b.id}
            href={`/portal/admin/compradores/${b.id}`}
            className="block rounded-lg border border-border p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{b.name || "Sin nombre"}</p>
                <p className="text-sm text-text-secondary">{b.email}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${b.emailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {b.emailVerified ? "Verificado" : "No verificado"}
              </span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-text-tertiary">
              <span>{b.totalOrders} pedidos</span>
              <span>{formatCLP(b.totalSpent)}</span>
              <span>{new Date(b.createdAt).toLocaleDateString("es-CL")}</span>
            </div>
          </Link>
        ))}
      </div>

      {buyerList.length === 0 && (
        <p className="mt-8 text-center text-sm text-text-tertiary">No se encontraron compradores.</p>
      )}
    </div>
  );
}
