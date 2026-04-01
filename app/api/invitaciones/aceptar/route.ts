import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { trackInvitationClick } from "@/lib/actions/campaign-invitations";

const TYPE_REDIRECT: Record<string, string> = {
  PIONEER: "/pioneros",
  ARTISAN: "/para-orfebres",
  BUYER: "/para-compradores",
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) redirect("/");

  try {
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) redirect("/");

    await trackInvitationClick(token);

    const destination = TYPE_REDIRECT[invitation.type] ?? "/";
    redirect(destination);
  } catch (e) {
    // Re-throw redirect errors (Next.js uses thrown responses for redirects)
    if (e && typeof e === "object" && "digest" in e) throw e;
    // Table may not exist yet — redirect home
    redirect("/");
  }
}
