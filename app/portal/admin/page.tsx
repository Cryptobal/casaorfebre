import Link from "next/link";
import {
  getAdminDashboardStats,
  getSalesLast6Months,
  getArtisansByPlan,
  getTopArtisansMonth,
  getTopProductsMonth,
} from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { SalesChart, PlanDistributionChart } from "@/components/admin/dashboard-charts";

export default async function AdminDashboardPage() {
  const [stats, salesData, planData, topArtisans, topProducts] = await Promise.all([
    getAdminDashboardStats(),
    getSalesLast6Months(),
    getArtisansByPlan(),
    getTopArtisansMonth(),
    getTopProductsMonth(),
  ]);

  const alerts: { count: number; label: string; href: string }[] = [
    {
      count: stats.bypassConversations,
      label: "conversaciones con bypass detectado",
      href: "/portal/admin/mensajes?bypass=true",
    },
    {
      count: stats.pendingApplications,
      label: "postulaciones pendientes",
      href: "/portal/admin/postulaciones",
    },
    {
      count: stats.pendingProducts,
      label: "productos por aprobar",
      href: "/portal/admin/productos",
    },
    {
      count: stats.pendingPhotos,
      label: "fotos por revisar",
      href: "/portal/admin/fotos",
    },
    {
      count: stats.openDisputes,
      label: "disputas abiertas",
      href: "/portal/admin/disputas",
    },
    {
      count: stats.lateShipments,
      label: "despachos atrasados",
      href: "/portal/admin/pedidos",
    },
    {
      count: stats.pendingReturns,
      label: "devoluciones pendientes",
      href: "/portal/admin/devoluciones",
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Panel Administrativo</h1>

      {/* Alert banners */}
      <div className="mt-6 space-y-2">
        {alerts
          .filter((a) => a.count > 0)
          .map((alert) => (
            <Link
              key={alert.href}
              href={alert.href}
              className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm transition-colors ${
                alert.href.includes("bypass")
                  ? "bg-red-50 text-red-900 hover:bg-red-100"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              <span className="font-medium">
                {alert.count} {alert.label}
              </span>
              <span className={`ml-auto text-xs ${alert.href.includes("bypass") ? "text-red-700" : "text-amber-700"}`}>&rarr;</span>
            </Link>
          ))}

        {/* Expiring subscriptions */}
        {stats.expiringSubs.length > 0 && (
          <div className="rounded-md bg-orange-50 px-4 py-3 text-sm text-orange-900">
            <span className="font-medium">Suscripciones por vencer (7 días):</span>
            {stats.expiringSubs.map((s) => (
              <span key={s.id} className="ml-2">
                {s.artisan.displayName} ({s.plan.name}, {s.endDate ? new Date(s.endDate).toLocaleDateString("es-CL") : "—"})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Row 1: Main KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">GMV del Mes</p>
          <p className="mt-1 text-2xl font-medium">{formatCLP(stats.gmv)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Comisiones</p>
          <p className="mt-1 text-2xl font-medium">{formatCLP(stats.commissions)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Suscripciones</p>
          <p className="mt-1 text-2xl font-medium">{formatCLP(stats.subscriptionRevenue)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Pedidos del Mes</p>
          <p className="mt-1 text-2xl font-medium">{stats.monthlyOrderCount}</p>
        </Card>
      </div>

      {/* Row 2: Secondary KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Orfebres Activos</p>
          <p className="mt-1 text-2xl font-medium">{stats.activeArtisans}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Productos</p>
          <p className="mt-1 text-2xl font-medium">{stats.publishedProducts}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Compradores</p>
          <p className="mt-1 text-2xl font-medium">{stats.registeredBuyers}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Reseñas del Mes</p>
          <p className="mt-1 text-2xl font-medium">{stats.monthlyReviews}</p>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/portal/admin/curaduria"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#8B7355]/30 bg-[#8B7355]/5 px-4 py-2 text-sm font-medium text-[#8B7355] transition-colors hover:bg-[#8B7355]/10"
        >
          ✦ Curaduría
        </Link>
        <Link
          href="/portal/admin/blog"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#8B7355]/30 bg-[#8B7355]/5 px-4 py-2 text-sm font-medium text-[#8B7355] transition-colors hover:bg-[#8B7355]/10"
        >
          ✎ Blog
        </Link>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart data={salesData} />
        <PlanDistributionChart data={planData} />
      </div>

      {/* Tables: Top artisans & top products */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top artisans */}
        <Card>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Top 5 orfebres del mes
          </h3>
          {topArtisans.length === 0 ? (
            <p className="text-sm text-text-tertiary">Sin ventas este mes</p>
          ) : (
            <div className="space-y-2">
              {topArtisans.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                      {i + 1}
                    </span>
                    <span>{a.name}</span>
                    <span className="text-xs text-text-tertiary">{a.plan}</span>
                  </div>
                  <span className="font-medium">{formatCLP(a.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top products */}
        <Card>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Top 5 productos del mes
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-text-tertiary">Sin ventas este mes</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                      {i + 1}
                    </span>
                    <div>
                      <span>{p.name}</span>
                      <span className="ml-1 text-xs text-text-tertiary">({p.artisan})</span>
                    </div>
                  </div>
                  <span className="font-medium">{p.units} uds.</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
