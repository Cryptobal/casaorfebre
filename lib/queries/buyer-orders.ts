import { prisma } from "@/lib/prisma";

export async function getBuyerOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, productionType: true } },
          artisan: { select: { displayName: true } },
        },
      },
    },
  });
}

export async function getBuyerOrderDetail(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, productionType: true, images: { take: 1, orderBy: { position: "asc" } } },
          },
          artisan: { select: { displayName: true, slug: true } },
        },
      },
      disputes: { select: { id: true, status: true } },
    },
  });
}

// Check existing reviews for a user
export async function getUserReviewsForOrder(userId: string, productIds: string[]) {
  const reviews = await prisma.review.findMany({
    where: { userId, productId: { in: productIds } },
    select: { productId: true },
  });
  return new Set(reviews.map(r => r.productId));
}

// Check existing return requests for order items
export async function getReturnRequestsForItems(orderItemIds: string[]) {
  const returns = await prisma.returnRequest.findMany({
    where: { orderItemId: { in: orderItemIds } },
    select: { orderItemId: true, status: true },
  });
  return new Map(returns.map(r => [r.orderItemId, r.status]));
}
