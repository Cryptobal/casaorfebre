"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderShippedEmail } from "@/lib/emails/templates";

export async function confirmPreparation(orderItemId: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, artisanId: artisan.id, fulfillmentStatus: "PENDING" },
  });
  if (!item) return { error: "Pedido no encontrado" };

  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { fulfillmentStatus: "PREPARING" },
  });

  revalidatePath("/portal/orfebre/pedidos");
  return { success: true };
}

export async function markAsShipped(orderItemId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  const trackingNumber = formData.get("trackingNumber") as string;
  const trackingCarrier = formData.get("trackingCarrier") as string;

  if (!trackingNumber || !trackingCarrier) return { error: "Numero de tracking y courier son requeridos" };

  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, artisanId: artisan.id, fulfillmentStatus: "PREPARING" },
  });
  if (!item) return { error: "Pedido no encontrado" };

  const updatedItem = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      fulfillmentStatus: "SHIPPED",
      trackingNumber,
      trackingCarrier,
      shippedAt: new Date(),
    },
    include: {
      order: {
        include: { user: { select: { email: true, name: true } } },
      },
    },
  });

  if (updatedItem.order.user.email) {
    try {
      await sendOrderShippedEmail(updatedItem.order.user.email, {
        name: updatedItem.order.user.name || "Cliente",
        orderNumber: updatedItem.order.orderNumber,
        trackingNumber,
        trackingCarrier,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath("/portal/orfebre/pedidos");
  return { success: true };
}
