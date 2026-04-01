import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCampaigns, getCampaignDetail } from "@/lib/actions/campaign-invitations";
import { InvitationSender } from "@/components/admin/invitation-sender";

export default async function InvitacionesCompradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const campaigns = await getCampaigns("BUYER");
  const detail = params.campaign ? await getCampaignDetail(params.campaign) : null;

  return (
    <div>
      <h1 className="font-serif text-3xl font-light text-text">Invitaciones &middot; Compradores</h1>
      <div className="mt-8">
        <InvitationSender type="BUYER" campaigns={campaigns} campaignDetail={detail} />
      </div>
    </div>
  );
}
