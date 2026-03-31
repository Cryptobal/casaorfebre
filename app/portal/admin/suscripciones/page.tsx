import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatCLP } from "@/lib/utils";

function timeUntil(date: Date | null) {
  if (!date) return "—";
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Vencida";
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days <= 7) return `${days} días`;
  return new Date(date).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Activa", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelada", className: "bg-gray-100 text-gray-600" },
  EXPIRED: { label: "Expirada", className: "bg-red-100 text-red-700" },
  GRACE_PERIOD: { label: "Periodo de gracia", className: "bg-amber-100 text-amber-700" },
};

const SOURCE_LABELS: Record<string, string> = {
  PAYMENT: "Pago",
  PROMO_CODE: "Código promo",
  ADMIN: "Admin",
  FREE_TRIAL: "Prueba gratis",
};

interface PageProps {
  searchParams: Promise<{ status?: string; plan?: string }>;
}

export default async function SuscripcionesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statusFilter = sp.status || "";
  const planFilter = sp.plan || "";

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Stats — only count revenue from non-pioneer, approved artisans
  const [activeSubs, allSubs, plans] = await Promise.all([
    prisma.membershipSubscription.findMany({
      where: { status: "ACTIVE", artisan: { status: "APPROVED", isPioneer: false } },
      include: { plan: { select: { price: true, name: true } } },
    }),
    prisma.membershipSubscription.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter as "ACTIVE" | "CANCELLED" | "EXPIRED" | "GRACE_PERIOD" } : {}),
        ...(planFilter ? { plan: { name: planFilter } } : {}),
      },
      orderBy: { startDate: "desc" },
      include: {
        artisan: { select: { id: true, displayName: true, slug: true, profileImage: true, status: true } },
        plan: { select: { name: true, price: true, badgeText: true } },
      },
    }),
    prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
  ]);

  const totalRevenue = activeSubs.reduce((sum, s) => sum + s.plan.price, 0);
  const activeCount = activeSubs.length;
  const expiringSoonCount = activeSubs.filter(
    (s) => s.endDate && s.endDate <= sevenDaysFromNow && s.endDate >= now
  ).length;

  // Revenue by plan
  const revenueByPlan = plans.map((plan) => {
    const planSubs = activeSubs.filter((s) => s.plan.name === plan.name);
    return {
      name: plan.name,
      count: planSubs.length,
      revenue: planSubs.reduce((sum, s) => sum + s.plan.price, 0),
    };
  }).filter((p) => p.count > 0);

  return (
    <div>
      <h1 className="font-serif text-2xl font-light sm:text-3xl">Suscripciones</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Revenue mensual</p>
          <p className="mt-1 text-2xl font-medium">{formatCLP(totalRevenue)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Suscripciones activas</p>
          <p className="mt-1 text-2xl font-medium">{activeCount}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Por vencer (7 días)</p>
          <p className={`mt-1 text-2xl font-medium ${expiringSoonCount > 0 ? "text-amber-600" : ""}`}>
            {expiringSoonCount}
          </p>
        </Card>
      </div>

      {/* Revenue by plan breakdown */}
      {revenueByPlan.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Desglose por plan
          </h2>
          <div className="mt-2 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-widest text-text-tertiary">
                  <th className="px-4 py-2">Plan</th>
                  <th className="px-4 py-2">Orfebres</th>
                  <th className="px-4 py-2 text-right">Revenue/mes</th>
                </tr>
              </thead>
              <tbody>
                {revenueByPlan.map((p) => (
                  <tr key={p.name} className="border-b border-border/50">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2">{p.count}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCLP(p.revenue)}</td>
                  </tr>
                ))}
                <tr className="bg-background/50">
                  <td className="px-4 py-2 font-medium">Total</td>
                  <td className="px-4 py-2">{activeCount}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCLP(totalRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <form className="mt-6 flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activas</option>
          <option value="GRACE_PERIOD">Periodo de gracia</option>
          <option value="CANCELLED">Canceladas</option>
          <option value="EXPIRED">Expiradas</option>
        </select>
        <select
          name="plan"
          defaultValue={planFilter}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="">Todos los planes</option>
          {plans.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark min-h-[44px]"
        >
          Filtrar
        </button>
        {(statusFilter || planFilter) && (
          <Link href="/portal/admin/suscripciones" className="text-sm text-text-secondary hover:text-accent">
            Limpiar
          </Link>
        )}
      </form>

      {/* Subscriptions table */}
      <div className="mt-6">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-text-tertiary">
                <th className="pb-2 pr-4">Orfebre</th>
                <th className="pb-2 pr-4">Plan</th>
                <th className="pb-2 pr-4">Precio</th>
                <th className="pb-2 pr-4">Origen</th>
                <th className="pb-2 pr-4">Inicio</th>
                <th className="pb-2 pr-4">Vence</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {allSubs.map((sub) => {
                const isExpiringSoon = sub.status === "ACTIVE" && sub.endDate && sub.endDate <= sevenDaysFromNow && sub.endDate >= now;
                return (
                  <tr key={sub.id} className={`border-b border-border/50 ${isExpiringSoon ? "bg-amber-50/50" : ""}`}>
                    <td className="py-3 pr-4">
                      <Link href={`/portal/admin/orfebres`} className="text-accent hover:underline">
                        {sub.artisan.displayName}
                      </Link>
                      {sub.artisan.status !== "APPROVED" && (
                        <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                          {sub.artisan.status === "SUSPENDED" ? "Suspendido" : sub.artisan.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        {sub.plan.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium">{formatCLP(sub.plan.price)}</td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {SOURCE_LABELS[sub.source] || sub.source}
                    </td>
                    <td className="py-3 pr-4 text-text-tertiary">
                      {new Date(sub.startDate).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className={`py-3 pr-4 ${isExpiringSoon ? "font-medium text-amber-600" : "text-text-tertiary"}`}>
                      {sub.endDate
                        ? `${new Date(sub.endDate).toLocaleDateString("es-CL", { day: "numeric", month: "short" })} (${timeUntil(sub.endDate)})`
                        : "Sin vencimiento"}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_LABELS[sub.status]?.className ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[sub.status]?.label ?? sub.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 sm:hidden">
          {allSubs.map((sub) => {
            const isExpiringSoon = sub.status === "ACTIVE" && sub.endDate && sub.endDate <= sevenDaysFromNow && sub.endDate >= now;
            return (
              <div
                key={sub.id}
                className={`rounded-lg border border-border p-4 ${isExpiringSoon ? "border-amber-200 bg-amber-50/50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {sub.artisan.displayName}
                      {sub.artisan.status !== "APPROVED" && (
                        <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                          {sub.artisan.status === "SUSPENDED" ? "Suspendido" : sub.artisan.status}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        {sub.plan.name}
                      </span>
                      <span className="ml-2">{formatCLP(sub.plan.price)}/mes</span>
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_LABELS[sub.status]?.className ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[sub.status]?.label ?? sub.status}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-text-tertiary">
                  <span>Inicio: {new Date(sub.startDate).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}</span>
                  <span className={isExpiringSoon ? "font-medium text-amber-600" : ""}>
                    Vence: {sub.endDate ? timeUntil(sub.endDate) : "—"}
                  </span>
                  <span>{SOURCE_LABELS[sub.source] || sub.source}</span>
                </div>
              </div>
            );
          })}
        </div>

        {allSubs.length === 0 && (
          <p className="py-8 text-center text-sm text-text-tertiary">No hay suscripciones.</p>
        )}
      </div>
    </div>
  );
}
