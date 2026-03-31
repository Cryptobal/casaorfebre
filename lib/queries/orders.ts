import { prisma } from "@/lib/prisma";
import type { FulfillmentStatus } from "@prisma/client";

/** Ítems de pedido que aún no han sido despachados (para KPI, alertas y badges del portal). */
export async function getArtisanPendingFulfillmentCount(artisanId: string) {
  return prisma.orderItem.count({
    where: {
      artisanId,
      fulfillmentStatus: { in: ["PENDING", "PREPARING"] },
    },
  });
}

export async function getArtisanOrders(artisanId: string, status?: FulfillmentStatus) {
  return prisma.orderItem.findMany({
    where: {
      artisanId,
      order: { status: { not: "PENDING_PAYMENT" } },
      ...(status ? { fulfillmentStatus: status } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { orderNumber: true, createdAt: true, status: true } },
      product: { select: { name: true, slug: true } },
    },
  });
}

export async function getArtisanOrderDetail(orderItemId: string, artisanId: string) {
  return prisma.orderItem.findFirst({
    where: { id: orderItemId, artisanId },
    include: {
      order: {
        select: {
          orderNumber: true,
          shippingName: true,
          shippingAddress: true,
          shippingCity: true,
          shippingRegion: true,
          shippingPostalCode: true,
          shippingCountry: true,
          createdAt: true,
          isGift: true,
          giftMessage: true,
          giftWrapping: true,
          // NEVER include user email or phone
        },
      },
      product: { select: { name: true, slug: true } },
    },
  });
}
