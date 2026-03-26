"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReview(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const productId = formData.get("productId") as string;
  const artisanId = formData.get("artisanId") as string;
  const orderId = formData.get("orderId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;
  const imageUrls = JSON.parse((formData.get("imageUrls") as string) || "[]");

  if (!productId || !artisanId || !rating || !comment?.trim()) {
    return { error: "Todos los campos son requeridos" };
  }
  if (rating < 1 || rating > 5) return { error: "Rating debe ser entre 1 y 5" };

  // Verify purchase: user has a delivered OrderItem for this product
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      order: { userId: session.user.id },
      productId,
      fulfillmentStatus: "DELIVERED",
    },
  });
  if (!orderItem) return { error: "Solo puedes dejar opinión sobre productos que compraste y recibiste" };

  // Check 3+ days since delivery
  if (orderItem.deliveredAt) {
    const daysSince = (Date.now() - orderItem.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 3) return { error: "Podrás dejar tu opinión 3 días después de la entrega" };
  }

  // Check no existing review
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });
  if (existing) return { error: "Ya dejaste una opinión sobre este producto" };

  // TODO Phase 7: Apply contact-filter.ts to comment before saving

  await prisma.review.create({
    data: {
      productId,
      artisanId,
      userId: session.user.id,
      orderId,
      rating,
      comment: comment.trim(),
      images: imageUrls,
      isVerified: true,
    },
  });

  // Update artisan rating
  const reviews = await prisma.review.aggregate({
    where: { artisanId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.artisan.update({
    where: { id: artisanId },
    data: {
      rating: reviews._avg.rating || 0,
      reviewCount: reviews._count,
    },
  });

  revalidatePath(`/portal/comprador/pedidos`);
  revalidatePath(`/coleccion`);
  return { success: true };
}
