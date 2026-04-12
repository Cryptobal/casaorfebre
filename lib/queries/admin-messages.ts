import { prisma } from "@/lib/prisma";

export async function getOrderItemsWithMessages() {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      messages: { some: {} },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      order: {
        select: {
          orderNumber: true,
          shippingName: true,
          user: { select: { name: true, email: true } },
        },
      },
      artisan: {
        select: { displayName: true },
      },
      product: {
        select: { name: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: { select: { name: true } },
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  return orderItems;
}

export async function getOrderItemMessages(orderItemId: string) {
  return prisma.orderMessage.findMany({
    where: { orderItemId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { name: true, image: true } },
    },
  });
}
