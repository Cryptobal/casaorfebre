import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendShipmentAlertEmail } from "@/lib/emails/templates";
import { getAdminEmails } from "@/lib/config";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // Find PENDING or PREPARING order items older than 3 days that haven't shipped
  const pendingItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: { in: ["PENDING", "PREPARING"] },
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
  const adminEmails = getAdminEmails();

  for (const item of pendingItems) {
    const daysSince = Math.floor(
      (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60 * 1000)
    );

    // Alert artisan
    if (item.artisan.user?.email) {
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
    }

    // Alert admins from day 3+ (not 5)
    for (const adminEmail of adminEmails) {
      try {
        await sendShipmentAlertEmail(adminEmail, {
          artisanName: `[Admin] ${item.artisan.displayName}${daysSince >= 5 ? " - URGENTE" : ""}`,
          orderNumber: item.order.orderNumber,
          orderId: item.order.id,
          daysSince,
        });
      } catch (e) {
        console.error("Admin alert email failed:", e);
      }
    }
  }

  return NextResponse.json({
    success: true,
    alertsSent,
    pendingItems: pendingItems.length,
  });
}
