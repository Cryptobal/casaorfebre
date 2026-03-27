"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendCertificateEmail,
} from "@/lib/emails/templates";
import { createCertificate } from "@/lib/certificates";

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

export async function markAsDelivered(orderItemId: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  // Allow admin or artisan who owns the item
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: { include: { user: { select: { email: true, name: true } } } },
    },
  });
  if (!item) return { error: "Pedido no encontrado" };

  // Verify: admin or artisan owner
  const isAdmin = session.user.role === "ADMIN";
  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });
  const isOwner = artisan?.id === item.artisanId;
  if (!isAdmin && !isOwner) return { error: "No autorizado" };

  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { fulfillmentStatus: "DELIVERED", deliveredAt: new Date() },
  });

  // Auto-create certificate
  let cert: Awaited<ReturnType<typeof createCertificate>> = null;
  try {
    cert = await createCertificate(orderItemId);
  } catch (e) {
    console.error("Certificate creation failed:", e);
  }

  // Send delivery email
  if (item.order.user?.email) {
    const buyerEmail = item.order.user.email;
    const buyerName = item.order.user.name || "Cliente";

    try {
      await sendOrderDeliveredEmail(buyerEmail, {
        name: buyerName,
        orderNumber: item.order.orderNumber,
      });
    } catch (e) {
      console.error("Delivery email failed:", e);
    }

    // Send certificate email
    if (cert) {
      try {
        const issuedDate = cert.issuedAt.toLocaleDateString("es-CL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const product = await prisma.product.findUnique({
          where: { id: cert.productId },
          select: { name: true },
        });
        await sendCertificateEmail(buyerEmail, {
          buyerName,
          productName: product?.name || "Pieza artesanal",
          certCode: cert.code,
          materials: cert.materials,
          technique: cert.technique,
          artisanName: cert.artisanName,
          issuedDate,
        });
      } catch (e) {
        console.error("Certificate email failed:", e);
      }
    }
  }

  revalidatePath("/portal/orfebre/pedidos");
  revalidatePath("/portal/admin/pedidos");
  return { success: true };
}
