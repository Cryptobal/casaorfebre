import { prisma } from "@/lib/prisma";

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        include: {
          artisan: { select: { displayName: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  });
  return items;
}

export async function getCartCount(userId: string) {
  return prisma.cartItem.count({ where: { userId } });
}

export async function getCartTotal(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { select: { price: true } } },
  });
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
}
