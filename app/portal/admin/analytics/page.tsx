import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "Analytics de Referidos" };

export default async function ReferralAnalyticsPage() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [sourceSummary, topProducts, topLanding] = await Promise.all([
    prisma.referralVisit.groupBy({
      by: ["source"],
      where: { createdAt: { gte: cutoff } },
      _count: true,
      orderBy: { _count: { source: "desc" } },
    }),
    prisma.referralVisit.groupBy({
      by: ["productSlug", "source"],
      where: { createdAt: { gte: cutoff }, productSlug: { not: null } },
      _count: true,
      orderBy: { _count: { productSlug: "desc" } },
      take: 15,
    }),
    prisma.referralVisit.groupBy({
      by: ["landingPage"],
      where: { createdAt: { gte: cutoff } },
      _count: true,
      orderBy: { _count: { landingPage: "desc" } },
      take: 10,
    }),
  ]);

  // Count conversions per source
  const conversions = await prisma.referralVisit.groupBy({
    by: ["source"],
    where: { createdAt: { gte: cutoff }, convertedToOrder: true },
    _count: true,
  });
  const conversionMap = Object.fromEntries(
    conversions.map((c) => [c.source, c._count]),
  );

  // Count distinct product slugs per source
  const productVisits = await prisma.referralVisit.groupBy({
    by: ["source"],
    where: { createdAt: { gte: cutoff }, productSlug: { not: null } },
    _count: true,
  });
  const productMap = Object.fromEntries(
    productVisits.map((p) => [p.source, p._count]),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-light">Analytics de Referidos</h1>
        <span className="text-xs text-text-tertiary">Últimos 30 días</span>
      </div>

      {/* Summary by source */}
      <Card className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Visitas por fuente
        </h2>
        {sourceSummary.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin datos de tracking aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-tertiary uppercase tracking-wide">
                  <th className="pb-2 pr-4">Fuente</th>
                  <th className="pb-2 pr-4 text-right">Visitas</th>
                  <th className="pb-2 pr-4 text-right">Productos vistos</th>
                  <th className="pb-2 text-right">Conversiones</th>
                </tr>
              </thead>
              <tbody>
                {sourceSummary.map((row) => (
                  <tr key={row.source} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium capitalize">{row.source}</td>
                    <td className="py-2 pr-4 text-right">{row._count}</td>
                    <td className="py-2 pr-4 text-right">{productMap[row.source] || 0}</td>
                    <td className="py-2 text-right">{conversionMap[row.source] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top products */}
        <Card>
          <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
            Productos más visitados
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-text-tertiary">Sin datos.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((row, i) => (
                <div key={`${row.productSlug}-${row.source}-${i}`} className="flex items-center justify-between text-sm">
                  <Link href={`/coleccion/${row.productSlug}`} className="text-accent hover:underline truncate max-w-[200px]">
                    {row.productSlug}
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary capitalize">{row.source}</span>
                    <span className="font-medium">{row._count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top landing pages */}
        <Card>
          <h2 className="text-sm font-medium uppercase tracking-widest text-text-tertiary mb-4">
            Landing pages más visitadas
          </h2>
          {topLanding.length === 0 ? (
            <p className="text-sm text-text-tertiary">Sin datos.</p>
          ) : (
            <div className="space-y-2">
              {topLanding.map((row) => (
                <div key={row.landingPage} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[250px] text-text-secondary">
                    {row.landingPage}
                  </span>
                  <span className="font-medium">{row._count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
