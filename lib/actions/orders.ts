"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  sendOrderPreparingEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendCertificateEmail,
} from "@/lib/emails/templates";
import { createCertificate } from "@/lib/certificates";

const ADMIN_EMAILS = ["carlos.irigoyen@gmail.com", "camilatorrespuga@gmail.com"];

export async function confirmPreparation(orderItemId: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, artisanId: artisan.id, fulfillmentStatus: "PENDING" },
    include: {
      order: { select: { orderNumber: true, userId: true } },
    },
  });
  if (!item) return { error: "Pedido no encontrado" };

  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { fulfillmentStatus: "PREPARING" },
  });

  // Send email notification to buyer + admins
  after(async () => {
    try {
      const buyer = await prisma.user.findUnique({
        where: { id: item.order.userId },
        select: { email: true, name: true },
      });
      const emailData = {
        name: buyer?.name || "Cliente",
        orderNumber: item.order.orderNumber,
        productName: item.productName,
        artisanName: artisan.displayName,
      };
      if (buyer?.email) {
        await sendOrderPreparingEmail(buyer.email, emailData);
      }
      for (const adminEmail of ADMIN_EMAILS) {
        await sendOrderPreparingEmail(adminEmail, { ...emailData, name: `[Admin] ${emailData.name}` });
      }
    } catch (e) {
      console.error("[confirmPreparation] Email failed:", e);
    }
  });

  revalidatePath("/portal/orfebre/pedidos");
  revalidatePath("/portal/comprador/pedidos");
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

  const shippedAt = new Date();
  const updatedItem = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      fulfillmentStatus: "SHIPPED",
      trackingNumber,
      trackingCarrier,
      shippedAt,
    },
    include: {
      order: {
        include: { user: { select: { email: true, name: true } } },
      },
      product: {
        select: {
          name: true,
          images: { where: { position: 0 }, select: { url: true }, take: 1 },
        },
      },
    },
  });

  const buyerEmail = updatedItem.order.user.email;

  const shippedEmailData = {
    name: updatedItem.order.user.name || "Cliente",
    orderNumber: updatedItem.order.orderNumber,
    trackingNumber,
    trackingCarrier,
    shippedAt,
    items: [{
      name: updatedItem.product.name,
      imageUrl: updatedItem.product.images[0]?.url ?? null,
      quantity: updatedItem.quantity,
    }],
  };

  after(async () => {
    try {
      if (buyerEmail) {
        await sendOrderShippedEmail(buyerEmail, shippedEmailData);
      }
      for (const adminEmail of ADMIN_EMAILS) {
        await sendOrderShippedEmail(adminEmail, { ...shippedEmailData, name: `[Admin] ${shippedEmailData.name}` });
      }
    } catch (e) {
      console.error("Email failed:", e);
    }
  });

  revalidatePath("/portal/orfebre/pedidos");
  revalidatePath("/portal/comprador/pedidos");
  revalidatePath("/portal/admin/pedidos");
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
      product: {
        select: {
          name: true,
          slug: true,
          images: { where: { position: 0 }, select: { url: true }, take: 1 },
        },
      },
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

  // Send delivery + certificate emails in the background
  const buyerEmail = item.order.user?.email;
  const buyerName = item.order.user?.name || "Cliente";
  const orderNumber = item.order.orderNumber;
  const certSnapshot = cert;
  const deliveredEmailData = {
    name: buyerName,
    orderNumber,
    items: [{
      name: item.product.name,
      slug: item.product.slug,
      imageUrl: item.product.images[0]?.url ?? null,
      quantity: item.quantity,
    }],
  };

  after(async () => {
    try {
      if (buyerEmail) {
        await sendOrderDeliveredEmail(buyerEmail, deliveredEmailData);
      }
      for (const adminEmail of ADMIN_EMAILS) {
        await sendOrderDeliveredEmail(adminEmail, { ...deliveredEmailData, name: `[Admin] ${buyerName}` });
      }
    } catch (e) {
      console.error("Delivery email failed:", e);
    }

    if (certSnapshot && buyerEmail) {
      try {
        const issuedDate = certSnapshot.issuedAt.toLocaleDateString("es-CL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        await sendCertificateEmail(buyerEmail, {
          buyerName,
          productName: item.product.name,
          certCode: certSnapshot.code,
          materials: certSnapshot.materials,
          technique: certSnapshot.technique,
          artisanName: certSnapshot.artisanName,
          issuedDate,
        });
      } catch (e) {
        console.error("Certificate email failed:", e);
      }
    }
  });

  revalidatePath("/portal/orfebre/pedidos");
  revalidatePath("/portal/comprador/pedidos");
  revalidatePath("/portal/admin/pedidos");
  return { success: true };
}
