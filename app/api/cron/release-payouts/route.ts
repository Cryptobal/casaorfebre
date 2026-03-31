import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emails/templates";
import {
  sendPayoutReleasedEmail,
  sendPayoutReleasedDetailedEmail,
} from "@/lib/emails/templates";
import { formatCLP } from "@/lib/utils";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Primary: items with payoutEligibleAt set and reached
  const eligibleByDate = await prisma.orderItem.findMany({
    where: {
      payoutStatus: "HELD",
      fulfillmentStatus: "DELIVERED",
      payoutEligibleAt: { lte: now },
      order: {
        disputes: {
          none: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
        },
      },
    },
    include: {
      artisan: {
        include: { user: { select: { email: true } } },
      },
      order: { select: { orderNumber: true, subtotal: true, shippingCost: true } },
    },
  });

  // Fallback: legacy items without payoutEligibleAt, delivered > 14 days ago
  const eligibleLegacy = await prisma.orderItem.findMany({
    where: {
      payoutStatus: "HELD",
      fulfillmentStatus: "DELIVERED",
      payoutEligibleAt: null,
      deliveredAt: { lt: fourteenDaysAgo },
      order: {
        disputes: {
          none: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
        },
      },
    },
    include: {
      artisan: {
        include: { user: { select: { email: true } } },
      },
      order: { select: { orderNumber: true, subtotal: true, shippingCost: true } },
    },
  });

  const allEligible = [...eligibleByDate, ...eligibleLegacy];
  let released = 0;

  for (const item of allEligible) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        payoutStatus: "PENDING",
        payoutAt: now,
      },
    });

    if (item.artisan.user?.email) {
      try {
        const productTotal = item.productPrice * item.quantity;
        // Calculate proportional shipping share
        const orderSubtotal = item.order.subtotal || 1;
        const shippingShare =
          item.order.shippingCost > 0
            ? Math.round((productTotal / orderSubtotal) * item.order.shippingCost)
            : 0;

        await sendPayoutReleasedDetailedEmail(item.artisan.user.email, {
          artisanName: item.artisan.displayName,
          productName: item.productName,
          productTotal,
          commissionRate: item.commissionRate,
          commissionAmount: item.commissionAmount,
          shippingShare,
          artisanPayout: item.artisanPayout,
        });
      } catch (e) {
        console.error(`Payout email failed for order ${item.order.orderNumber}:`, e);
        // Fallback to simple email
        try {
          await sendPayoutReleasedEmail(item.artisan.user.email, {
            artisanName: item.artisan.displayName,
            amount: item.artisanPayout,
          });
        } catch {}
      }
    }

    released++;
  }

  // Notify admins about pending payouts
  if (released > 0) {
    const payoutSummary = allEligible.reduce((acc: Record<string, { name: string; total: number; items: number }>, item) => {
      const key = item.artisanId;
      if (!acc[key]) {
        acc[key] = { name: item.artisan.displayName, total: 0, items: 0 };
      }
      acc[key].total += item.artisanPayout;
      acc[key].items += 1;
      return acc;
    }, {});

    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    const summaryHtml = Object.values(payoutSummary)
      .map((p) => `<li><strong>${p.name}</strong>: ${formatCLP(p.total)} (${p.items} item${p.items > 1 ? "s" : ""})</li>`)
      .join("");

    for (const admin of adminUsers) {
      try {
        await sendEmail(
          admin.email,
          `Pagos pendientes de transferencia: ${released} items`,
          `<p>Los siguientes pagos han cumplido el período de retención de 14 días y están listos para ser transferidos:</p>
           <ul>${summaryHtml}</ul>
           <p><a href="https://casaorfebre.cl/portal/admin/pagos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;">Ver pagos pendientes</a></p>`
        );
      } catch (e) {
        console.error("Admin payout notification failed:", e);
      }
    }
  }

  return NextResponse.json({
    success: true,
    released,
    byDate: eligibleByDate.length,
    legacy: eligibleLegacy.length,
  });
}
