"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createWishlist(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  const wishlist = await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      name,
      code: generateCode(),
    },
  });
  revalidatePath("/portal/comprador/listas");
  return wishlist;
}

export async function addToWishlist(wishlistId: string, productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  const wishlist = await prisma.wishlist.findFirst({
    where: { id: wishlistId, userId: session.user.id },
  });
  if (!wishlist) throw new Error("Lista no encontrada");

  await prisma.wishlistItem.create({
    data: { wishlistId, productId },
  });
  revalidatePath("/portal/comprador/listas");
}

export async function removeFromWishlist(
  wishlistId: string,
  productId: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId,
      productId,
      wishlist: { userId: session.user.id },
    },
  });
  revalidatePath("/portal/comprador/listas");
}

export async function deleteWishlist(wishlistId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  await prisma.wishlist.deleteMany({
    where: { id: wishlistId, userId: session.user.id },
  });
  revalidatePath("/portal/comprador/listas");
}
