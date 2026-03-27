import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewReminderEmail } from "@/lib/emails/templates";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

  // Find items delivered ~7 days ago (window: 7–8 days) with no review yet
  const deliveredItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: "DELIVERED",
      deliveredAt: { gte: eightDaysAgo, lte: sevenDaysAgo },
    },
    include: {
      order: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            where: { position: 0 },
            select: { url: true },
            take: 1,
          },
        },
      },
    },
  });

  let remindersSent = 0;

  for (const item of deliveredItems) {
    const user = item.order.user;
    if (!user?.email) continue;

    // Skip if buyer already left a review for this product
    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId: item.product.id } },
    });
    if (existingReview) continue;

    try {
      await sendReviewReminderEmail(user.email, {
        buyerName: user.name || "Cliente",
        productName: item.product.name,
        productSlug: item.product.slug,
        productImageUrl: item.product.images[0]?.url ?? null,
      });
      remindersSent++;
    } catch (e) {
      console.error(`Review reminder failed for product ${item.product.name}:`, e);
    }
  }

  return NextResponse.json({
    success: true,
    remindersSent,
    deliveredItems: deliveredItems.length,
  });
}
