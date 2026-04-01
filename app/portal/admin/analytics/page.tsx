import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { AnalyticsFilters } from "./analytics-filters";

export const metadata = { title: "Analytics de Referidos" };

const PERIOD_DAYS: Record<string, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}

export default async function ReferralAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const period = params.periodo || "30d";
  const sourceFilter = params.fuente || "";
  const days = PERIOD_DAYS[period] || 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const whereBase: Record<string, unknown> = { createdAt: { gte: cutoff } };
  if (sourceFilter) whereBase.source = sourceFilter;

  // ── KPIs ──
  const [totalVisits, uniqueSessions, totalConversions, totalProductViews] =
    await Promise.all([
      prisma.referralVisit.count({ where: whereBase }),
      prisma.referralVisit
        .groupBy({ by: ["sessionId"], where: whereBase })
        .then((r) => r.length),
      prisma.referralVisit.count({
        where: { ...whereBase, convertedToOrder: true },
      }),
      prisma.referralVisit.count({
        where: { ...whereBase, productSlug: { not: null } },
      }),
    ]);

  // ── Source summary ──
  const sourceSummary = await prisma.referralVisit.groupBy({
    by: ["source"],
    where: { createdAt: { gte: cutoff } },
    _count: true,
    orderBy: { _count: { source: "desc" } },
  });

  const conversions = await prisma.referralVisit.groupBy({
    by: ["source"],
    where: { createdAt: { gte: cutoff }, convertedToOrder: true },
    _count: true,
  });
  const conversionMap = Object.fromEntries(
    conversions.map((c) => [c.source, c._count]),
  );

  const productVisits = await prisma.referralVisit.groupBy({
    by: ["source"],
    where: { createdAt: { gte: cutoff }, productSlug: { not: null } },
    _count: true,
  });
  const productMap = Object.fromEntries(
    productVisits.map((p) => [p.source, p._count]),
  );

  const sessionsBySource = await prisma.referralVisit.groupBy({
    by: ["source", "sessionId"],
    where: { createdAt: { gte: cutoff } },
  });
  const uniqueSessionsBySource: Record<string, number> = {};
  for (const row of sessionsBySource) {
    uniqueSessionsBySource[row.source] =
      (uniqueSessionsBySource[row.source] || 0) + 1;
  }

  // ── Daily visits (for chart) ──
  const allVisits = await prisma.referralVisit.findMany({
    where: whereBase,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap = new Map<string, number>();
  // Initialize all days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const v of allVisits) {
    const key = v.createdAt.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  }
  const dailyData = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    label: formatDate(new Date(date)),
    count,
  }));
  const maxDaily = Math.max(...dailyData.map((d) => d.count), 1);

  // ── Top products ──
  const topProducts = await prisma.referralVisit.groupBy({
    by: ["productSlug"],
    where: { ...whereBase, productSlug: { not: null } },
    _count: true,
    orderBy: { _count: { productSlug: "desc" } },
    take: 10,
  });

  // Resolve product names
  const productSlugs = topProducts
    .map((p) => p.productSlug)
    .filter(Boolean) as string[];
  const productNames = await prisma.product.findMany({
    where: { slug: { in: productSlugs } },
    select: { slug: true, name: true },
  });
  const nameMap = Object.fromEntries(
    productNames.map((p) => [p.slug, p.name]),
  );

  // ── Top artisans ──
  const topArtisans = await prisma.referralVisit.groupBy({
    by: ["artisanSlug"],
    where: { ...whereBase, artisanSlug: { not: null } },
    _count: true,
    orderBy: { _count: { artisanSlug: "desc" } },
    take: 10,
  });

  const artisanSlugs = topArtisans
    .map((a) => a.artisanSlug)
    .filter(Boolean) as string[];
  const artisanNames = await prisma.artisan.findMany({
    where: { slug: { in: artisanSlugs } },
    select: { slug: true, displayName: true },
  });
  const artisanNameMap = Object.fromEntries(
    artisanNames.map((a) => [a.slug, a.displayName]),
  );

  // ── Top landing pages ──
  const topLanding = await prisma.referralVisit.groupBy({
    by: ["landingPage"],
    where: whereBase,
    _count: true,
    orderBy: { _count: { landingPage: "desc" } },
    take: 10,
  });

  // ── Recent visits ──
  const recentVisits = await prisma.referralVisit.findMany({
    where: whereBase,
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      source: true,
      medium: true,
      campaign: true,
      landingPage: true,
      productSlug: true,
      convertedToOrder: true,
      createdAt: true,
    },
  });

  const allSources = sourceSummary.map((s) => s.source);
  const conversionRate =
    totalVisits > 0 ? ((totalConversions / totalVisits) * 100).toFixed(1) : "0";

  return (
    <div>
      {/* Header + filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-light">Analytics</h1>
        <AnalyticsFilters
          currentPeriod={period}
          currentSource={sourceFilter}
          sources={allSources}
        />
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Visitas
          </p>
          <p className="mt-1 text-2xl font-medium">
            {totalVisits.toLocaleString("es-CL")}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Sesiones únicas
          </p>
          <p className="mt-1 text-2xl font-medium">
            {uniqueSessions.toLocaleString("es-CL")}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Productos vistos
          </p>
          <p className="mt-1 text-2xl font-medium">
            {totalProductViews.toLocaleString("es-CL")}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Conversiones
          </p>
          <p className="mt-1 text-2xl font-medium">
            {totalConversions}{" "}
            <span className="text-sm font-normal text-text-tertiary">
              ({conversionRate}%)
            </span>
          </p>
        </Card>
      </div>

      {/* Daily chart */}
      <Card className="mt-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Visitas por día
        </h2>
        <div className="flex items-end gap-[2px] h-32">
          {dailyData.map((d) => (
            <div
              key={d.date}
              className="group relative flex-1 flex flex-col items-center justify-end"
            >
              <div
                className="w-full rounded-t bg-accent/70 hover:bg-accent transition-colors min-h-[2px]"
                style={{ height: `${(d.count / maxDaily) * 100}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-text px-2 py-1 text-[10px] text-surface shadow-lg z-10">
                {d.label}: {d.count}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-text-tertiary">
          <span>{dailyData[0]?.label}</span>
          <span>{dailyData[dailyData.length - 1]?.label}</span>
        </div>
      </Card>

      {/* Source summary table */}
      <Card className="mt-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Desglose por fuente
        </h2>
        {sourceSummary.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin datos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-tertiary uppercase tracking-wide">
                  <th className="pb-2 pr-4">Fuente</th>
                  <th className="pb-2 pr-4 text-right">Visitas</th>
                  <th className="pb-2 pr-4 text-right">Sesiones</th>
                  <th className="pb-2 pr-4 text-right">Productos</th>
                  <th className="pb-2 pr-4 text-right">Conversiones</th>
                  <th className="pb-2 text-right">Tasa</th>
                </tr>
              </thead>
              <tbody>
                {sourceSummary.map((row) => {
                  const visits = row._count;
                  const conv = conversionMap[row.source] || 0;
                  const rate =
                    visits > 0 ? ((conv / visits) * 100).toFixed(1) : "0";
                  return (
                    <tr
                      key={row.source}
                      className="border-b border-border/50"
                    >
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`?periodo=${period}&fuente=${row.source}`}
                          className="font-medium capitalize text-accent hover:underline"
                        >
                          {row.source}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-right">{visits}</td>
                      <td className="py-2.5 pr-4 text-right">
                        {uniqueSessionsBySource[row.source] || 0}
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        {productMap[row.source] || 0}
                      </td>
                      <td className="py-2.5 pr-4 text-right">{conv}</td>
                      <td className="py-2.5 text-right text-text-tertiary">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top products */}
        <Card>
          <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
            Top productos
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-text-tertiary">Sin datos.</p>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((row, i) => (
                <div
                  key={`${row.productSlug}-${i}`}
                  className="flex items-center justify-between text-sm"
                >
                  <Link
                    href={`/coleccion/${row.productSlug}`}
                    className="text-accent hover:underline truncate max-w-[180px]"
                    target="_blank"
                  >
                    {nameMap[row.productSlug!] || row.productSlug}
                  </Link>
                  <span className="font-medium tabular-nums">
                    {row._count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top artisans */}
        <Card>
          <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
            Top orfebres visitados
          </h2>
          {topArtisans.length === 0 ? (
            <p className="text-sm text-text-tertiary">Sin datos.</p>
          ) : (
            <div className="space-y-2.5">
              {topArtisans.map((row, i) => (
                <div
                  key={`${row.artisanSlug}-${i}`}
                  className="flex items-center justify-between text-sm"
                >
                  <Link
                    href={`/orfebres/${row.artisanSlug}`}
                    className="text-accent hover:underline truncate max-w-[180px]"
                    target="_blank"
                  >
                    {artisanNameMap[row.artisanSlug!] || row.artisanSlug}
                  </Link>
                  <span className="font-medium tabular-nums">
                    {row._count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top landing pages */}
        <Card>
          <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
            Top landing pages
          </h2>
          {topLanding.length === 0 ? (
            <p className="text-sm text-text-tertiary">Sin datos.</p>
          ) : (
            <div className="space-y-2.5">
              {topLanding.map((row) => (
                <div
                  key={row.landingPage}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate max-w-[180px] text-text-secondary">
                    {row.landingPage}
                  </span>
                  <span className="font-medium tabular-nums">
                    {row._count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent visits log */}
      <Card className="mt-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Visitas recientes
        </h2>
        {recentVisits.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin datos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-text-tertiary uppercase tracking-wide">
                  <th className="pb-2 pr-3">Fecha</th>
                  <th className="pb-2 pr-3">Fuente</th>
                  <th className="pb-2 pr-3">Medio</th>
                  <th className="pb-2 pr-3">Campaña</th>
                  <th className="pb-2 pr-3">Página</th>
                  <th className="pb-2 pr-3">Producto</th>
                  <th className="pb-2">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-border/30 hover:bg-background/50"
                  >
                    <td className="py-2 pr-3 whitespace-nowrap text-text-tertiary">
                      {v.createdAt.toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-3 capitalize font-medium">
                      {v.source}
                    </td>
                    <td className="py-2 pr-3 text-text-tertiary">
                      {v.medium || "—"}
                    </td>
                    <td className="py-2 pr-3 text-text-tertiary">
                      {v.campaign || "—"}
                    </td>
                    <td className="py-2 pr-3 max-w-[150px] truncate text-text-secondary">
                      {v.landingPage}
                    </td>
                    <td className="py-2 pr-3">
                      {v.productSlug ? (
                        <Link
                          href={`/coleccion/${v.productSlug}`}
                          className="text-accent hover:underline"
                          target="_blank"
                        >
                          {nameMap[v.productSlug] || v.productSlug}
                        </Link>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {v.convertedToOrder ? (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                          Sí
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
