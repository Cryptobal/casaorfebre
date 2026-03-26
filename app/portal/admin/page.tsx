import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const alerts: { count: number; label: string; href: string }[] = [
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

  const kpis: { label: string; value: string }[] = [
    { label: "GMV del Mes", value: formatCLP(stats.gmv) },
    { label: "Comisiones", value: formatCLP(stats.commissions) },
    { label: "Ventas", value: String(stats.salesCount) },
    { label: "Ticket Promedio", value: formatCLP(stats.avgTicket) },
    { label: "Orfebres Activos", value: String(stats.activeArtisans) },
    { label: "Productos Publicados", value: String(stats.publishedProducts) },
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
              className="flex items-center gap-2 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 transition-colors hover:bg-amber-100"
            >
              <span className="font-medium">
                {alert.count} {alert.label}
              </span>
              <span className="ml-auto text-xs text-amber-700">&rarr;</span>
            </Link>
          ))}
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              {kpi.label}
            </p>
            <p className="mt-1 text-2xl font-medium">{kpi.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
