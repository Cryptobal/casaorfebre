import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPayoutReleasedEmail } from "@/lib/emails/templates";

export async function GET(request: Request) {
  // Verify Vercel Cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Find delivered items with HELD payout and delivered > 14 days ago, with no open disputes
  const eligibleItems = await prisma.orderItem.findMany({
    where: {
      payoutStatus: "HELD",
      fulfillmentStatus: "DELIVERED",
      deliveredAt: { lt: fourteenDaysAgo },
      order: {
        disputes: {
          none: {
            status: { in: ["OPEN", "UNDER_REVIEW"] },
          },
        },
      },
    },
    include: {
      artisan: {
        include: { user: { select: { email: true } } },
      },
      order: { select: { orderNumber: true } },
    },
  });

  let released = 0;

  for (const item of eligibleItems) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        payoutStatus: "RELEASED",
        payoutAt: now,
      },
    });

    if (item.artisan.user?.email) {
      try {
        await sendPayoutReleasedEmail(item.artisan.user.email, {
          artisanName: item.artisan.displayName,
          amount: item.artisanPayout,
        });
      } catch (e) {
        console.error(`Payout email failed for order ${item.order.orderNumber}:`, e);
      }
    }

    released++;
  }

  return NextResponse.json({
    success: true,
    released,
    eligible: eligibleItems.length,
  });
}
