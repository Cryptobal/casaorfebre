import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Find old PENDING_PAYMENT orders (ghost orders from abandoned checkouts)
  const staleOrders = await prisma.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      createdAt: { lt: fortyEightHoursAgo },
    },
    select: { id: true, orderNumber: true },
  });

  let deleted = 0;

  for (const order of staleOrders) {
    // Delete order items first, then the order
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    console.log(`[cleanup] Deleted stale order ${order.orderNumber}`);
    deleted++;
  }

  return NextResponse.json({ success: true, deleted });
}
