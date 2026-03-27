"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { preferenceClient } from "@/lib/mercadopago";
import { getCart } from "@/lib/queries/cart";

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `CO-${year}-${random}`;
}

export async function createCheckoutPreference(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autorizado" };

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

  // Fetch product + artisan data for commission calculation
  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map((i: any) => i.productId) } },
    include: { artisan: { select: { id: true, commissionRate: true } } },
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
  const total = subtotal + shippingCost;

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
      total,
      status: "PENDING_PAYMENT",
      items: {
        create: cartItems.map((item: any) => {
          const product = productMap.get(item.productId)!;
          const commissionRate = product.artisan?.commissionRate ?? 0.18;
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

  // Create MercadoPago preference
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const preference = await preferenceClient.create({
      body: {
        items: cartItems.map((item: any) => ({
          id: item.product.id,
          title: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          currency_id: "CLP",
        })),
        payer: {
          email: session.user.email,
        },
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/success`,
        },
        auto_return: "approved",
        external_reference: order.id,
        notification_url: `${appUrl}/api/mercadopago/webhook`,
      },
    });

    // Use sandbox or production URL based on MP_SANDBOX env var
    const useSandbox = process.env.MP_SANDBOX !== "false";
    const redirectUrl = useSandbox
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point;
    console.log(`[checkout] Usando ${useSandbox ? "sandbox_init_point" : "init_point"} (MP_SANDBOX=${process.env.MP_SANDBOX ?? "undefined"})`);

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

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const preference = await preferenceClient.create({
      body: {
        items: order.items.map((item) => ({
          id: item.productId,
          title: item.productName,
          quantity: item.quantity,
          unit_price: item.productPrice,
          currency_id: "CLP",
        })),
        payer: {
          email: session.user.email,
        },
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/success`,
        },
        auto_return: "approved",
        external_reference: order.id,
        notification_url: `${appUrl}/api/mercadopago/webhook`,
      },
    });

    const useSandbox = process.env.MP_SANDBOX !== "false";
    const redirectUrl = useSandbox
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point;
    console.log(`[checkout:resume] Usando ${useSandbox ? "sandbox_init_point" : "init_point"} (MP_SANDBOX=${process.env.MP_SANDBOX ?? "undefined"})`);

    return { success: true as const, redirectUrl };
  } catch (error) {
    console.error("MercadoPago preference error (resume):", error);
    return { error: "Error al crear el pago. Intenta nuevamente." };
  }
}
