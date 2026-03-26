import { prisma } from "@/lib/prisma";
import type { FulfillmentStatus } from "@prisma/client";

export async function getArtisanOrders(artisanId: string, status?: FulfillmentStatus) {
  return prisma.orderItem.findMany({
    where: {
      artisanId,
      ...(status ? { fulfillmentStatus: status } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { orderNumber: true, createdAt: true } },
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
          // NEVER include user email or phone
        },
      },
      product: { select: { name: true, slug: true } },
    },
  });
}
