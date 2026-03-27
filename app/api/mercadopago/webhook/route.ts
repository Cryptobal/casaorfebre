import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { paymentClient } from "@/lib/mercadopago";
import { webhookLimiter } from "@/lib/rate-limit";
import {
  sendPurchaseConfirmationEmail,
  sendNewOrderToArtisanEmail,
  sendSubscriptionActivatedEmail,
} from "@/lib/emails/templates";
import { createReferralRewardIfApplicable } from "@/lib/actions/referral";

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
  const manifest = `id:${dataId ?? ""};request-id:${xRequestId};ts:${ts};`;
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
      },
    });

    // Destock products (batch to avoid N+1)
    await Promise.all(
      order.items.map(async (item: any) => {
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
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit: 100/min by IP to prevent abuse
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { success: rlOk } = await webhookLimiter.limit(ip);
    if (!rlOk) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    const body = await request.json();

    // MercadoPago sends different notification formats
    const paymentId = body.data?.id;
    const topic = body.type || body.action;

    // Reject early if secret is not configured (server misconfiguration)
    if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      console.error("[webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Validate webhook signature
    if (!validateSignature(xSignature, xRequestId, paymentId?.toString())) {
      console.error("[webhook] Firma inválida — rechazando request");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (!paymentId || !topic?.includes("payment")) {
      return NextResponse.json({ received: true });
    }

    // Fetch payment details from MercadoPago
    const payment = await paymentClient.get({ id: paymentId });

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ received: true });
    }

    // Distinguish between product payments and subscription payments
    const metadata = payment.metadata as Record<string, unknown> | undefined;
    const isSubscription = metadata?.type === "subscription";

    if (isSubscription) {
      await handleSubscriptionPayment(payment);
    } else {
      await handleProductPayment(payment, paymentId);
    }

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
