"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(productId: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    await prisma.product.update({
      where: { id: productId },
      data: { favoriteCount: { decrement: 1 } },
    });
    // Ensure favoriteCount never goes below 0
    await prisma.product.updateMany({
      where: { id: productId, favoriteCount: { lt: 0 } },
      data: { favoriteCount: 0 },
    });
  } else {
    await prisma.favorite.create({
      data: { userId: session.user.id, productId },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { favoriteCount: { increment: 1 } },
    });
  }

  revalidatePath("/portal/comprador/favoritos");
  revalidatePath("/coleccion");
  revalidatePath("/orfebres");
  revalidatePath("/");
  return { favorited: !existing };
}
