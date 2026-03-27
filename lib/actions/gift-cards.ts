"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { preferenceClient } from "@/lib/mercadopago";
import { normalizeGiftCardCode } from "@/lib/gift-cards";

const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 500000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function purchaseGiftCard(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "Debes iniciar sesión para comprar una Gift Card" };
  }

  const amount = parseInt(formData.get("amount") as string, 10);
  const recipientEmail = (formData.get("recipientEmail") as string)?.trim();
  const recipientName = (formData.get("recipientName") as string)?.trim() || null;
  const rawMessage = (formData.get("message") as string)?.trim() || null;
  const message = rawMessage ? rawMessage.replace(/<[^>]*>/g, "").slice(0, 200) : null;

  if (!amount || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return { error: `El monto debe estar entre $${MIN_AMOUNT.toLocaleString("es-CL")} y $${MAX_AMOUNT.toLocaleString("es-CL")}` };
  }

  if (!recipientEmail || !isValidEmail(recipientEmail)) {
    return { error: "Email del destinatario no válido" };
  }

  // Create a temporary ID for the external_reference
  const tempId = `gc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const useSandbox = process.env.MP_SANDBOX !== "false";

    // Store gift card data in metadata for the webhook to use
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: tempId,
            title: `Gift Card Casa Orfebre — $${amount.toLocaleString("es-CL")}`,
            quantity: 1,
            unit_price: amount,
            currency_id: "CLP" as const,
          },
        ],
        payer: { email: session.user.email },
        back_urls: {
          success: `${appUrl}/gift-cards/success?tempId=${tempId}`,
          failure: `${appUrl}/gift-cards?error=payment_failed`,
          pending: `${appUrl}/gift-cards/success?tempId=${tempId}`,
        },
        auto_return: "approved",
        external_reference: `giftcard_${tempId}`,
        notification_url: `${appUrl}/api/mercadopago/webhook`,
        metadata: {
          type: "giftcard",
          purchaserId: session.user.id,
          purchaserEmail: session.user.email,
          purchaserName: session.user.name || "Alguien especial",
          recipientEmail,
          recipientName,
          message,
          amount,
        },
      },
    });

    const redirectUrl = useSandbox
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point;

    return { success: true, redirectUrl };
  } catch (error) {
    console.error("Gift card MP preference error:", error);
    return { error: "Error al crear el pago. Intenta nuevamente." };
  }
}

export async function validateGiftCard(code: string) {
  const normalized = normalizeGiftCardCode(code);

  if (normalized.length !== 16) {
    return { valid: false as const, error: "Código inválido" };
  }

  const giftCard = await prisma.giftCard.findUnique({
    where: { code: normalized },
  });

  if (!giftCard) {
    return { valid: false as const, error: "Gift Card no encontrada" };
  }

  if (giftCard.status === "REDEEMED") {
    return { valid: false as const, error: "Esta Gift Card ya fue utilizada completamente" };
  }

  if (giftCard.status === "CANCELLED") {
    return { valid: false as const, error: "Esta Gift Card fue cancelada" };
  }

  if (giftCard.status === "EXPIRED" || giftCard.expiresAt < new Date()) {
    return { valid: false as const, error: "Esta Gift Card ha expirado" };
  }

  if (giftCard.balance <= 0) {
    return { valid: false as const, error: "Esta Gift Card no tiene saldo disponible" };
  }

  return {
    valid: true as const,
    balance: giftCard.balance,
    code: normalized,
  };
}

export async function getGiftCardByTempId(tempId: string) {
  const giftCard = await prisma.giftCard.findFirst({
    where: {
      order: {
        orderNumber: { contains: tempId.slice(0, 10) },
      },
    },
  });

  // Fallback: search by recent gift cards for this temp reference
  if (!giftCard) {
    // The tempId is stored as part of the external_reference in MP
    // After webhook processes, we can find the gift card by looking at recent ones
    return null;
  }

  return giftCard;
}

export async function getGiftCardSuccess(code: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const giftCard = await prisma.giftCard.findFirst({
    where: {
      code,
      purchaserId: session.user.id,
    },
    select: {
      code: true,
      amount: true,
      recipientEmail: true,
      recipientName: true,
      message: true,
      expiresAt: true,
    },
  });

  return giftCard;
}

export async function cancelGiftCard(giftCardId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // Only admins can cancel
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") return { error: "No autorizado" };

  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });

  if (!giftCard) return { error: "Gift Card no encontrada" };
  if (giftCard.status === "CANCELLED") return { error: "Ya está cancelada" };

  await prisma.giftCard.update({
    where: { id: giftCardId },
    data: { status: "CANCELLED" },
  });

  return { success: true };
}
