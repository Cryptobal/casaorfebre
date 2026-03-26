"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { DisputeReason } from "@prisma/client";
import { sendDisputeOpenedEmail } from "@/lib/emails/templates";

export async function createDispute(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const orderId = formData.get("orderId") as string;
  const reason = formData.get("reason") as DisputeReason;
  const description = formData.get("description") as string;
  const imageUrls = JSON.parse((formData.get("imageUrls") as string) || "[]");

  if (!orderId || !reason || !description?.trim()) {
    return { error: "Todos los campos son requeridos" };
  }

  // Verify order belongs to user
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { items: true, disputes: { where: { status: { not: "CLOSED" } } } },
  });
  if (!order) return { error: "Pedido no encontrado" };
  if (order.disputes.length > 0) return { error: "Ya existe una disputa abierta para este pedido" };

  // Check within 14 days of any delivered item
  const deliveredItem = order.items.find((i: any) => i.fulfillmentStatus === "DELIVERED" && i.deliveredAt);
  if (deliveredItem?.deliveredAt) {
    const daysSince = (Date.now() - deliveredItem.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 14) return { error: "El plazo para abrir una disputa ha expirado (14 días)" };
  }

  await prisma.dispute.create({
    data: {
      orderId,
      userId: session.user.id,
      reason,
      description: description.trim(),
      images: imageUrls,
      status: "OPEN",
    },
  });

  // Send dispute notification to each artisan involved in the order
  const artisanIds = [...new Set(order.items.map((i: any) => i.artisanId))];
  for (const artisanId of artisanIds) {
    const artisan = await prisma.artisan.findUnique({
      where: { id: artisanId },
      include: { user: { select: { email: true } } },
    });
    if (artisan?.user?.email) {
      try {
        await sendDisputeOpenedEmail(artisan.user.email, {
          artisanName: artisan.displayName,
          orderNumber: order.orderNumber,
          reason: description.trim(),
        });
      } catch (e) {
        console.error("Email failed:", e);
      }
    }
  }

  revalidatePath(`/portal/comprador/pedidos/${orderId}`);
  return { success: true };
}
