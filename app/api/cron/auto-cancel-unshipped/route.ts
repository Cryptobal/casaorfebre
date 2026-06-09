import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminEmails } from "@/lib/config";
import { refundPayment } from "@/lib/mercadopago";
import {
  sendShipmentLastWarningEmail,
  sendOrderAutoCancelledToBuyerEmail,
  sendOrderAutoCancelledToArtisanEmail,
  sendEmail,
} from "@/lib/emails/templates";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const adminEmails = getAdminEmails();

  // -----------------------------------------------------------------------
  // Phase 1: Last warning at 4 days (items between 4-5 days old)
  // -----------------------------------------------------------------------
  const warningItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: { in: ["PENDING", "PREPARING"] },
      order: { status: "PAID" },
      createdAt: { gte: fiveDaysAgo, lt: fourDaysAgo },
    },
    include: {
      artisan: { include: { user: { select: { email: true } } } },
      order: { select: { orderNumber: true, id: true } },
    },
  });

  let warningsSent = 0;
  for (const item of warningItems) {
    if (!item.artisan.user?.email) continue;
    try {
      await sendShipmentLastWarningEmail(item.artisan.user.email, {
        artisanName: item.artisan.displayName,
        orderNumber: item.order.orderNumber,
        orderId: item.order.id,
      });
      warningsSent++;
    } catch (e) {
      console.error(`[auto-cancel] Warning email failed for ${item.order.orderNumber}:`, e);
    }
  }

  // -----------------------------------------------------------------------
  // Phase 2: Auto-cancel at 5 days
  // -----------------------------------------------------------------------
  const cancelItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: { in: ["PENDING", "PREPARING"] },
      order: { status: "PAID" },
      createdAt: { lt: fiveDaysAgo },
    },
    include: {
      artisan: { include: { user: { select: { email: true } } } },
      order: {
        select: {
          id: true,
          orderNumber: true,
          userId: true,
          mpPaymentId: true,
          giftCardCode: true,
          giftCardDiscount: true,
          items: { select: { id: true, fulfillmentStatus: true } },
        },
      },
    },
  });

  // Group by order to handle multi-item orders
  const ordersToCancel = new Map<
    string,
    {
      orderId: string;
      orderNumber: string;
      userId: string;
      mpPaymentId: string | null;
      giftCardCode: string | null;
      giftCardDiscount: number;
      allUnshipped: boolean;
      unshippedItems: typeof cancelItems;
      unshippedProductNames: string[];
      artisanEmails: Set<string>;
      artisanNames: Map<string, string>;
    }
  >();

  for (const item of cancelItems) {
    const existing = ordersToCancel.get(item.order.id);
    if (existing) {
      existing.unshippedItems.push(item);
      existing.unshippedProductNames.push(item.productName);
      if (item.artisan.user?.email) {
        existing.artisanEmails.add(item.artisan.user.email);
        existing.artisanNames.set(item.artisan.user.email, item.artisan.displayName);
      }
    } else {
      // Check if ALL items in the order are unshipped
      const allUnshipped = item.order.items.every(
        (i) => i.fulfillmentStatus === "PENDING" || i.fulfillmentStatus === "PREPARING"
      );
      const artisanEmails = new Set<string>();
      const artisanNames = new Map<string, string>();
      if (item.artisan.user?.email) {
        artisanEmails.add(item.artisan.user.email);
        artisanNames.set(item.artisan.user.email, item.artisan.displayName);
      }
      ordersToCancel.set(item.order.id, {
        orderId: item.order.id,
        orderNumber: item.order.orderNumber,
        userId: item.order.userId,
        mpPaymentId: item.order.mpPaymentId,
        giftCardCode: item.order.giftCardCode,
        giftCardDiscount: item.order.giftCardDiscount,
        allUnshipped,
        unshippedItems: [item],
        unshippedProductNames: [item.productName],
        artisanEmails,
        artisanNames,
      });
    }
  }

  let cancelled = 0;

  for (const orderGroup of ordersToCancel.values()) {
    // Only auto-cancel if ALL items are unshipped
    // If some items were shipped, the admin needs to handle it manually
    if (!orderGroup.allUnshipped) continue;

    // Refund the buyer in MercadoPago BEFORE cancelling. If the refund fails we
    // must NOT cancel the order (that would lose the buyer's money silently);
    // instead we leave it untouched and alert admins for manual handling.
    if (orderGroup.mpPaymentId) {
      try {
        await refundPayment(orderGroup.mpPaymentId);
      } catch (e) {
        console.error(
          `[auto-cancel] MP refund FAILED for ${orderGroup.orderNumber}; NOT cancelling (manual review):`,
          e
        );
        for (const adminEmail of adminEmails) {
          try {
            await sendEmail(
              adminEmail,
              `⚠️ Reembolso falló — revisar pedido ${orderGroup.orderNumber}`,
              `<p>La cancelación automática del pedido <strong>${orderGroup.orderNumber}</strong> se detuvo porque el reembolso en Mercado Pago falló (pago ${orderGroup.mpPaymentId}).</p>
               <p>El pedido sigue en estado <strong>PAID</strong> y requiere reembolso/cancelación manual.</p>`
            );
          } catch {}
        }
        continue;
      }
    }

    try {
      // Restore gift card balance if it was used to (partially) pay this order.
      // Without this, gift-card-funded orders would be cancelled and the buyer
      // would lose that balance silently.
      if (orderGroup.giftCardCode && orderGroup.giftCardDiscount > 0) {
        const gc = await prisma.giftCard.findUnique({
          where: { code: orderGroup.giftCardCode },
        });
        if (gc) {
          const newBalance = gc.balance + orderGroup.giftCardDiscount;
          await prisma.giftCard.update({
            where: { code: orderGroup.giftCardCode },
            data: {
              balance: newBalance,
              status: gc.status === "REDEEMED" ? "PARTIALLY_USED" : gc.status,
            },
          });
        }
      }

      // Restore stock for all items (global + per-size variant)
      for (const item of orderGroup.unshippedItems) {
        if (item.size) {
          await prisma.productVariant.updateMany({
            where: { productId: item.productId, size: item.size },
            data: { stock: { increment: item.quantity } },
          });
        }
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Mark all items as refunded
      await prisma.orderItem.updateMany({
        where: { orderId: orderGroup.orderId },
        data: { payoutStatus: "REFUNDED" },
      });

      // Cancel the order
      await prisma.order.update({
        where: { id: orderGroup.orderId },
        data: { status: "CANCELLED" },
      });

      // Email buyer
      try {
        const buyer = await prisma.user.findUnique({
          where: { id: orderGroup.userId },
          select: { email: true, name: true },
        });
        if (buyer?.email) {
          await sendOrderAutoCancelledToBuyerEmail(buyer.email, {
            buyerName: buyer.name || "Cliente",
            orderNumber: orderGroup.orderNumber,
            productNames: orderGroup.unshippedProductNames,
          });
        }
      } catch (e) {
        console.error(`[auto-cancel] Buyer email failed for ${orderGroup.orderNumber}:`, e);
      }

      // Email each artisan involved
      for (const [email, name] of orderGroup.artisanNames) {
        try {
          const artisanProducts = orderGroup.unshippedItems
            .filter((item) => item.artisan.user?.email === email)
            .map((item) => item.productName);
          await sendOrderAutoCancelledToArtisanEmail(email, {
            artisanName: name,
            orderNumber: orderGroup.orderNumber,
            productNames: artisanProducts,
          });
        } catch (e) {
          console.error(`[auto-cancel] Artisan email failed:`, e);
        }
      }

      // Email admins
      for (const adminEmail of adminEmails) {
        try {
          await sendOrderAutoCancelledToArtisanEmail(adminEmail, {
            artisanName: `[Admin] Cancelación automática`,
            orderNumber: orderGroup.orderNumber,
            productNames: orderGroup.unshippedProductNames,
          });
        } catch (e) {
          console.error("[auto-cancel] Admin email failed:", e);
        }
      }

      cancelled++;
    } catch (e) {
      console.error(`[auto-cancel] Failed to cancel order ${orderGroup.orderNumber}:`, e);
    }
  }

  return NextResponse.json({
    success: true,
    warningsSent,
    cancelled,
  });
}
