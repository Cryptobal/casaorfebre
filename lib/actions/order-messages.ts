"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkContactInfo, CONTACT_FILTER_MESSAGE } from "@/lib/contact-filter";
import { sendNewOrderMessageEmail } from "@/lib/emails/templates";

// ─── Enviar mensaje ────────────────────────────────────────────
export async function sendOrderMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const orderItemId = formData.get("orderItemId") as string;
  const content = formData.get("content") as string;

  if (!orderItemId || !content?.trim()) {
    return { error: "El mensaje no puede estar vacío" };
  }

  if (content.trim().length > 1000) {
    return { error: "El mensaje no puede exceder 1000 caracteres" };
  }

  // Verificar que el usuario tiene acceso a este orderItem
  let orderItem;
  try {
    orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: { select: { userId: true } },
        artisan: { select: { userId: true } },
      },
    });
  } catch (e) {
    console.error("[sendOrderMessage] DB error fetching orderItem:", e);
    return { error: "Error al procesar el mensaje. Intenta de nuevo." };
  }

  if (!orderItem) return { error: "Pedido no encontrado" };

  const userId = session.user.id;
  const userRole = session.user.role;
  const isArtisan = orderItem.artisan.userId === userId;
  const isBuyer = orderItem.order.userId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isArtisan && !isBuyer && !isAdmin) {
    return { error: "No tienes acceso a este pedido" };
  }

  // Determinar rol del remitente
  let senderRole: "ARTISAN" | "BUYER" | "ADMIN";
  if (isAdmin && !isArtisan && !isBuyer) {
    senderRole = "ADMIN";
  } else if (isArtisan) {
    senderRole = "ARTISAN";
  } else {
    senderRole = "BUYER";
  }

  // Filtro anti-contacto
  const filter = checkContactInfo(content.trim());
  if (!filter.isClean) {
    return { error: CONTACT_FILTER_MESSAGE };
  }

  try {
    await prisma.orderMessage.create({
      data: {
        orderItemId,
        senderId: userId,
        senderRole,
        content: content.trim(),
      },
    });
  } catch (e) {
    console.error("[sendOrderMessage] DB error creating message:", e);
    return { error: "No se pudo enviar el mensaje. Intenta de nuevo." };
  }

  // Notificar al destinatario por email
  try {
    const fullOrderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: { select: { name: true, email: true } },
          },
        },
        artisan: {
          select: {
            displayName: true,
            user: { select: { email: true } },
          },
        },
        product: { select: { name: true } },
      },
    });

    if (fullOrderItem) {
      const senderName = session.user.name || "Usuario";

      if (senderRole === "ARTISAN" || senderRole === "ADMIN") {
        // Notificar al comprador
        const buyerEmail = fullOrderItem.order.user.email;
        if (buyerEmail) {
          await sendNewOrderMessageEmail(buyerEmail, {
            recipientName: fullOrderItem.order.user.name || "Comprador",
            senderName,
            senderRole,
            orderNumber: fullOrderItem.order.orderNumber,
            productName: fullOrderItem.product.name,
            messagePreview: content.trim(),
          });
        }
      }

      if (senderRole === "BUYER" || senderRole === "ADMIN") {
        // Notificar al orfebre
        const artisanEmail = fullOrderItem.artisan.user.email;
        if (artisanEmail) {
          await sendNewOrderMessageEmail(artisanEmail, {
            recipientName: fullOrderItem.artisan.displayName,
            senderName,
            senderRole,
            orderNumber: fullOrderItem.order.orderNumber,
            productName: fullOrderItem.product.name,
            messagePreview: content.trim(),
          });
        }
      }
    }
  } catch (e) {
    console.error("Message notification email failed:", e);
  }

  // Revalidar ambas vistas
  revalidatePath(`/portal/orfebre/pedidos`);
  revalidatePath(`/portal/comprador/pedidos`);
  revalidatePath(`/portal/admin/mensajes`);

  return { success: true };
}

// ─── Obtener mensajes de un orderItem ──────────────────────────
export async function getOrderMessages(orderItemId: string) {
  const session = await auth();
  if (!session?.user) return [];

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: { select: { userId: true } },
      artisan: { select: { userId: true } },
    },
  });

  if (!orderItem) return [];

  const userId = session.user.id;
  const isArtisan = orderItem.artisan.userId === userId;
  const isBuyer = orderItem.order.userId === userId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isArtisan && !isBuyer && !isAdmin) return [];

  const messages = await prisma.orderMessage.findMany({
    where: { orderItemId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { name: true, image: true } },
    },
  });

  // Marcar como leídos los mensajes que NO envió este usuario
  const unreadIds = messages
    .filter((m) => m.senderId !== userId && !m.readAt)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await prisma.orderMessage.updateMany({
      where: { id: { in: unreadIds } },
      data: { readAt: new Date() },
    });
  }

  return messages;
}

// ─── Contar mensajes no leídos para badge ──────────────────────
export async function getUnreadMessageCount(orderItemId: string, userId: string) {
  return prisma.orderMessage.count({
    where: {
      orderItemId,
      senderId: { not: userId },
      readAt: null,
    },
  });
}
