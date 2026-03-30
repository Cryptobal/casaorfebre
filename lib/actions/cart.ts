"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { GuestCartLine } from "@/lib/guest-cart";

async function mergeGuestLinesIntoUserCart(userId: string, lines: GuestCartLine[]) {
  if (lines.length === 0) return;

  const merged = new Map<string, number>();
  for (const l of lines) {
    merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.quantity);
  }

  for (const [productId, rawQty] of merged) {
    const product = await prisma.product.findUnique({
      where: { id: productId, status: "APPROVED" },
    });
    if (!product) continue;

    let qtyToAdd = Math.min(rawQty, product.stock);
    if (product.productionType === "UNIQUE") qtyToAdd = Math.min(qtyToAdd, 1);
    if (product.productionType === "MADE_TO_ORDER") qtyToAdd = 1;
    if (qtyToAdd < 1 && product.productionType !== "MADE_TO_ORDER") continue;
    if (product.productionType === "MADE_TO_ORDER") qtyToAdd = 1;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId_size: { userId, productId, size: "" } },
    });

    if (existing) {
      if (product.productionType === "UNIQUE") continue;
      const newQty = product.productionType === "MADE_TO_ORDER" ? 1 : Math.min(existing.quantity + qtyToAdd, product.stock);
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, productId, quantity: qtyToAdd },
      });
    }
  }
}

/** Migra el carrito local del invitado al usuario recién autenticado. */
export async function mergeGuestCartAfterLogin(lines: GuestCartLine[]) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" as const };

  await mergeGuestLinesIntoUserCart(session.user.id, lines);
  revalidatePath("/");
  return { success: true as const };
}

export async function addToCart(productId: string, quantity = 1, size?: string) {
  const session = await auth();
  if (!session?.user) return { error: "Inicia sesión para agregar al carrito" };

  const product = await prisma.product.findUnique({
    where: { id: productId, status: "APPROVED" },
    include: { variants: true },
  });
  if (!product) return { error: "Producto no disponible" };

  // Validate stock based on production type
  if (product.productionType === "UNIQUE") {
    quantity = 1;
  } else if (product.productionType === "MADE_TO_ORDER") {
    quantity = 1;
  } else {
    // LIMITED
    if (size) {
      const variant = product.variants.find((v) => v.size === size);
      if (!variant || variant.stock < quantity) return { error: "Stock insuficiente para esta talla" };
    } else if (product.stock < quantity) {
      return { error: "Stock insuficiente" };
    }
  }

  const sizeKey = size ?? null;

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId_size: { userId: session.user.id, productId, size: sizeKey ?? "" },
    },
  });

  if (existing) {
    if (product.productionType === "UNIQUE")
      return { error: "Esta pieza única ya está en tu carrito" };
    if (product.productionType === "MADE_TO_ORDER")
      return { error: "Esta pieza ya está en tu carrito" };
    const maxStock = size
      ? (product.variants.find((v) => v.size === size)?.stock ?? product.stock)
      : product.stock;
    const newQty = existing.quantity + quantity;
    if (newQty > maxStock) return { error: "Stock insuficiente" };
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { userId: session.user.id, productId, quantity, size: sizeKey },
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
