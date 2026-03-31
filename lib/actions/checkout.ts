"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { preferenceClient } from "@/lib/mercadopago";
import { createArtisanPreference } from "@/lib/mercadopago-split";
import { getCart } from "@/lib/queries/cart";
import { validateDiscountCode, markRewardAsUsed } from "@/lib/actions/referral";
import { checkoutLimiter } from "@/lib/rate-limit";
import { normalizeGiftCardCode } from "@/lib/gift-cards";
import { isSandbox } from "@/lib/config";
import { ensureValidToken } from "@/lib/mercadopago-refresh";
import {
  sendPurchaseConfirmationEmail,
  sendNewOrderToArtisanEmail,
} from "@/lib/emails/templates";

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `CO-${year}-${random}`;
}

export async function createCheckoutPreference(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autorizado" };

  // Rate limit: 3 checkout attempts/min per user
  const { success: rlOk } = await checkoutLimiter.limit(session.user.id);
  if (!rlOk) {
    return { error: "Demasiados intentos. Espera un momento antes de reintentar." };
  }

  // Block checkout if email is not verified (credentials users)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, hashedPassword: true },
  });
  if (dbUser?.hashedPassword && !dbUser.emailVerified) {
    return { error: "Debes verificar tu email antes de comprar. Revisa tu bandeja de entrada." };
  }

  const cartItems = await getCart(session.user.id);
  if (cartItems.length === 0) return { error: "Tu carrito está vacío" };

  // Parse shipping data
  const shippingName = formData.get("shippingName") as string;
  const shippingAddress = formData.get("shippingAddress") as string;
  const shippingCity = formData.get("shippingCity") as string;
  const shippingRegion = formData.get("shippingRegion") as string;
  const shippingPostalCode =
    (formData.get("shippingPostalCode") as string) || null;

  if (!shippingName || !shippingAddress || !shippingCity || !shippingRegion) {
    return { error: "Completa todos los campos de envío" };
  }

  // Fetch product + artisan data for commission calculation and split payment
  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map((i: any) => i.productId) } },
    include: {
      artisan: {
        select: {
          id: true,
          commissionRate: true,
          commissionOverride: true,
          mpAccessToken: true,
          mpOnboarded: true,
        },
      },
    },
  });
  const productMap = new Map(products.map((p: any) => [p.id, p]));

  // Validate stock
  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (!product || product.stock < item.quantity) {
      return {
        error: `Stock insuficiente para ${item.product.name}`,
      };
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = 0; // Free for MVP

  // Parse gift options
  const isGift = formData.get("isGift") === "true";
  const rawGiftMessage = (formData.get("giftMessage") as string | null) ?? "";
  // Sanitize: strip HTML tags and cap at 200 chars
  const giftMessage = isGift
    ? rawGiftMessage.replace(/<[^>]*>/g, "").trim().slice(0, 200) || null
    : null;
  const giftWrapping = isGift && formData.get("giftWrapping") === "true";
  // Server-side price (0 for now, ready for future pricing)
  const giftWrappingPrice = giftWrapping ? 0 : 0;

  // Handle discount code
  let discountAmount = 0;
  let discountCodeValue: string | null = null;
  let discountRewardId: string | null = null;
  const rawDiscountCode = formData.get("discountCode") as string | null;
  const rawDiscountRewardId = formData.get("discountRewardId") as string | null;

  if (rawDiscountCode && rawDiscountRewardId) {
    const validation = await validateDiscountCode(rawDiscountCode);
    if (validation.valid && validation.reward) {
      // Ensure the reward belongs to this user
      if (validation.reward.referrerId === session.user.id) {
        discountAmount = Math.min(validation.reward.rewardAmount, subtotal);
        discountCodeValue = rawDiscountCode;
        discountRewardId = validation.reward.id;
      }
    }
  }

  // Handle gift card
  let giftCardDiscount = 0;
  let giftCardCode: string | null = null;
  const rawGiftCardCode = formData.get("giftCardCode") as string | null;

  if (rawGiftCardCode) {
    const normalized = normalizeGiftCardCode(rawGiftCardCode);
    const gc = await prisma.giftCard.findUnique({ where: { code: normalized } });
    if (
      gc &&
      (gc.status === "ACTIVE" || gc.status === "PARTIALLY_USED") &&
      gc.balance > 0 &&
      gc.expiresAt > new Date()
    ) {
      const preGcTotal = subtotal + shippingCost + giftWrappingPrice - discountAmount;
      giftCardDiscount = Math.min(gc.balance, preGcTotal);
      giftCardCode = normalized;
    }
  }

  const total = Math.max(0, subtotal + shippingCost + giftWrappingPrice - discountAmount - giftCardDiscount);

  // Create order as PENDING_PAYMENT
  const orderNumber = generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingRegion,
      shippingPostalCode,
      subtotal,
      shippingCost,
      discountCode: discountCodeValue,
      discountAmount,
      isGift,
      giftMessage,
      giftWrapping,
      giftWrappingPrice,
      giftCardDiscount,
      giftCardCode,
      total,
      status: "PENDING_PAYMENT",
      items: {
        create: cartItems.map((item: any) => {
          const product = productMap.get(item.productId)!;
          const commissionRate = product.artisan?.commissionOverride ?? product.artisan?.commissionRate ?? 0.18;
          const itemTotal = product.price * item.quantity;
          const commissionAmount = Math.round(itemTotal * commissionRate);
          const artisanPayout = itemTotal - commissionAmount;

          return {
            productId: product.id,
            artisanId: product.artisan?.id ?? product.artisanId,
            productName: item.product.name,
            productPrice: product.price,
            quantity: item.quantity,
            commissionRate,
            commissionAmount,
            artisanPayout,
            fulfillmentStatus: "PENDING",
            payoutStatus: "HELD",
          };
        }),
      },
    },
  });

  // Save shipping address to user profile for future pre-fill
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      shippingName,
      shippingAddress,
      shippingCity,
      shippingRegion,
      shippingPostalCode,
    },
  });

  // If gift card covers the full amount, no MP needed — mark as PAID directly
  if (total === 0 && giftCardCode && giftCardDiscount > 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // Destock products
    await Promise.all(
      cartItems.map(async (item: any) => {
        const product = await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        if (product.stock <= 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { status: "SOLD_OUT" },
          });
        }
      })
    );

    // Deduct gift card balance
    const gc = await prisma.giftCard.findUnique({ where: { code: giftCardCode } });
    if (gc) {
      const newBalance = gc.balance - giftCardDiscount;
      await prisma.giftCard.update({
        where: { code: giftCardCode },
        data: {
          balance: newBalance,
          status: newBalance <= 0 ? "REDEEMED" : "PARTIALLY_USED",
          redeemedAt: gc.redeemedAt ?? new Date(),
        },
      });
      await prisma.giftCardUsage.create({
        data: {
          giftCardId: gc.id,
          orderId: order.id,
          amount: giftCardDiscount,
        },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    // Mark referral reward as used
    if (discountRewardId) {
      try { await markRewardAsUsed(discountRewardId, order.id); } catch {}
    }

    // Send emails
    try {
      await sendPurchaseConfirmationEmail(session.user.email, {
        name: session.user.name || "Cliente",
        orderNumber: order.orderNumber,
        items: cartItems.map((i: any) => ({
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
        total: 0,
        isGift,
        giftMessage,
        giftWrapping,
      });
    } catch {}

    const artisanIds = [...new Set(products.map((p: any) => p.artisan?.id).filter(Boolean))];
    const artisans = await prisma.artisan.findMany({
      where: { id: { in: artisanIds as string[] } },
      include: { user: { select: { email: true } } },
    });
    for (const artisan of artisans) {
      if (artisan?.user?.email) {
        try {
          const artisanItems = cartItems.filter(
            (i: any) => productMap.get(i.productId)?.artisan?.id === artisan.id
          );
          await sendNewOrderToArtisanEmail(artisan.user.email, {
            artisanName: artisan.displayName,
            orderNumber: order.orderNumber,
            orderId: order.id,
            items: artisanItems.map((i: any) => ({
              name: i.product.name,
              price: i.product.price,
              quantity: i.quantity,
            })),
            shippingName,
            shippingAddress,
            shippingCity,
            shippingRegion,
            isGift,
            giftMessage,
            giftWrapping,
          });
        } catch {}
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return { success: true, redirectUrl: `${appUrl}/checkout/success` };
  }

  // Determine if we can use split payment (artisan has MP OAuth connected)
  // Split only works for single-artisan carts where the artisan has mpAccessToken
  const artisanIds = [...new Set(products.map((p: any) => p.artisan?.id).filter(Boolean))];
  const isSingleArtisan = artisanIds.length === 1;
  const soleArtisan = isSingleArtisan ? products[0]?.artisan : null;
  // Validate artisan token if split candidate
  let validArtisanToken: string | null = null;
  if (isSingleArtisan && soleArtisan?.mpAccessToken && soleArtisan?.mpOnboarded) {
    validArtisanToken = await ensureValidToken(soleArtisan.id);
    if (!validArtisanToken) {
      console.warn(`[checkout] Artisan token expired/refresh failed for ${soleArtisan.id}, using marketplace fallback`);
    }
  }
  const useSplit = !!validArtisanToken;

  // Create MercadoPago preference
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const useSandbox = isSandbox();

    const items = cartItems.map((item: any) => ({
      id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: "CLP" as const,
    }));

    const backUrls = {
      success: `${appUrl}/checkout/success`,
      failure: `${appUrl}/checkout/failure`,
      pending: `${appUrl}/checkout/success`,
    };

    let redirectUrl: string | undefined;

    if (useSplit) {
      // Split payment: preference created with artisan's token, marketplace_fee goes to us
      const commissionRate = soleArtisan!.commissionOverride ?? soleArtisan!.commissionRate;
      const marketplaceFee = Math.round(total * commissionRate);

      console.log(`[checkout] Split payment — artisan=${artisanIds[0]}, fee=${marketplaceFee} CLP (${Math.round(commissionRate * 100)}%)`);

      const preference = await createArtisanPreference(
        validArtisanToken!,
        {
          items,
          payer: { email: session.user.email },
          back_urls: backUrls,
          auto_return: "approved",
          external_reference: order.id,
          notification_url: `${appUrl}/api/mercadopago/webhook`,
          marketplace_fee: marketplaceFee,
          statement_descriptor: "CASA ORFEBRE",
        }
      );

      redirectUrl = useSandbox
        ? preference.sandbox_init_point || preference.init_point
        : preference.init_point;
    } else {
      // Fallback: marketplace processes the full payment (no split)
      if (artisanIds.length > 1) {
        console.log(`[checkout] Multi-artisan cart (${artisanIds.length} artisans) — using marketplace checkout`);
      } else {
        console.log(`[checkout] Artisan not connected to MP — using marketplace checkout`);
      }

      const preference = await preferenceClient.create({
        body: {
          items,
          payer: { email: session.user.email },
          back_urls: backUrls,
          auto_return: "approved",
          external_reference: order.id,
          notification_url: `${appUrl}/api/mercadopago/webhook`,
          statement_descriptor: "CASA ORFEBRE",
        },
      });

      redirectUrl = useSandbox
        ? preference.sandbox_init_point || preference.init_point
        : preference.init_point;
    }

    console.log(`[checkout] Usando ${useSandbox ? "sandbox_init_point" : "init_point"} (MP_SANDBOX=${process.env.MP_SANDBOX ?? "undefined"})`);

    // Mark referral reward as used (link to order)
    if (discountRewardId) {
      try {
        await markRewardAsUsed(discountRewardId, order.id);
      } catch (e) {
        console.error("Failed to mark reward as used:", e);
      }
    }

    return { success: true, redirectUrl };
  } catch (error) {
    console.error("MercadoPago preference error:", error);
    // Clean up the pending order
    await prisma.order.delete({ where: { id: order.id } });
    return { error: "Error al crear el pago. Intenta nuevamente." };
  }
}

/** Reabre Mercado Pago para un pedido ya creado (pendiente de pago), sin usar el carrito. */
export async function resumeOrderPayment(orderId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autorizado" };

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
      status: "PENDING_PAYMENT",
    },
    include: { items: true },
  });

  if (!order) {
    return { error: "Pedido no encontrado o ya no está pendiente de pago." };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: order.items.map((i) => i.productId) } },
    include: {
      artisan: {
        select: {
          id: true,
          commissionRate: true,
          commissionOverride: true,
          mpAccessToken: true,
          mpOnboarded: true,
        },
      },
    },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of order.items) {
    const product = productMap.get(item.productId);
    if (!product || product.stock < item.quantity) {
      return {
        error: `No hay stock suficiente para "${item.productName}". Contacta al sitio si necesitas ayuda.`,
      };
    }
  }

  // Check if we can use split payment
  const artisanIds = [...new Set(order.items.map((i) => i.artisanId).filter(Boolean))];
  const isSingleArtisan = artisanIds.length === 1;
  const soleArtisan = isSingleArtisan ? products[0]?.artisan : null;

  let validArtisanToken: string | null = null;
  if (isSingleArtisan && soleArtisan?.mpAccessToken && soleArtisan?.mpOnboarded) {
    validArtisanToken = await ensureValidToken(soleArtisan.id);
    if (!validArtisanToken) {
      console.warn(`[checkout:resume] Artisan token expired/refresh failed for ${soleArtisan.id}, using marketplace fallback`);
    }
  }
  const useSplit = !!validArtisanToken;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const useSandbox = isSandbox();

    const items = order.items.map((item) => ({
      id: item.productId,
      title: item.productName,
      quantity: item.quantity,
      unit_price: item.productPrice,
      currency_id: "CLP" as const,
    }));

    const backUrls = {
      success: `${appUrl}/checkout/success`,
      failure: `${appUrl}/checkout/failure`,
      pending: `${appUrl}/checkout/success`,
    };

    let redirectUrl: string | undefined;

    if (useSplit) {
      const commissionRate = soleArtisan!.commissionOverride ?? soleArtisan!.commissionRate;
      const marketplaceFee = Math.round(order.total * commissionRate);

      const preference = await createArtisanPreference(
        validArtisanToken!,
        {
          items,
          payer: { email: session.user.email },
          back_urls: backUrls,
          auto_return: "approved",
          external_reference: order.id,
          notification_url: `${appUrl}/api/mercadopago/webhook`,
          marketplace_fee: marketplaceFee,
          statement_descriptor: "CASA ORFEBRE",
        }
      );

      redirectUrl = useSandbox
        ? preference.sandbox_init_point || preference.init_point
        : preference.init_point;
    } else {
      const preference = await preferenceClient.create({
        body: {
          items,
          payer: { email: session.user.email },
          back_urls: backUrls,
          auto_return: "approved",
          external_reference: order.id,
          notification_url: `${appUrl}/api/mercadopago/webhook`,
          statement_descriptor: "CASA ORFEBRE",
        },
      });

      redirectUrl = useSandbox
        ? preference.sandbox_init_point || preference.init_point
        : preference.init_point;
    }

    console.log(`[checkout:resume] Usando ${useSandbox ? "sandbox_init_point" : "init_point"} (MP_SANDBOX=${process.env.MP_SANDBOX ?? "undefined"})`);

    return { success: true as const, redirectUrl };
  } catch (error) {
    console.error("MercadoPago preference error (resume):", error);
    return { error: "Error al crear el pago. Intenta nuevamente." };
  }
}
