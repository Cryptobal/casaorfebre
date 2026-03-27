import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { SalesChart, RevenueChart } from "./sales-chart";

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export default async function EstadisticasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        take: 1,
      },
    },
  });

  if (!artisan) redirect("/");

  const plan = artisan.subscriptions[0]?.plan;
  const hasBasicStats = plan?.hasBasicStats ?? false;
  const hasAdvancedStats = plan?.hasAdvancedStats ?? false;

  // If no plan with stats access, show upgrade prompt
  if (!hasBasicStats) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-serif text-2xl font-semibold text-text">Estadísticas</h1>
        <div className="relative mt-6">
          {/* Blurred preview */}
          <div className="pointer-events-none select-none blur-sm">
            <PlaceholderStats />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-surface/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="font-serif text-xl font-semibold text-text">
                Disponible en plan Artesano
              </p>
              <p className="mt-2 max-w-md text-sm text-text-secondary">
                Accede a estadísticas de ventas, visitas y rendimiento de tus productos
                con el plan Artesano o superior.
              </p>
              <Link
                href="/portal/orfebre/perfil"
                className="mt-4 inline-block rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
              >
                Mejorar mi plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Fetch data for basic stats ──
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    monthlyOrderItems,
    lastMonthOrderItems,
    topProducts,
    totalViews,
    last6MonthsItems,
  ] = await Promise.all([
    // Current month order items
    prisma.orderItem.findMany({
      where: {
        artisanId: artisan.id,
        createdAt: { gte: startOfMonth },
      },
    }),
    // Last month order items
    prisma.orderItem.findMany({
      where: {
        artisanId: artisan.id,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    // Top 5 most viewed products
    prisma.product.findMany({
      where: { artisanId: artisan.id, status: "APPROVED" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, viewCount: true, price: true },
    }),
    // Total views across all products
    prisma.product.aggregate({
      where: { artisanId: artisan.id },
      _sum: { viewCount: true },
    }),
    // Last 6 months of order items for chart
    prisma.orderItem.findMany({
      where: {
        artisanId: artisan.id,
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      select: { createdAt: true, artisanPayout: true, quantity: true },
    }),
  ]);

  // Basic stats calculations
  const monthlySalesCount = monthlyOrderItems.reduce((sum, i) => sum + i.quantity, 0);
  const monthlySalesAmount = monthlyOrderItems.reduce((sum, i) => sum + i.productPrice * i.quantity, 0);
  const monthlyNetIncome = monthlyOrderItems.reduce((sum, i) => sum + i.artisanPayout, 0);
  const totalViewCount = totalViews._sum.viewCount ?? 0;

  // Chart data: last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const monthItems = last6MonthsItems.filter((item) => {
      const c = new Date(item.createdAt);
      return `${c.getFullYear()}-${c.getMonth()}` === monthKey;
    });
    return {
      month: MONTH_NAMES[d.getMonth()],
      ventas: monthItems.reduce((s, item) => s + item.quantity, 0),
      monto: monthItems.reduce((s, item) => s + item.artisanPayout, 0),
    };
  });

  // ── Advanced stats (only if hasAdvancedStats) ──
  let advancedData: {
    lastMonthSalesCount: number;
    lastMonthNetIncome: number;
    conversionProducts: { name: string; views: number; sales: number; rate: number }[];
    favoritedNotBought: { name: string; slug: string; favoriteCount: number }[];
  } | null = null;

  if (hasAdvancedStats) {
    const lastMonthSalesCount = lastMonthOrderItems.reduce((sum, i) => sum + i.quantity, 0);
    const lastMonthNetIncome = lastMonthOrderItems.reduce((sum, i) => sum + i.artisanPayout, 0);

    // Conversion rate per product (views vs purchases)
    const productsWithSales = await prisma.product.findMany({
      where: { artisanId: artisan.id, status: "APPROVED", viewCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        viewCount: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 10,
    });

    const conversionProducts = productsWithSales.map((p) => ({
      name: p.name,
      views: p.viewCount,
      sales: p._count.orderItems,
      rate: p.viewCount > 0 ? (p._count.orderItems / p.viewCount) * 100 : 0,
    }));

    // Products in favorites but not purchased recently (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const favoritedProducts = await prisma.product.findMany({
      where: {
        artisanId: artisan.id,
        status: "APPROVED",
        favorites: { some: {} },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { favorites: true } },
        orderItems: {
          where: { createdAt: { gte: ninetyDaysAgo } },
          select: { id: true },
        },
      },
    });

    const favoritedNotBought = favoritedProducts
      .filter((p) => p.orderItems.length === 0)
      .map((p) => ({
        name: p.name,
        slug: p.slug,
        favoriteCount: p._count.favorites,
      }))
      .sort((a, b) => b.favoriteCount - a.favoriteCount)
      .slice(0, 10);

    advancedData = {
      lastMonthSalesCount,
      lastMonthNetIncome,
      conversionProducts,
      favoritedNotBought,
    };
  }

  // ── Variation calculations ──
  const salesVariation = advancedData
    ? advancedData.lastMonthSalesCount > 0
      ? ((monthlySalesCount - advancedData.lastMonthSalesCount) / advancedData.lastMonthSalesCount) * 100
      : monthlySalesCount > 0 ? 100 : 0
    : null;

  const incomeVariation = advancedData
    ? advancedData.lastMonthNetIncome > 0
      ? ((monthlyNetIncome - advancedData.lastMonthNetIncome) / advancedData.lastMonthNetIncome) * 100
      : monthlyNetIncome > 0 ? 100 : 0
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-text">Estadísticas</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Resumen de rendimiento de tu taller
      </p>

      {/* ── Basic Stats Cards ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ventas del mes"
          value={String(monthlySalesCount)}
          sublabel={`${monthlyOrderItems.length} pedidos`}
          variation={salesVariation}
        />
        <StatCard
          label="Monto vendido"
          value={formatCLP(monthlySalesAmount)}
          sublabel="Bruto"
        />
        <StatCard
          label="Ingreso neto"
          value={formatCLP(monthlyNetIncome)}
          sublabel="Después de comisiones"
          variation={incomeVariation}
          highlight
        />
        <StatCard
          label="Visitas totales"
          value={totalViewCount.toLocaleString("es-CL")}
          sublabel="A tus productos"
        />
      </div>

      {/* ── Top 5 Products ── */}
      <div className="mt-8">
        <h2 className="font-serif text-lg font-semibold text-text">Top 5 productos más vistos</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">#</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Producto</th>
                <th className="px-4 py-3 text-right font-medium text-text-secondary">Visitas</th>
                <th className="hidden px-4 py-3 text-right font-medium text-text-secondary sm:table-cell">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                    Aún no hay datos de visitas
                  </td>
                </tr>
              ) : (
                topProducts.map((p, i) => (
                  <tr key={p.id} className="hover:bg-background/50">
                    <td className="px-4 py-3 text-text-tertiary">{i + 1}</td>
                    <td className="px-4 py-3 text-text">{p.name}</td>
                    <td className="px-4 py-3 text-right text-text">{p.viewCount.toLocaleString("es-CL")}</td>
                    <td className="hidden px-4 py-3 text-right text-text-secondary sm:table-cell">{formatCLP(p.price)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sales Chart (last 6 months) ── */}
      <div className="mt-8">
        <h2 className="font-serif text-lg font-semibold text-text">Ventas últimos 6 meses</h2>
        <Card className="mt-4">
          <SalesChart data={chartData} />
        </Card>
      </div>

      {/* ── Advanced Stats Section ── */}
      <div className="mt-12">
        <h2 className="font-serif text-xl font-semibold text-text">Estadísticas Avanzadas</h2>

        {!hasAdvancedStats ? (
          <div className="relative mt-4">
            <div className="pointer-events-none select-none blur-sm">
              <PlaceholderAdvanced />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-surface/80 backdrop-blur-sm">
              <div className="text-center">
                <p className="font-serif text-xl font-semibold text-text">
                  Disponible en plan Maestro
                </p>
                <p className="mt-2 max-w-md text-sm text-text-secondary">
                  Accede a tasa de conversión, comparaciones mensuales y análisis
                  de favoritos con el plan Maestro.
                </p>
                <Link
                  href="/portal/orfebre/perfil"
                  className="mt-4 inline-block rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                >
                  Mejorar mi plan
                </Link>
              </div>
            </div>
          </div>
        ) : advancedData ? (
          <div className="mt-4 space-y-8">
            {/* Month comparison */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <p className="text-sm text-text-secondary">Ventas mes anterior</p>
                <p className="mt-1 text-2xl font-semibold text-text">{advancedData.lastMonthSalesCount}</p>
                <p className="mt-1 text-sm text-text-tertiary">vs {monthlySalesCount} este mes</p>
              </Card>
              <Card>
                <p className="text-sm text-text-secondary">Ingreso neto mes anterior</p>
                <p className="mt-1 text-2xl font-semibold text-text">{formatCLP(advancedData.lastMonthNetIncome)}</p>
                <p className="mt-1 text-sm text-text-tertiary">vs {formatCLP(monthlyNetIncome)} este mes</p>
              </Card>
            </div>

            {/* Revenue chart */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-text">Ingreso neto últimos 6 meses</h3>
              <Card className="mt-4">
                <RevenueChart data={chartData} />
              </Card>
            </div>

            {/* Conversion rate */}
            {advancedData.conversionProducts.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-text">Tasa de conversión por producto</h3>
                <p className="mt-1 text-sm text-text-tertiary">Visitas vs compras</p>
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-background">
                      <tr>
                        <th className="px-4 py-3 font-medium text-text-secondary">Producto</th>
                        <th className="px-4 py-3 text-right font-medium text-text-secondary">Visitas</th>
                        <th className="px-4 py-3 text-right font-medium text-text-secondary">Ventas</th>
                        <th className="px-4 py-3 text-right font-medium text-text-secondary">Conversión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {advancedData.conversionProducts.map((p) => (
                        <tr key={p.name} className="hover:bg-background/50">
                          <td className="px-4 py-3 text-text">{p.name}</td>
                          <td className="px-4 py-3 text-right text-text-secondary">{p.views.toLocaleString("es-CL")}</td>
                          <td className="px-4 py-3 text-right text-text-secondary">{p.sales}</td>
                          <td className="px-4 py-3 text-right font-medium text-text">{p.rate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Favorited but not bought */}
            {advancedData.favoritedNotBought.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-text">En favoritos pero sin compra reciente</h3>
                <p className="mt-1 text-sm text-text-tertiary">
                  Productos que los compradores guardan pero aún no compran (últimos 90 días)
                </p>
                <div className="mt-4 overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-background">
                      <tr>
                        <th className="px-4 py-3 font-medium text-text-secondary">Producto</th>
                        <th className="px-4 py-3 text-right font-medium text-text-secondary">En favoritos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {advancedData.favoritedNotBought.map((p) => (
                        <tr key={p.slug} className="hover:bg-background/50">
                          <td className="px-4 py-3 text-text">
                            <Link href={`/coleccion/${p.slug}`} className="text-accent hover:underline">
                              {p.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right text-text-secondary">
                            {p.favoriteCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */

function StatCard({
  label,
  value,
  sublabel,
  highlight,
  variation,
}: {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
  variation?: number | null;
}) {
  return (
    <Card>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${highlight ? "text-green-700" : "text-text"}`}>
        {value}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {sublabel && <p className="text-xs text-text-tertiary">{sublabel}</p>}
        {variation !== null && variation !== undefined && (
          <span
            className={`text-xs font-medium ${
              variation > 0 ? "text-green-600" : variation < 0 ? "text-red-500" : "text-text-tertiary"
            }`}
          >
            {variation > 0 ? "+" : ""}{variation.toFixed(1)}% vs mes anterior
          </span>
        )}
      </div>
    </Card>
  );
}

function PlaceholderStats() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <p className="text-sm text-text-secondary">Dato ejemplo</p>
            <p className="mt-1 text-2xl font-semibold text-text">1.234</p>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border border-border p-6">
        <div className="h-48 rounded bg-background" />
      </div>
      <div className="rounded-lg border border-border p-6">
        <div className="h-32 rounded bg-background" />
      </div>
    </div>
  );
}

function PlaceholderAdvanced() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-text-secondary">Tasa de conversión</p>
          <p className="mt-1 text-2xl font-semibold text-text">3.2%</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Comparación mensual</p>
          <p className="mt-1 text-2xl font-semibold text-text">+15%</p>
        </Card>
      </div>
      <div className="rounded-lg border border-border p-6">
        <div className="h-48 rounded bg-background" />
      </div>
      <div className="rounded-lg border border-border p-6">
        <div className="h-32 rounded bg-background" />
      </div>
    </div>
  );
}
