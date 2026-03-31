import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { paymentClient } from "@/lib/mercadopago";
import { webhookLimiter } from "@/lib/rate-limit";
import {
  sendPurchaseConfirmationEmail,
  sendNewOrderToArtisanEmail,
  sendNewOrderAdminEmail,
  sendSubscriptionActivatedEmail,
  sendGiftCardRecipientEmail,
  sendGiftCardPurchaserEmail,
} from "@/lib/emails/templates";
import { createReferralRewardIfApplicable } from "@/lib/actions/referral";
import { generateGiftCardCode } from "@/lib/gift-cards";

/**
 * Mercado Pago: el manifest HMAC usa el `data.id` de los **query params** de la URL
 * (no solo del JSON). Si es alfanumérico, debe ir en minúsculas.
 * @see https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks#verificarsignature
 */
function normalizeMercadoPagoManifestId(id: string): string {
  const t = id.trim();
  if (!t) return "";
  if (/^[a-zA-Z0-9]+$/.test(t)) return t.toLowerCase();
  return t;
}

/**
 * Validates MercadoPago webhook signature (x-signature header).
 * See: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks#verificarsignature
 */
function validateSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | undefined
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "[webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado — RECHAZANDO webhook por seguridad"
    );
    return false;
  }

  if (!xSignature || !xRequestId) {
    console.warn("[webhook] Faltan headers x-signature o x-request-id");
    return false;
  }

  // Parse ts and v1 from x-signature: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, ...rest] = part.split("=");
    parts[key.trim()] = rest.join("=").trim();
  }

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Build the manifest string
  const idPart = dataId != null && dataId !== "" ? normalizeMercadoPagoManifestId(String(dataId)) : "";
  const manifest = `id:${idPart};request-id:${xRequestId};ts:${ts};`;
  const hmac = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch {
    return false;
  }
}

/**
 * Handles subscription payment confirmation.
 * Activates/renews the subscription and updates artisan commission.
 */
async function handleSubscriptionPayment(payment: any) {
  const subscriptionId = payment.external_reference;
  const metadata = payment.metadata as Record<string, unknown>;

  if (payment.status === "approved") {
    const sub = await prisma.membershipSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        artisan: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    if (!sub) return;

    const billingPeriod = metadata?.billing_period as string || "monthly";
    const isAnnual = billingPeriod === "annual";
    const durationDays = isAnnual ? 365 : 30;
    const now = new Date();
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Cancel any other ACTIVE subscriptions for this artisan
    await prisma.membershipSubscription.updateMany({
      where: {
        artisanId: sub.artisanId,
        status: "ACTIVE",
        id: { not: sub.id },
      },
      data: { status: "CANCELLED", cancelledAt: now },
    });

    // Activate the subscription
    await prisma.membershipSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate,
      },
    });

    // Update commission rate (unless artisan has an override)
    const artisan = sub.artisan;
    if (artisan.commissionOverride === null) {
      await prisma.artisan.update({
        where: { id: artisan.id },
        data: { commissionRate: sub.plan.commissionRate },
      });
    }

    // Send confirmation email
    const email = artisan.user?.email;
    if (email) {
      try {
        const planLabel =
          sub.plan.name.charAt(0).toUpperCase() + sub.plan.name.slice(1);
        await sendSubscriptionActivatedEmail(email, {
          artisanName: artisan.displayName,
          planName: planLabel,
          endDate,
        });
      } catch (e) {
        console.error("[webhook] Subscription email failed:", e);
      }
    }
  }
  // Rejected subscription payments are not acted on — the cron will handle expiry
}

/**
 * Handles product purchase payment (existing flow).
 */
async function handleProductPayment(payment: any, paymentId: string | number) {
  const orderId = payment.external_reference;

  if (payment.status === "approved") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== "PENDING_PAYMENT") return;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        mpPaymentId: String(paymentId),
        mpMerchantOrderId: payment.order?.id ? String(payment.order.id) : undefined,
      },
    });

    // Save mpTransactionId on each OrderItem
    await prisma.orderItem.updateMany({
      where: { orderId },
      data: { mpTransactionId: String(paymentId) },
    });

    // Destock products (batch to avoid N+1)
    await Promise.all(
      order.items.map(async (item: any) => {
        // Decrement variant stock if size is specified
        if (item.size) {
          await prisma.productVariant.updateMany({
            where: { productId: item.productId, size: item.size },
            data: { stock: { decrement: item.quantity } },
          });
        }
        // Always decrement global product stock
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

    // Deduct gift card balance if used
    if (order.giftCardCode && order.giftCardDiscount > 0) {
      const gc = await prisma.giftCard.findUnique({
        where: { code: order.giftCardCode },
      });
      if (gc) {
        const newBalance = gc.balance - order.giftCardDiscount;
        await prisma.giftCard.update({
          where: { code: order.giftCardCode },
          data: {
            balance: Math.max(0, newBalance),
            status: newBalance <= 0 ? "REDEEMED" : "PARTIALLY_USED",
            redeemedAt: gc.redeemedAt ?? new Date(),
          },
        });
        await prisma.giftCardUsage.create({
          data: {
            giftCardId: gc.id,
            orderId: order.id,
            amount: order.giftCardDiscount,
          },
        });
      }
    }

    // Clear cart for the buyer
    await prisma.cartItem.deleteMany({
      where: { userId: order.userId },
    });

    // Send purchase confirmation to buyer
    const buyer = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true, name: true },
    });
    if (buyer?.email) {
      try {
        await sendPurchaseConfirmationEmail(buyer.email, {
          name: buyer.name || "Cliente",
          orderNumber: order.orderNumber,
          items: order.items.map((i: any) => ({
            name: i.productName,
            price: i.productPrice,
            quantity: i.quantity,
          })),
          total: order.total,
          isGift: order.isGift,
          giftMessage: order.giftMessage,
          giftWrapping: order.giftWrapping,
        });
      } catch (e) {
        console.error("Email failed:", e);
      }
    }

    // Send new order notification to each artisan (pre-fetch to avoid N+1)
    const artisanIds = [...new Set(order.items.map((i: any) => i.artisanId))];
    const artisans = await prisma.artisan.findMany({
      where: { id: { in: artisanIds as string[] } },
      include: { user: { select: { email: true } } },
    });
    for (const artisan of artisans) {
      const artisanItems = order.items.filter(
        (i: any) => i.artisanId === artisan.id
      );
      if (artisan?.user?.email) {
        try {
          await sendNewOrderToArtisanEmail(artisan.user.email, {
            artisanName: artisan.displayName,
            orderNumber: order.orderNumber,
            orderId: order.id,
            items: artisanItems.map((i: any) => ({
              name: i.productName,
              price: i.productPrice,
              quantity: i.quantity,
            })),
            shippingName: order.shippingName,
            shippingAddress: order.shippingAddress,
            shippingCity: order.shippingCity,
            shippingRegion: order.shippingRegion,
            isGift: order.isGift,
            giftMessage: order.giftMessage,
            giftWrapping: order.giftWrapping,
          });
        } catch (e) {
          console.error("Email failed:", e);
        }
      }
    }
    // Send admin notification
    const { getAdminEmails } = await import("@/lib/config");
    const ADMIN_EMAILS = getAdminEmails();
    for (const adminEmail of ADMIN_EMAILS) {
      try {
        const artisanMap = new Map(artisans.map((a: any) => [a.id, a.displayName]));
        await sendNewOrderAdminEmail(adminEmail, {
          orderNumber: order.orderNumber,
          buyerName: buyer?.name || "Cliente",
          buyerEmail: buyer?.email || "",
          total: order.total,
          items: order.items.map((i: any) => ({
            productName: i.productName,
            artisanName: artisanMap.get(i.artisanId) || "Orfebre",
            quantity: i.quantity,
            price: i.productPrice,
          })),
        });
      } catch (e) {
        console.error("Admin email failed:", e);
      }
    }

    // Create referral reward if buyer was referred
    try {
      await createReferralRewardIfApplicable(order.userId);
    } catch (e) {
      console.error("Referral reward creation failed:", e);
    }
  } else if (payment.status === "rejected") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  } else if (payment.status === "pending" || payment.status === "in_process") {
    // Payment is being processed — don't change order status, just log
    console.log('[MP Webhook] Payment pending/in_process', {
      paymentId,
      status: payment.status,
      orderId,
    });
  } else if (payment.status === "cancelled") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (order && order.status === "PENDING_PAYMENT") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      console.log('[MP Webhook] Order cancelled due to payment cancellation', { paymentId, orderId });
    }
  } else if (payment.status === "refunded" || payment.status === "charged_back") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (order && order.status === "PAID") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });

      // Restore stock
      await Promise.all(
        order.items.map(async (item: any) => {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        })
      );

      // Update payout status for order items
      await prisma.orderItem.updateMany({
        where: { orderId },
        data: { payoutStatus: "REFUNDED" },
      });

      console.log('[MP Webhook] Order refunded/charged_back', {
        paymentId,
        orderId,
        status: payment.status,
      });
    }
  }
}

/**
 * Handles gift card purchase payment.
 */
async function handleGiftCardPayment(payment: any, paymentId: string | number) {
  if (payment.status !== "approved") return;

  const metadata = payment.metadata as Record<string, unknown>;
  const purchaserId = metadata?.purchaser_id as string;
  const purchaserEmail = metadata?.purchaser_email as string;
  const purchaserName = metadata?.purchaser_name as string || "Alguien especial";
  const recipientEmail = metadata?.recipient_email as string;
  const recipientName = (metadata?.recipient_name as string) || null;
  const message = (metadata?.message as string) || null;
  const amount = Number(metadata?.amount);

  if (!purchaserId || !recipientEmail || !amount) {
    console.error("[webhook] Gift card payment missing metadata", metadata);
    return;
  }

  // Check if this payment was already processed (idempotency)
  const existingOrder = await prisma.order.findUnique({
    where: { mpPaymentId: String(paymentId) },
  });
  if (existingOrder) return;

  // Generate unique code
  const code = await generateGiftCardCode();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Create order for tracking
  const orderNumber = `CO-GC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: purchaserId,
      shippingName: "Gift Card Digital",
      shippingAddress: "N/A",
      shippingCity: "N/A",
      shippingRegion: "N/A",
      subtotal: amount,
      total: amount,
      status: "PAID",
      mpPaymentId: String(paymentId),
    },
  });

  // Create gift card
  await prisma.giftCard.create({
    data: {
      code,
      amount,
      balance: amount,
      purchaserId,
      recipientEmail,
      recipientName,
      message,
      status: "ACTIVE",
      expiresAt,
      orderId: order.id,
    },
  });

  // Send emails
  try {
    await sendGiftCardRecipientEmail(recipientEmail, {
      recipientName,
      purchaserName,
      amount,
      code,
      message,
      expiresAt,
    });
  } catch (e) {
    console.error("[webhook] Gift card recipient email failed:", e);
  }

  if (purchaserEmail) {
    try {
      await sendGiftCardPurchaserEmail(purchaserEmail, {
        recipientEmail,
        amount,
        code,
        expiresAt,
      });
    } catch (e) {
      console.error("[webhook] Gift card purchaser email failed:", e);
    }
  }

  console.log(`[webhook] Gift card created: ${code}, amount=${amount}, recipient=${recipientEmail}`);
}

/**
 * Fetches a payment from MP, trying marketplace token first, then artisan fallback.
 */
async function fetchPayment(paymentId: string | number): Promise<any> {
  try {
    return await paymentClient.get({ id: paymentId });
  } catch (err: any) {
    console.warn('[MP Webhook] Marketplace token fetch failed, trying artisan fallback', {
      paymentId, error: err?.message,
    });

    const recentOrders = await prisma.order.findMany({
      where: { status: 'PENDING_PAYMENT' },
      include: { items: { select: { artisanId: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    for (const order of recentOrders) {
      const artisanId = order.items[0]?.artisanId;
      if (!artisanId) continue;
      const artisan = await prisma.artisan.findUnique({
        where: { id: artisanId },
        select: { mpAccessToken: true },
      });
      if (!artisan?.mpAccessToken) continue;
      try {
        const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${artisan.mpAccessToken}` },
        });
        if (res.ok) {
          console.log('[MP Webhook] Payment fetched via artisan fallback', { paymentId, artisanId });
          return res.json();
        }
      } catch {}
    }

    console.error('[MP Webhook] Could not fetch payment with any token', { paymentId });
    return null;
  }
}

/**
 * Fetches a merchant_order from MP API.
 */
async function fetchMerchantOrder(merchantOrderId: string): Promise<any> {
  const sandbox = process.env.MP_SANDBOX !== "false";
  const token = sandbox
    ? (process.env.MERCADOPAGO_TEST_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN)
    : process.env.MERCADOPAGO_ACCESS_TOKEN;
  const res = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) return res.json();
  console.error('[MP Webhook] Failed to fetch merchant_order', {
    merchantOrderId, status: res.status,
  });
  return null;
}

/**
 * Processes a single payment: fetches details from MP, dispatches to the right handler.
 */
async function processPayment(paymentId: string | number) {
  console.log('[MP Webhook] Fetching payment', { paymentId, timestamp: new Date().toISOString() });

  const payment = await fetchPayment(paymentId);
  if (!payment || !payment.external_reference) {
    console.warn('[MP Webhook] Payment not found or missing external_reference', { paymentId });
    return;
  }

  console.log('[MP Webhook] Payment data', {
    id: payment.id,
    status: payment.status,
    transaction_amount: payment.transaction_amount,
    fee_details: payment.fee_details,
    external_reference: payment.external_reference,
    collector_id: payment.collector_id,
  });

  const metadata = payment.metadata as Record<string, unknown> | undefined;
  const isSubscription = metadata?.type === "subscription";
  const isGiftCard = metadata?.type === "giftcard" ||
    (typeof payment.external_reference === "string" && payment.external_reference.startsWith("giftcard_"));

  if (isSubscription) {
    await handleSubscriptionPayment(payment);
  } else if (isGiftCard) {
    await handleGiftCardPayment(payment, paymentId);
  } else {
    await handleProductPayment(payment, paymentId);
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit: 100/min by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { success: rlOk } = await webhookLimiter.limit(ip);
    if (!rlOk) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    // --- IPN fallback: query-param format without signature ---
    const url = new URL(request.url);
    const topicParam = url.searchParams.get("topic") || url.searchParams.get("type");
    const idParam = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (!xSignature && topicParam && idParam) {
      console.log('[MP Webhook] IPN format received', { topic: topicParam, id: idParam });
      if (topicParam === "payment") {
        await processPayment(idParam);
      } else if (topicParam === "merchant_order") {
        const mo = await fetchMerchantOrder(idParam);
        if (mo) {
          for (const p of (mo.payments || []).filter((p: any) => p.status === "approved")) {
            await processPayment(p.id);
          }
        }
      }
      return NextResponse.json({ received: true });
    }

    // --- Standard webhook format (JSON body with signature) ---
    const body = await request.json();
    const topicFromQuery = url.searchParams.get("topic") || "";
    const eventType =
      body.type || body.action || topicFromQuery || "";

    // ID para HMAC: MP documenta `data.id` en query string de la URL (prioridad), luego body.
    const queryDataId = url.searchParams.get("data.id");
    const dataId =
      queryDataId ??
      (body.data?.id != null ? String(body.data.id) : undefined) ??
      (body.id != null ? String(body.id) : undefined);

    console.log('[MP Webhook] Request received', {
      format: xSignature ? "webhook_signed" : "webhook_unsigned",
      type: eventType,
      resourceId: dataId,
      dataIdSource: queryDataId ? "query" : body.data?.id != null ? "body.data" : body.id != null ? "body.id" : "none",
      action: body.action,
      hasSignature: !!xSignature,
      timestamp: new Date().toISOString(),
    });

    // Reject if secret not configured
    if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      console.error("[webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Validate HMAC signature (data.id del manifest = query primero, ver docs MP)
    if (!validateSignature(xSignature, xRequestId, dataId)) {
      console.error("[webhook] Firma inválida", {
        type: eventType,
        dataId,
        queryDataId,
        bodyDataId: body.data?.id,
        bodyId: body.id,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const isMerchantOrderEvent =
      eventType === "topic_merchant_order_wh" ||
      topicFromQuery === "merchant_order";

    // --- Handle "topic_merchant_order_wh" ---
    if (isMerchantOrderEvent) {
      const merchantOrderId = String(dataId);
      console.log('[MP Webhook] Processing merchant_order', { merchantOrderId });

      const mo = await fetchMerchantOrder(merchantOrderId);
      if (!mo) {
        return NextResponse.json({ received: true });
      }

      const approvedPayments = (mo.payments || []).filter((p: any) => p.status === "approved");
      console.log('[MP Webhook] Merchant order payments', {
        merchantOrderId,
        moStatus: mo.status,
        totalPayments: mo.payments?.length || 0,
        approvedCount: approvedPayments.length,
        externalReference: mo.external_reference,
      });

      // Also save the merchant_order_id on the order if we can find it
      if (mo.external_reference) {
        await prisma.order.updateMany({
          where: { id: mo.external_reference, mpMerchantOrderId: null },
          data: { mpMerchantOrderId: merchantOrderId },
        });
      }

      for (const p of approvedPayments) {
        await processPayment(p.id);
      }

      return NextResponse.json({ received: true });
    }

    // --- Handle standard "payment" events ---
    const paymentId =
      body.data?.id ?? body.id ?? (queryDataId ? queryDataId : undefined);
    const isPaymentEvent =
      eventType.includes("payment") || topicFromQuery === "payment";

    if (!paymentId || !isPaymentEvent) {
      console.log("[MP Webhook] Ignoring non-payment event", {
        type: eventType,
        topicFromQuery,
        dataId,
      });
      return NextResponse.json({ received: true });
    }

    await processPayment(paymentId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to prevent MercadoPago retries on server errors
    return NextResponse.json({ received: true });
  }
}

// MercadoPago also sends GET requests for verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
