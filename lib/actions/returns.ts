"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ReturnReason } from "@prisma/client";
import {
  sendReturnRequestedEmail,
  sendReturnRequestedAdminEmail,
} from "@/lib/emails/templates";
import { getAdminEmails } from "@/lib/config";

const REASON_LABELS: Record<string, string> = {
  NOT_AS_DESCRIBED: "No coincide con la descripción",
  DAMAGED_ON_ARRIVAL: "Llegó dañado",
  WRONG_ITEM: "Producto equivocado",
  BUYER_REGRET: "Arrepentimiento",
  DEFECTIVE: "Defecto de fabricación",
  OTHER: "Otro",
};

export async function createReturnRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const orderItemId = formData.get("orderItemId") as string;
  const reason = formData.get("reason") as ReturnReason;
  const description = (formData.get("description") as string) || null;
  const imageUrls = JSON.parse((formData.get("imageUrls") as string) || "[]");

  if (!orderItemId || !reason) return { error: "Razón es requerida" };

  // Verify ownership and eligibility
  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, order: { userId: session.user.id } },
    include: { product: { select: { productionType: true } }, order: true },
  });
  if (!item) return { error: "Pedido no encontrado" };
  if (item.product.productionType === "MADE_TO_ORDER") return { error: "Las piezas hechas por encargo no admiten devolución" };
  if (item.fulfillmentStatus !== "DELIVERED") return { error: "El producto debe estar entregado" };
  if (item.deliveredAt) {
    const daysSince = (Date.now() - item.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 14) return { error: "El plazo para solicitar devolución ha expirado (14 días)" };
  }

  // Check for existing active return request
  const existingReturn = await prisma.returnRequest.findFirst({
    where: {
      orderItemId,
      status: { notIn: ["CANCELLED", "REJECTED", "CLOSED"] },
    },
  });
  if (existingReturn) return { error: "Ya existe una solicitud de devolución activa para este producto" };

  const shippingPaidBy = reason === "BUYER_REGRET" ? "BUYER" : "PLATFORM";

  await prisma.returnRequest.create({
    data: {
      orderItemId,
      userId: session.user.id,
      reason,
      description: description?.trim() || null,
      images: imageUrls,
      shippingPaidBy,
      status: "REQUESTED",
    },
  });

  const reasonLabel = REASON_LABELS[reason] ?? reason;

  // Send notification to artisan
  const artisan = await prisma.artisan.findUnique({
    where: { id: item.artisanId },
    include: { user: { select: { email: true } } },
  });
  if (artisan?.user?.email) {
    try {
      await sendReturnRequestedEmail(artisan.user.email, {
        name: artisan.displayName,
        productName: item.productName,
        reason: description?.trim() || reasonLabel,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  // Send notification to admins
  const buyerName = session.user.name || "Comprador";
  const adminEmails = getAdminEmails();
  for (const adminEmail of adminEmails) {
    try {
      await sendReturnRequestedAdminEmail(adminEmail, {
        productName: item.productName,
        buyerName,
        artisanName: artisan?.displayName || "Orfebre",
        reason: reasonLabel,
        description: description?.trim() || null,
      });
    } catch (e) {
      console.error("[createReturnRequest] Admin email failed:", e);
    }
  }

  // Auto-open conversation with artisan and send system message
  try {
    const conversation = await prisma.conversation.upsert({
      where: {
        buyerId_artisanId: {
          buyerId: session.user.id,
          artisanId: item.artisanId,
        },
      },
      update: { lastMessageAt: new Date() },
      create: {
        buyerId: session.user.id,
        artisanId: item.artisanId,
        productId: item.productId,
      },
    });

    const descText = description?.trim()
      ? `\n\nDescripción: ${description.trim()}`
      : "";
    const photosText = imageUrls.length > 0
      ? `\n\n${imageUrls.length} foto(s) adjuntada(s) como evidencia.`
      : "";

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        senderRole: "BUYER",
        content: `He solicitado una devolución para "${item.productName}".\n\nMotivo: ${reasonLabel}${descText}${photosText}\n\nPuedes responder aquí si necesitas más información.`,
      },
    });
  } catch (e) {
    console.error("[createReturnRequest] Conversation auto-open failed:", e);
  }

  revalidatePath(`/portal/comprador/pedidos/${item.order.id}`);
  revalidatePath("/portal/orfebre/mensajes");
  return { success: true };
}

export async function cancelReturnRequest(returnRequestId: string) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: { orderItem: { include: { order: true } } },
  });

  if (!returnRequest) return { error: "Solicitud no encontrada" };
  if (returnRequest.userId !== session.user.id) return { error: "No autorizado" };
  if (returnRequest.status !== "REQUESTED") {
    return { error: "Solo puedes cancelar solicitudes pendientes" };
  }

  await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: { status: "CANCELLED", resolvedAt: new Date() },
  });

  revalidatePath(`/portal/comprador/pedidos/${returnRequest.orderItem.order.id}`);
  revalidatePath("/portal/admin/devoluciones");
  return { success: true };
}
