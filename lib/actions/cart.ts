"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addToCart(productId: string, quantity = 1) {
  const session = await auth();
  if (!session?.user) return { error: "Inicia sesión para agregar al carrito" };

  const product = await prisma.product.findUnique({
    where: { id: productId, status: "APPROVED" },
  });
  if (!product) return { error: "Producto no disponible" };
  if (product.stock < quantity) return { error: "Stock insuficiente" };

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });

  if (existing) {
    if (product.isUnique)
      return { error: "Esta pieza única ya está en tu carrito" };
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) return { error: "Stock insuficiente" };
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { userId: session.user.id, productId, quantity },
    });
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId: session.user.id },
    include: { product: { select: { stock: true } } },
  });
  if (!item) return { error: "Item no encontrado" };
  if (quantity < 1 || quantity > item.product.stock)
    return { error: "Cantidad no válida" };

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
  revalidatePath("/");
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, userId: session.user.id },
  });
  revalidatePath("/");
  return { success: true };
}

export async function clearCart() {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
  revalidatePath("/");
  return { success: true };
}
