import { getInvitations, getCampaignMetrics, getCampaigns } from "@/lib/actions/invitations";
import { Card } from "@/components/ui/card";
import { InvitacionesClient } from "./invitaciones-client";

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

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Invitaciones Pioneros</h1>

      {/* Campaign metrics */}
      {metrics && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Campaña: {metricsCampaign}
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
