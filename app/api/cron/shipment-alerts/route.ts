import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendShipmentAlertEmail } from "@/lib/emails/templates";

export async function GET(request: Request) {
  // Verify Vercel Cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Find pending order items older than 3 days
  const pendingItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: "PENDING",
      order: { status: "PAID" },
      createdAt: { lt: threeDaysAgo },
    },
    include: {
      artisan: {
        include: { user: { select: { email: true } } },
      },
      order: { select: { orderNumber: true, id: true } },
    },
  });

  let alertsSent = 0;

  for (const item of pendingItems) {
    const daysSince = Math.floor(
      (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (!item.artisan.user?.email) continue;

    try {
      await sendShipmentAlertEmail(item.artisan.user.email, {
        artisanName: item.artisan.displayName,
        orderNumber: item.order.orderNumber,
        orderId: item.order.id,
        daysSince,
      });
      alertsSent++;
    } catch (e) {
      console.error(`Shipment alert email failed for order ${item.order.orderNumber}:`, e);
    }

    // If > 5 days, also notify admin
    if (daysSince >= 5) {
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });
      for (const admin of adminUsers) {
        try {
          await sendShipmentAlertEmail(admin.email, {
            artisanName: `URGENTE - ${item.artisan.displayName}`,
            orderNumber: item.order.orderNumber,
            orderId: item.order.id,
            daysSince,
          });
        } catch (e) {
          console.error("Admin alert email failed:", e);
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    alertsSent,
    pendingItems: pendingItems.length,
  });
}
