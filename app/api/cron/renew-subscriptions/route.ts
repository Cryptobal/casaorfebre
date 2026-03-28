import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSubscriptionPreference } from "@/lib/subscription-payment";
import {
  sendSubscriptionRenewalEmail,
  sendSubscriptionReminderEmail,
  sendSubscriptionExpiredEmail,
  sendPreExpirationEmail,
  sendGracePeriodEmail,
  sendDowngradeCompletedEmail,
} from "@/lib/emails/templates";
import { executeDowngrade } from "@/lib/membership/downgrade";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    preExpirationNotified: 0,
    movedToGrace: 0,
    renewalsSent: 0,
    remindersSent: 0,
    degraded: 0,
    errors: [] as string[],
  };

  try {
    // ── PASO 0: Aviso 7 días antes de expiración ──
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sixDaysFromNow = new Date(now);
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);

    const expiringIn7Days = await prisma.membershipSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: sixDaysFromNow,
          lte: sevenDaysFromNow,
        },
        plan: { price: { gt: 0 } },
        gracePeriodNotified: false,
      },
      include: {
        plan: true,
        artisan: { include: { user: { select: { email: true } } } },
      },
    });

    for (const sub of expiringIn7Days) {
      try {
        const planLabel = sub.plan.name.charAt(0).toUpperCase() + sub.plan.name.slice(1);
        await sendPreExpirationEmail(sub.artisan.user.email, {
          artisanName: sub.artisan.displayName,
          planName: planLabel,
          expiresAt: sub.endDate!,
          upgradePlanUrl: `${appUrl()}/portal/orfebre/plan`,
        });
        await prisma.membershipSubscription.update({
          where: { id: sub.id },
          data: { gracePeriodNotified: true },
        });
        results.preExpirationNotified++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.errors.push(`pre-expiration ${sub.id}: ${msg}`);
      }
    }

    // ── PASO 1: Suscripciones ACTIVE que expiran hoy → GRACE_PERIOD ──
    const expiringToday = await prisma.membershipSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: now },
        plan: { price: { gt: 0 } },
      },
      include: {
        plan: true,
        artisan: { include: { user: { select: { email: true } } } },
      },
    });

    for (const sub of expiringToday) {
      try {
        // Check if this is a paid subscription that should go through normal renewal flow
        // vs a promo subscription that goes directly to grace period
        if (sub.source === "PROMO_CODE" || sub.source === "ADMIN") {
          // Promo/admin subs go to grace period immediately
          const graceEndsAt = new Date(now);
          graceEndsAt.setDate(graceEndsAt.getDate() + 7);

          await prisma.membershipSubscription.update({
            where: { id: sub.id },
            data: { status: "GRACE_PERIOD", graceEndsAt },
          });

          const activeProducts = await prisma.product.count({
            where: { artisanId: sub.artisanId, status: "APPROVED" },
          });

          const essentialPlan = await prisma.membershipPlan.findFirst({
            where: { name: "esencial" },
          });

          await sendGracePeriodEmail(sub.artisan.user.email, {
            artisanName: sub.artisan.displayName,
            currentProducts: activeProducts,
            newLimit: essentialPlan?.maxProducts ?? 10,
            graceEndsAt,
            manageUrl: `${appUrl()}/portal/orfebre/gestionar-productos`,
            upgradePlanUrl: `${appUrl()}/portal/orfebre/plan`,
            wasPromoCode: sub.source === "PROMO_CODE",
          });

          results.movedToGrace++;
        } else {
          // Payment-based subs go through the existing renewal reminder flow
          const endDate = sub.endDate!;
          const daysSinceExpiry = Math.floor(
            (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const planLabel = sub.plan.name.charAt(0).toUpperCase() + sub.plan.name.slice(1);

          if (daysSinceExpiry >= 10) {
            // Move to grace period instead of immediate downgrade
            const graceEndsAt = new Date(now);
            graceEndsAt.setDate(graceEndsAt.getDate() + 7);

            await prisma.membershipSubscription.update({
              where: { id: sub.id },
              data: { status: "GRACE_PERIOD", graceEndsAt },
            });

            const activeProducts = await prisma.product.count({
              where: { artisanId: sub.artisanId, status: "APPROVED" },
            });

            const essentialPlan = await prisma.membershipPlan.findFirst({
              where: { name: "esencial" },
            });

            await sendGracePeriodEmail(sub.artisan.user.email, {
              artisanName: sub.artisan.displayName,
              currentProducts: activeProducts,
              newLimit: essentialPlan?.maxProducts ?? 10,
              graceEndsAt,
              manageUrl: `${appUrl()}/portal/orfebre/gestionar-productos`,
              upgradePlanUrl: `${appUrl()}/portal/orfebre/plan`,
              wasPromoCode: false,
            });

            results.movedToGrace++;
          } else if (daysSinceExpiry >= 3) {
            const paymentUrl = await getOrCreatePaymentUrl(sub, sub.artisanId, planLabel);
            await sendSubscriptionReminderEmail(sub.artisan.user.email, {
              artisanName: sub.artisan.displayName,
              planName: planLabel,
              amount: sub.plan.price,
              paymentUrl,
              daysOverdue: daysSinceExpiry,
            });
            results.remindersSent++;
          } else {
            const paymentUrl = await getOrCreatePaymentUrl(sub, sub.artisanId, planLabel);
            await sendSubscriptionRenewalEmail(sub.artisan.user.email, {
              artisanName: sub.artisan.displayName,
              planName: planLabel,
              amount: sub.plan.price,
              paymentUrl,
            });
            results.renewalsSent++;
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[renew-sub] Error processing sub ${sub.id}:`, msg);
        results.errors.push(`sub ${sub.id}: ${msg}`);
      }
    }

    // ── PASO 2: Grace periods que terminaron → ejecutar downgrade ──
    const expiredGrace = await prisma.membershipSubscription.findMany({
      where: {
        status: "GRACE_PERIOD",
        graceEndsAt: { lte: now },
      },
      include: {
        plan: true,
        artisan: { include: { user: { select: { email: true } } } },
      },
    });

    for (const sub of expiredGrace) {
      try {
        const result = await executeDowngrade(sub.artisanId, sub.id);
        await sendDowngradeCompletedEmail(sub.artisan.user.email, {
          artisanName: sub.artisan.displayName,
          pausedCount: result.pausedCount,
          activeCount: result.activeCount,
          upgradePlanUrl: `${appUrl()}/portal/orfebre/plan`,
        });
        results.degraded++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[renew-sub] Downgrade error ${sub.id}:`, msg);
        results.errors.push(`downgrade ${sub.id}: ${msg}`);
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("[renew-sub] Fatal error:", error);
    return NextResponse.json({ success: false, error: "Internal error" });
  }
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl").replace(/\/$/, "");
}

async function getOrCreatePaymentUrl(
  sub: { id: string; startDate: Date; endDate: Date | null; plan: { price: number; annualPrice: number | null; name: string } },
  artisanId: string,
  planLabel: string
): Promise<string> {
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
