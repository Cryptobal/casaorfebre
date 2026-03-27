"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createSubscriptionPreference } from "@/lib/subscription-payment";

async function requireArtisan() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!artisan || artisan.status !== "APPROVED") {
    throw new Error("No autorizado");
  }

  return artisan;
}

export async function changePlan(
  newPlanId: string,
  billingPeriod: "monthly" | "annual" = "monthly"
): Promise<{ error?: string; success?: boolean; summary?: string; redirectUrl?: string }> {
  let artisan;
  try {
    artisan = await requireArtisan();
  } catch {
    return { error: "No autorizado" };
  }

  const newPlan = await prisma.membershipPlan.findUnique({
    where: { id: newPlanId, isActive: true },
  });
  if (!newPlan) return { error: "Plan no encontrado" };

  const currentSub = artisan.subscriptions[0];
  const currentPlan = currentSub?.plan;

  if (currentPlan?.id === newPlanId) {
    return { error: "Ya tienes este plan activo" };
  }

  const activeProductCount = await prisma.product.count({
    where: { artisanId: artisan.id, status: "APPROVED" },
  });

  const PLAN_ORDER: Record<string, number> = {
    esencial: 0,
    artesano: 1,
    maestro: 2,
  };

  const isUpgrade =
    (PLAN_ORDER[newPlan.name] ?? 99) > (PLAN_ORDER[currentPlan?.name ?? ""] ?? -1);

  const isDowngrade =
    currentPlan && newPlan.maxProducts > 0 && newPlan.maxProducts < (currentPlan.maxProducts || Infinity);

  // ── UPGRADE: requires payment first ──
  if (isUpgrade && newPlan.price > 0) {
    const amount =
      billingPeriod === "annual" && newPlan.annualPrice
        ? newPlan.annualPrice
        : newPlan.price;

    // Create a PENDING subscription that will be activated on payment
    const pendingSub = await prisma.membershipSubscription.create({
      data: {
        artisanId: artisan.id,
        planId: newPlanId,
        status: "CANCELLED", // Will become ACTIVE on payment confirmation
        startDate: new Date(),
      },
    });

    try {
      const { redirectUrl } = await createSubscriptionPreference({
        artisanId: artisan.id,
        subscriptionId: pendingSub.id,
        planName: newPlan.name.charAt(0).toUpperCase() + newPlan.name.slice(1),
        amount,
        billingPeriod,
      });

      return { success: true, redirectUrl };
    } catch (e) {
      // Clean up pending subscription on failure
      await prisma.membershipSubscription.delete({
        where: { id: pendingSub.id },
      });
      console.error("[membership] Preference creation failed:", e);
      return { error: "Error al crear el pago. Intenta nuevamente." };
    }
  }

  // ── DOWNGRADE or FREE plan: apply immediately ──

  // If downgrading and over the new limit, pause excess products
  let pausedCount = 0;
  if (isDowngrade && newPlan.maxProducts > 0 && activeProductCount > newPlan.maxProducts) {
    const excessCount = activeProductCount - newPlan.maxProducts;

    // Pause the most recently published products first (keep the oldest/most established)
    const productsToPause = await prisma.product.findMany({
      where: { artisanId: artisan.id, status: "APPROVED" },
      orderBy: { publishedAt: "desc" },
      take: excessCount,
      select: { id: true },
    });

    await prisma.product.updateMany({
      where: { id: { in: productsToPause.map((p) => p.id) } },
      data: { status: "PAUSED" },
    });

    pausedCount = productsToPause.length;
  }

  // Cancel current subscription if exists
  if (currentSub) {
    await prisma.membershipSubscription.update({
      where: { id: currentSub.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  }

  // Create new subscription
  await prisma.membershipSubscription.create({
    data: {
      artisanId: artisan.id,
      planId: newPlanId,
      status: "ACTIVE",
      startDate: new Date(),
    },
  });

  // Update commission rate (unless artisan has an override)
  if (artisan.commissionOverride === null) {
    await prisma.artisan.update({
      where: { id: artisan.id },
      data: { commissionRate: newPlan.commissionRate },
    });
  }

  revalidatePath("/portal/orfebre");
  revalidatePath("/portal/orfebre/plan");

  let summary = `Plan cambiado a ${newPlan.name}.`;
  if (pausedCount > 0) {
    summary += ` Se pausaron ${pausedCount} producto${pausedCount > 1 ? "s" : ""} que excedían el nuevo límite.`;
  }

  return { success: true, summary };
}
