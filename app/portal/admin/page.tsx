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
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [stats, salesData, planData, topArtisans, topProducts, pinterestToken] = await Promise.all([
    getAdminDashboardStats(),
    getSalesLast6Months(),
    getArtisansByPlan(),
    getTopArtisansMonth(),
    getTopProductsMonth(),
    prisma.systemSetting.findUnique({ where: { key: "PINTEREST_ACCESS_TOKEN" } }).catch(() => null),
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

  // Additional intelligence queries
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    unansweredQuestions48h,
    inactiveArtisans30d,
    pendingShipments,
    salesThisWeek,
    salesLastWeek,
    lastBlogPost,
  ] = await Promise.all([
    prisma.productQuestion.count({
      where: { answer: null, createdAt: { lte: fortyEightHoursAgo } },
    }),
    prisma.artisan.count({
      where: {
        status: "APPROVED",
        products: { none: { createdAt: { gte: thirtyDaysAgo } } },
      },
    }),
    prisma.orderItem.count({
      where: { fulfillmentStatus: "PENDING", order: { status: "PAID" } },
    }),
    prisma.orderItem.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.orderItem.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo,
        },
      },
    }),
    prisma.blogPost.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    }),
  ]);

  const salesChange = salesLastWeek > 0
    ? Math.round(((salesThisWeek - salesLastWeek) / salesLastWeek) * 100)
    : salesThisWeek > 0 ? 100 : 0;

  const daysSinceLastBlog = lastBlogPost?.publishedAt
    ? Math.floor((Date.now() - lastBlogPost.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const intelligenceAlerts: { icon: string; text: string; href: string; color: string }[] = [];

  if (unansweredQuestions48h > 0) {
    intelligenceAlerts.push({
      icon: "🔴",
      text: `${unansweredQuestions48h} preguntas de compradores sin responder hace 48h+`,
      href: "/portal/admin/preguntas",
      color: "text-red-800",
    });
  }
  if (inactiveArtisans30d > 0) {
    intelligenceAlerts.push({
      icon: "🟡",
      text: `${inactiveArtisans30d} orfebres no han publicado desde hace 30 días`,
      href: "/portal/admin/pipeline",
      color: "text-amber-800",
    });
  }
  if (salesChange !== 0) {
    intelligenceAlerts.push({
      icon: salesChange > 0 ? "🟢" : "🔻",
      text: `Ventas ${salesChange > 0 ? "+" : ""}${salesChange}% vs semana pasada`,
      href: "/portal/admin/finanzas",
      color: salesChange > 0 ? "text-green-800" : "text-red-800",
    });
  }
  if (pendingShipments > 0) {
    intelligenceAlerts.push({
      icon: "📦",
      text: `${pendingShipments} pedidos pendientes de despacho`,
      href: "/portal/admin/pedidos",
      color: "text-amber-800",
    });
  }
  if (daysSinceLastBlog !== null && daysSinceLastBlog > 14) {
    intelligenceAlerts.push({
      icon: "📝",
      text: `El blog no tiene artículo nuevo hace ${daysSinceLastBlog} días`,
      href: "/portal/admin/blog",
      color: "text-amber-800",
    });
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Panel Administrativo</h1>

      {/* Marketplace Intelligence */}
      {intelligenceAlerts.length > 0 && (
        <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 p-5">
          <h2 className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
            Inteligencia del Marketplace
          </h2>
          <div className="space-y-2">
            {intelligenceAlerts.map((alert) => (
              <Link
                key={alert.text}
                href={alert.href}
                className={`flex items-center gap-2 text-sm ${alert.color} hover:opacity-80 transition-opacity`}
              >
                <span>{alert.icon}</span>
                <span>{alert.text}</span>
                <span className="ml-auto text-xs text-accent">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* Pinterest status */}
      {process.env.PINTEREST_APP_ID && (
        <div className="mt-4">
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest text-text-tertiary">Pinterest</span>
                {(() => {
                  if (!pinterestToken) {
                    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Desconectado</span>;
                  }
                  const daysSinceUpdate = Math.floor((Date.now() - pinterestToken.updatedAt.getTime()) / 86400000);
                  if (daysSinceUpdate > 30) {
                    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Token expirado</span>;
                  }
                  if (daysSinceUpdate > 25) {
                    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Por expirar</span>;
                  }
                  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Conectado</span>;
                })()}
                {pinterestToken && (
                  <span className="text-xs text-text-tertiary">
                    Último refresh: {pinterestToken.updatedAt.toLocaleDateString("es-CL")}
                  </span>
                )}
              </div>
              <a
                href={`https://www.pinterest.com/oauth/?client_id=${process.env.PINTEREST_APP_ID}&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/api/auth/pinterest/callback`)}&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read&state=casaorfebre`}
                className="text-xs text-accent hover:underline"
              >
                {pinterestToken ? "Reconectar" : "Conectar Pinterest"}
              </a>
            </div>
          </Card>
        </div>
      )}

      {/* Row 1: Main KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/portal/admin/finanzas" className="cursor-pointer">
          <Card className="h-full transition-colors hover:border-accent/40">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">GMV del Mes</p>
            <p className="mt-1 text-2xl font-medium">{formatCLP(stats.gmv)}</p>
          </Card>
        </Link>
        <Link href="/portal/admin/finanzas" className="cursor-pointer">
          <Card className="h-full transition-colors hover:border-accent/40">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Comisiones</p>
            <p className="mt-1 text-2xl font-medium">{formatCLP(stats.commissions)}</p>
          </Card>
        </Link>
        <Link href="/portal/admin/suscripciones" className="cursor-pointer">
          <Card className="h-full transition-colors hover:border-accent/40">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Suscripciones</p>
            <p className="mt-1 text-2xl font-medium">{formatCLP(stats.subscriptionRevenue)}</p>
          </Card>
        </Link>
        <Link href="/portal/admin/pedidos" className="cursor-pointer">
          <Card className="h-full transition-colors hover:border-accent/40">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Pedidos del Mes</p>
            <p className="mt-1 text-2xl font-medium">{stats.monthlyOrderCount}</p>
          </Card>
        </Link>
      </div>

      {/* Row 2: Secondary KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/portal/admin/orfebres" className="cursor-pointer">
          <Card className="h-full transition-colors hover:border-accent/40">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Orfebres Activos</p>
            <p className="mt-1 text-2xl font-medium">{stats.activeArtisans}</p>
          </Card>
        </Link>
        <Link href="/portal/admin/productos" className="cursor-pointer">
          <Card className="h-full transition-colors hover:border-accent/40">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Productos</p>
            <p className="mt-1 text-2xl font-medium">{stats.publishedProducts}</p>
          </Card>
        </Link>
        <Link href="/portal/admin/compradores" className="cursor-pointer">
          <Card className="h-full transition-colors hover:border-accent/40">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Compradores</p>
            <p className="mt-1 text-2xl font-medium">{stats.registeredBuyers}</p>
          </Card>
        </Link>
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
