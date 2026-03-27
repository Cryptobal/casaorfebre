import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSubscriptionPreference } from "@/lib/subscription-payment";
import {
  sendSubscriptionRenewalEmail,
  sendSubscriptionReminderEmail,
  sendSubscriptionExpiredEmail,
} from "@/lib/emails/templates";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    renewalsSent: 0,
    remindersSent: 0,
    degraded: 0,
    errors: [] as string[],
  };

  try {
    // Find all ACTIVE subscriptions that have expired (endDate <= now)
    const expiredSubs = await prisma.membershipSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: now },
      },
      include: {
        plan: true,
        artisan: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    for (const sub of expiredSubs) {
      const artisan = sub.artisan;
      const plan = sub.plan;
      const email = artisan.user?.email;

      if (!email) continue;

      // Skip free plans (esencial) — they don't need renewal
      if (plan.price === 0) continue;

      const endDate = sub.endDate!;
      const daysSinceExpiry = Math.floor(
        (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const planLabel =
        plan.name.charAt(0).toUpperCase() + plan.name.slice(1);

      try {
        if (daysSinceExpiry >= 10) {
          // ── 10+ days: DEGRADE to Esencial ──
          await degradeToEsencial(artisan.id, sub.id, planLabel, email, artisan.displayName);
          results.degraded++;
        } else if (daysSinceExpiry >= 7) {
          // ── 7 days: Last warning ──
          const paymentUrl = await getOrCreatePaymentUrl(sub, artisan.id, planLabel);
          await sendSubscriptionReminderEmail(email, {
            artisanName: artisan.displayName,
            planName: planLabel,
            amount: plan.price,
            paymentUrl,
            daysOverdue: daysSinceExpiry,
          });
          results.remindersSent++;
        } else if (daysSinceExpiry >= 3) {
          // ── 3 days: Reminder ──
          const paymentUrl = await getOrCreatePaymentUrl(sub, artisan.id, planLabel);
          await sendSubscriptionReminderEmail(email, {
            artisanName: artisan.displayName,
            planName: planLabel,
            amount: plan.price,
            paymentUrl,
            daysOverdue: daysSinceExpiry,
          });
          results.remindersSent++;
        } else {
          // ── 0 days: Initial renewal notice ──
          const paymentUrl = await getOrCreatePaymentUrl(sub, artisan.id, planLabel);
          await sendSubscriptionRenewalEmail(email, {
            artisanName: artisan.displayName,
            planName: planLabel,
            amount: plan.price,
            paymentUrl,
          });
          results.renewalsSent++;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[renew-sub] Error processing sub ${sub.id}:`, msg);
        results.errors.push(`sub ${sub.id}: ${msg}`);
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("[renew-sub] Fatal error:", error);
    return NextResponse.json({ success: false, error: "Internal error" });
  }
}

/**
 * Creates a payment preference URL for a subscription renewal.
 * Determines billing period from the subscription's start/end dates.
 */
async function getOrCreatePaymentUrl(
  sub: { id: string; startDate: Date; endDate: Date | null; plan: { price: number; annualPrice: number | null; name: string } },
  artisanId: string,
  planLabel: string
): Promise<string> {
  // Determine if this was a monthly or annual subscription
  const startDate = sub.startDate;
  const endDate = sub.endDate!;
  const durationDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isAnnual = durationDays > 90;
  const billingPeriod = isAnnual ? "annual" as const : "monthly" as const;
  const amount =
    isAnnual && sub.plan.annualPrice ? sub.plan.annualPrice : sub.plan.price;

  const { redirectUrl } = await createSubscriptionPreference({
    artisanId,
    subscriptionId: sub.id,
    planName: planLabel,
    amount,
    billingPeriod,
  });

  return redirectUrl;
}

/**
 * Degrades an artisan's subscription to the Esencial plan.
 * - Marks old subscription as EXPIRED
 * - Sets commission to 18%
 * - Pauses excess products (over 10 limit)
 * - Sends notification email
 */
async function degradeToEsencial(
  artisanId: string,
  subscriptionId: string,
  oldPlanName: string,
  email: string,
  artisanName: string
) {
  // Mark subscription as expired
  await prisma.membershipSubscription.update({
    where: { id: subscriptionId },
    data: { status: "EXPIRED" },
  });

  // Reset commission to 18% (esencial default) unless admin override
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: { commissionOverride: true },
  });
  if (artisan && artisan.commissionOverride === null) {
    await prisma.artisan.update({
      where: { id: artisanId },
      data: { commissionRate: 0.18 },
    });
  }

  // Pause excess products (esencial limit = 10)
  const ESENCIAL_LIMIT = 10;
  const activeProductCount = await prisma.product.count({
    where: { artisanId, status: "APPROVED" },
  });

  let pausedProducts = 0;
  if (activeProductCount > ESENCIAL_LIMIT) {
    const excessCount = activeProductCount - ESENCIAL_LIMIT;
    const productsToPause = await prisma.product.findMany({
      where: { artisanId, status: "APPROVED" },
      orderBy: { publishedAt: "desc" },
      take: excessCount,
      select: { id: true },
    });

    await prisma.product.updateMany({
      where: { id: { in: productsToPause.map((p) => p.id) } },
      data: { status: "PAUSED" },
    });

    pausedProducts = productsToPause.length;
  }

  // Send expiration email
  try {
    await sendSubscriptionExpiredEmail(email, {
      artisanName,
      planName: oldPlanName,
      pausedProducts,
    });
  } catch (e) {
    console.error("[renew-sub] Expiration email failed:", e);
  }
}
