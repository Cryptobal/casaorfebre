import { getInvitations, getCampaignMetrics, getCampaigns } from "@/lib/actions/invitations";
import { Card } from "@/components/ui/card";
import { InvitacionesClient } from "./invitaciones-client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function InvitacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const campaign = params.campaign || "";
  const status = params.status || "";
  const search = params.search || "";

  const [invitations, campaigns] = await Promise.all([
    getInvitations({
      campaign: campaign || undefined,
      status: status || undefined,
      search: search || undefined,
    }),
    getCampaigns(),
  ]);

  // Get metrics for the selected campaign, or the first one if none selected
  const metricsCampaign = campaign || campaigns[0]?.name || "";
  const metrics = metricsCampaign
    ? await getCampaignMetrics(metricsCampaign)
    : null;

  // Campaign invitation stats (gracefully handle missing table before migration)
  let pioneerCount = 0, artisanCount = 0, buyerCount = 0;
  let pioneerAccepted = 0, artisanAccepted = 0, buyerAccepted = 0;
  try {
    [pioneerCount, artisanCount, buyerCount, pioneerAccepted, artisanAccepted, buyerAccepted] =
      await Promise.all([
        prisma.invitation.count({ where: { type: "PIONEER" } }),
        prisma.invitation.count({ where: { type: "ARTISAN" } }),
        prisma.invitation.count({ where: { type: "BUYER" } }),
        prisma.invitation.count({ where: { type: "PIONEER", status: "ACCEPTED" } }),
        prisma.invitation.count({ where: { type: "ARTISAN", status: "ACCEPTED" } }),
        prisma.invitation.count({ where: { type: "BUYER", status: "ACCEPTED" } }),
      ]);
  } catch {
    // Table may not exist yet if migration hasn't been applied
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Invitaciones</h1>

      {/* Campaign Invitations Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Pioneros</p>
          <p className="mt-1 text-2xl font-medium">{pioneerCount}</p>
          <p className="text-xs text-text-tertiary">
            {"Aceptadas: "}{pioneerAccepted}{" ("}{pioneerCount > 0 ? Math.round((pioneerAccepted / pioneerCount) * 100) : 0}{"%)"}
          </p>
          <Link href="/portal/admin/invitaciones/pioneros" className="mt-2 inline-block text-xs font-medium text-accent hover:text-accent-dark">
            {"Ver campañas →"}
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Orfebres</p>
          <p className="mt-1 text-2xl font-medium">{artisanCount}</p>
          <p className="text-xs text-text-tertiary">
            {"Aceptadas: "}{artisanAccepted}{" ("}{artisanCount > 0 ? Math.round((artisanAccepted / artisanCount) * 100) : 0}{"%)"}
          </p>
          <Link href="/portal/admin/invitaciones/orfebres" className="mt-2 inline-block text-xs font-medium text-accent hover:text-accent-dark">
            {"Ver campañas →"}
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Compradores</p>
          <p className="mt-1 text-2xl font-medium">{buyerCount}</p>
          <p className="text-xs text-text-tertiary">
            {"Aceptadas: "}{buyerAccepted}{" ("}{buyerCount > 0 ? Math.round((buyerAccepted / buyerCount) * 100) : 0}{"%)"}
          </p>
          <Link href="/portal/admin/invitaciones/compradores" className="mt-2 inline-block text-xs font-medium text-accent hover:text-accent-dark">
            {"Ver campañas →"}
          </Link>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-4 border-b border-border pb-2">
        <Link href="/portal/admin/invitaciones/pioneros" className="text-sm font-medium text-text-secondary hover:text-text">Pioneros</Link>
        <Link href="/portal/admin/invitaciones/orfebres" className="text-sm font-medium text-text-secondary hover:text-text">Orfebres</Link>
        <Link href="/portal/admin/invitaciones/compradores" className="text-sm font-medium text-text-secondary hover:text-text">Compradores</Link>
      </div>

      <h2 className="mt-10 font-serif text-2xl font-light">Invitaciones Pioneros (códigos)</h2>

      {/* Campaign metrics */}
      {metrics && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            {"Campaña: "}{metricsCampaign}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Card>
              <p className="text-xs uppercase tracking-widest text-text-tertiary">Enviados</p>
              <p className="mt-1 text-2xl font-medium">{metrics.sent}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-widest text-text-tertiary">Abiertos</p>
              <p className="mt-1 text-2xl font-medium">{metrics.opened}</p>
              <p className="text-xs text-text-tertiary">{metrics.rates.openRate}%</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-widest text-text-tertiary">Postularon</p>
              <p className="mt-1 text-2xl font-medium">{metrics.applied}</p>
              <p className="text-xs text-text-tertiary">{metrics.rates.applicationRate}%</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-widest text-text-tertiary">Aprobados</p>
              <p className="mt-1 text-2xl font-medium">{metrics.redeemed}</p>
              <p className="text-xs text-text-tertiary">{metrics.rates.redemptionRate}%</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-widest text-text-tertiary">Expirados</p>
              <p className="mt-1 text-2xl font-medium">{metrics.expired}</p>
            </Card>
          </div>
        </div>
      )}

      <InvitacionesClient
        invitations={invitations}
        campaigns={campaigns}
        currentCampaign={campaign}
        currentStatus={status}
        currentSearch={search}
      />
    </div>
  );
}
