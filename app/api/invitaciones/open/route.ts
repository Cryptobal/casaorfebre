import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (token) {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { token },
      });

      if (invitation && (invitation.status === "SENT")) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { openedAt: new Date(), status: "OPENED" },
        });

        if (invitation.campaignId) {
          await prisma.invitationCampaign.update({
            where: { id: invitation.campaignId },
            data: { totalOpened: { increment: 1 } },
          });
        }
      }
    } catch {
      // Silently fail — never break email rendering
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
