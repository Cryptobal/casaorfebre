import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCampaigns } from "@/lib/actions/campaign-invitations";
import { InvitationSender } from "@/components/admin/invitation-sender";
import Link from "next/link";

export default async function InvitacionesOrfebresPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const campaigns = await getCampaigns("ARTISAN");

  return (
    <div>
      <Link
        href="/portal/admin/invitaciones"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-tertiary transition-colors hover:text-accent"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver a Invitaciones
      </Link>
      <h1 className="font-serif text-3xl font-light text-text">{"Invitaciones · Orfebres"}</h1>
      <div className="mt-8">
        <InvitationSender type="ARTISAN" campaigns={campaigns} />
      </div>
    </div>
  );
}
