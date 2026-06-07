import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendAutoConfirmToBuyerEmail,
  sendEmail,
} from "@/lib/emails/templates";
import { getAdminEmails } from "@/lib/config";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  // Find shipped items older than 10 days with no receipt confirmation and no open dispute
  const eligibleItems = await prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: "SHIPPED",
      receivedAt: null,
      shippedAt: { lt: tenDaysAgo },
      order: {
        disputes: {
          none: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
        },
      },
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          userId: true,
        },
      },
      artisan: {
        select: { displayName: true },
      },
    },
  });

  let confirmed = 0;
  const now = new Date();
  // Accumulate auto-confirmed items so admins can review them manually.
  const autoConfirmedForReview: {
    artisanName: string;
    productName: string;
    orderNumber: string;
  }[] = [];

  for (const item of eligibleItems) {
    // Auto-confirmation by inactivity: this does NOT mean the piece was
    // actually delivered. It must not trigger automatic payout, so we leave
    // it in AUTO_CONFIRMED (without payoutEligibleAt) for manual admin review.
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        fulfillmentStatus: "AUTO_CONFIRMED",
        autoReceivedAt: now,
        deliveredAt: now,
      },
    });

    // Notify the buyer that the order was closed due to inactivity.
    try {
      const buyer = await prisma.user.findUnique({
        where: { id: item.order.userId },
        select: { email: true, name: true },
      });
      if (buyer?.email) {
        await sendAutoConfirmToBuyerEmail(buyer.email, {
          buyerName: buyer.name || "Cliente",
          orderNumber: item.order.orderNumber,
          orderId: item.order.id,
        });
      }
    } catch (e) {
      console.error(`[auto-confirm] Buyer email failed for item ${item.id}:`, e);
    }

    autoConfirmedForReview.push({
      artisanName: item.artisan.displayName,
      productName: item.productName,
      orderNumber: item.order.orderNumber,
    });

    confirmed++;
  }

  // Notify admins so they can verify whether these pieces were actually
  // delivered before any payout is released.
  if (confirmed > 0) {
    const listHtml = autoConfirmedForReview
      .map(
        (i) =>
          `<li><strong>${i.artisanName}</strong> — ${i.productName} (Pedido #${i.orderNumber})</li>`
      )
      .join("");

    const adminEmails = getAdminEmails();
    for (const adminEmail of adminEmails) {
      try {
        await sendEmail(
          adminEmail,
          `Items auto-confirmados pendientes de revisión: ${confirmed}`,
          `<p>Los siguientes items fueron auto-confirmados por inactividad (el comprador nunca confirmó la recepción). No se sabe si la pieza fue realmente entregada, por lo que NO se liberó el pago automáticamente. Revisa manualmente cada caso antes de habilitar el payout:</p>
           <ul>${listHtml}</ul>
           <p><a href="https://casaorfebre.cl/portal/admin/pedidos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;">Ver pedidos</a></p>`
        );
      } catch (e) {
        console.error("[auto-confirm] Admin notification failed:", e);
      }
    }
  }

  return NextResponse.json({ success: true, confirmed });
}
