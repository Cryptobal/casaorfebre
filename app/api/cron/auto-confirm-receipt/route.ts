import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPayoutDaysForArtisan,
  calculatePayoutEligibleDate,
} from "@/lib/payout-schedule";
import {
  sendAutoConfirmToBuyerEmail,
  sendAutoConfirmToArtisanEmail,
} from "@/lib/emails/templates";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  // Find shipped items older than 10 days with no receipt confirmation and no open dispute
  const eligibleItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: "SHIPPED",
      receivedAt: null,
      shippedAt: { lt: tenDaysAgo },
      order: {
        disputes: {
          none: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
        },
      },
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          userId: true,
          items: { select: { id: true, fulfillmentStatus: true } },
        },
      },
      artisan: {
        include: {
          user: { select: { email: true } },
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: { select: { payoutFrequency: true } } },
            take: 1,
          },
        },
      },
    },
  });

  let confirmed = 0;
  const now = new Date();

  for (const item of eligibleItems) {
    const payoutDays = getPayoutDaysForArtisan(item.artisan);
    const payoutEligibleAt = calculatePayoutEligibleDate(now, payoutDays);

    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        fulfillmentStatus: "DELIVERED",
        autoReceivedAt: now,
        deliveredAt: now,
        payoutEligibleAt,
      },
    });

    // Check if all items in order are delivered
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: item.order.id },
      select: { fulfillmentStatus: true },
    });
    if (allItems.every((i) => i.fulfillmentStatus === "DELIVERED")) {
      await prisma.order.update({
        where: { id: item.order.id },
        data: { status: "DELIVERED" },
      });
    }

    // Send email to buyer
    try {
      const buyer = await prisma.user.findUnique({
        where: { id: item.order.userId },
        select: { email: true, name: true },
      });
      if (buyer?.email) {
        await sendAutoConfirmToBuyerEmail(buyer.email, {
          buyerName: buyer.name || "Cliente",
          orderNumber: item.order.orderNumber,
          orderId: item.order.id,
        });
      }
    } catch (e) {
      console.error(`[auto-confirm] Buyer email failed for item ${item.id}:`, e);
    }

    // Send email to artisan
    try {
      if (item.artisan.user?.email) {
        await sendAutoConfirmToArtisanEmail(item.artisan.user.email, {
          artisanName: item.artisan.displayName,
          productName: item.productName,
          artisanPayout: item.artisanPayout,
          payoutEligibleAt,
        });
      }
    } catch (e) {
      console.error(`[auto-confirm] Artisan email failed for item ${item.id}:`, e);
    }

    confirmed++;
  }

  return NextResponse.json({ success: true, confirmed });
}
