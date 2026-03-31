import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReceiptReminderEmail } from "@/lib/emails/templates";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

  // Find shipped items between 7-8 days ago with no receipt confirmation
  const eligibleItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: "SHIPPED",
      receivedAt: null,
      autoReceivedAt: null,
      shippedAt: {
        gte: eightDaysAgo,
        lt: sevenDaysAgo,
      },
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          userId: true,
        },
      },
    },
  });

  // Group items by order to send one email per order
  const byOrder = new Map<
    string,
    { orderId: string; orderNumber: string; userId: string; productNames: string[] }
  >();

  for (const item of eligibleItems) {
    const existing = byOrder.get(item.order.id);
    if (existing) {
      existing.productNames.push(item.productName);
    } else {
      byOrder.set(item.order.id, {
        orderId: item.order.id,
        orderNumber: item.order.orderNumber,
        userId: item.order.userId,
        productNames: [item.productName],
      });
    }
  }

  let sent = 0;

  for (const orderGroup of byOrder.values()) {
    try {
      const buyer = await prisma.user.findUnique({
        where: { id: orderGroup.userId },
        select: { email: true, name: true },
      });
      if (buyer?.email) {
        await sendReceiptReminderEmail(buyer.email, {
          buyerName: buyer.name || "Cliente",
          orderNumber: orderGroup.orderNumber,
          orderId: orderGroup.orderId,
          productNames: orderGroup.productNames,
        });
        sent++;
      }
    } catch (e) {
      console.error(`[receipt-reminders] Email failed for order ${orderGroup.orderId}:`, e);
    }
  }

  return NextResponse.json({ success: true, sent });
}
