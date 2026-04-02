import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Stage {
  name: string;
  label: string;
  count: number;
  conversion?: string;
}

async function getPipelineCounts() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Stage 1: INVITADO - Invitations with status SENT or OPENED
  const invitado = await prisma.invitation.count({
    where: { status: { in: ["SENT", "OPENED"] } },
  });

  // Stage 2: POSTULADO - Applications with status PENDING
  const postulado = await prisma.artisanApplication.count({
    where: { status: "PENDING" },
  });

  // Stage 3: APROBADO - Approved artisans with 0 products
  const aprobado = await prisma.artisan.count({
    where: {
      status: "APPROVED",
      products: { none: {} },
    },
  });

  // Stage 4: PRIMERA_PIEZA - Approved, 1+ products, < 30 days since approvedAt
  const primeraPieza = await prisma.artisan.count({
    where: {
      status: "APPROVED",
      products: { some: {} },
      approvedAt: { gte: thirtyDaysAgo },
    },
  });

  // Stage 5: ACTIVO - Approved, 1+ products, 30+ days since approvedAt,
  // and at least one product created in the last 30 days
  const activo = await prisma.artisan.count({
    where: {
      status: "APPROVED",
      approvedAt: { lt: thirtyDaysAgo },
      products: { some: { createdAt: { gte: thirtyDaysAgo } } },
    },
  });

  // Stage 6: INACTIVO - Approved, has products, 30+ days since approvedAt,
  // but no product created in the last 30 days
  const inactivo = await prisma.artisan.count({
    where: {
      status: "APPROVED",
      approvedAt: { lt: thirtyDaysAgo },
      AND: [
        { products: { some: {} } },
        { products: { none: { createdAt: { gte: thirtyDaysAgo } } } },
      ],
    },
  });

  const stages: Stage[] = [
    { name: "INVITADO", label: "Invitado", count: invitado },
    { name: "POSTULADO", label: "Postulado", count: postulado },
    { name: "APROBADO", label: "Aprobado", count: aprobado },
    { name: "PRIMERA_PIEZA", label: "Primera pieza", count: primeraPieza },
    { name: "ACTIVO", label: "Activo", count: activo },
    { name: "INACTIVO", label: "Inactivo", count: inactivo },
  ];

  // Calculate conversion rates between adjacent stages
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count;
    if (prev > 0) {
      stages[i].conversion = ((stages[i].count / prev) * 100).toFixed(1);
    }
  }

  return { stages, thirtyDaysAgo, sevenDaysAgo };
}

interface AttentionArtisan {
  id: string;
  displayName: string;
  email: string;
  state: string;
  daysInactive: number;
}

async function getArtisansNeedingAttention(
  sevenDaysAgo: Date,
  thirtyDaysAgo: Date,
): Promise<AttentionArtisan[]> {
  const now = new Date();

  // Approved 7+ days ago but 0 products
  const noProducts = await prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      approvedAt: { not: null, lte: sevenDaysAgo },
      products: { none: {} },
    },
    include: { user: { select: { email: true } } },
  });

  // Approved artisans whose most recent product was created 30+ days ago
  const inactive = await prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      products: {
        some: {},
        none: { createdAt: { gte: thirtyDaysAgo } },
      },
    },
    include: {
      user: { select: { email: true } },
      products: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const results: AttentionArtisan[] = [];

  for (const a of noProducts) {
    const daysSinceApproval = a.approvedAt
      ? Math.floor((now.getTime() - a.approvedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    results.push({
      id: a.id,
      displayName: a.displayName,
      email: a.user.email,
      state: "Sin productos",
      daysInactive: daysSinceApproval,
    });
  }

  for (const a of inactive) {
    const lastProduct = a.products[0];
    const daysSinceLastProduct = lastProduct
      ? Math.floor((now.getTime() - lastProduct.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    results.push({
      id: a.id,
      displayName: a.displayName,
      email: a.user.email,
      state: "Inactivo",
      daysInactive: daysSinceLastProduct,
    });
  }

  // Sort by days inactive descending
  results.sort((a, b) => b.daysInactive - a.daysInactive);

  return results;
}

export default async function PipelinePage() {
  const { stages, thirtyDaysAgo, sevenDaysAgo } = await getPipelineCounts();
  const attention = await getArtisansNeedingAttention(sevenDaysAgo, thirtyDaysAgo);

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Pipeline de Crecimiento</h1>
      <p className="text-sm text-text-secondary mt-2 mb-8">
        Embudo de conversión de orfebres: desde invitación hasta orfebre activo
      </p>

      {/* Funnel visualization - horizontal cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage) => (
          <Card key={stage.name}>
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              {stage.label}
            </p>
            <p className="mt-1 text-2xl font-medium">{stage.count}</p>
            {stage.conversion && (
              <p className="mt-1 text-xs text-text-tertiary">
                {stage.conversion}% conv.
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Needs attention section */}
      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Requieren atención
        </h2>

        {attention.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            No hay orfebres que requieran atención en este momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-text-tertiary">
                  <th className="pb-2 pr-4 font-medium">Nombre</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Estado</th>
                  <th className="pb-2 pr-4 font-medium">D&iacute;as inactivo</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {attention.map((artisan) => (
                  <tr key={artisan.id} className="border-b border-border/50">
                    <td className="py-3 pr-4">{artisan.displayName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{artisan.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          artisan.state === "Inactivo"
                            ? "text-amber-600"
                            : "text-red-600"
                        }
                      >
                        {artisan.state}
                      </span>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{artisan.daysInactive}</td>
                    <td className="py-3">
                      <Link
                        href={`/portal/admin/orfebres/${artisan.id}`}
                        className="text-xs underline underline-offset-2 hover:text-text-primary text-text-secondary"
                      >
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
