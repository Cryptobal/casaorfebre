"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { executeDowngrade } from "@/lib/membership/downgrade";
import { revalidatePath } from "next/cache";

/**
 * Saves the artisan's product selection during grace period.
 * Selected products stay ACTIVE, unselected ones become PAUSED.
 * If in GRACE_PERIOD, triggers immediate downgrade to Esencial.
 */
export async function saveProductSelection(
  activeProductIds: string[]
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: { in: ["ACTIVE", "GRACE_PERIOD"] } },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!artisan) return { error: "Orfebre no encontrado" };

  const currentSub = artisan.subscriptions[0];
  if (!currentSub) return { error: "No tienes una suscripción activa" };

  // Determine the target plan limit (Esencial if in grace period)
  const targetPlan =
    currentSub.status === "GRACE_PERIOD"
      ? await prisma.membershipPlan.findFirst({ where: { name: "esencial" } })
      : currentSub.plan;

  const maxProducts = targetPlan?.maxProducts ?? 10;

  if (activeProductIds.length > maxProducts) {
    return {
      error: `Solo puedes mantener ${maxProducts} productos activos con tu plan`,
    };
  }

  // Validate all product IDs belong to this artisan
  const products = await prisma.product.findMany({
    where: {
      artisanId: artisan.id,
      status: { in: ["APPROVED", "PAUSED"] },
    },
    select: { id: true },
  });

  const ownedIds = new Set(products.map((p) => p.id));
  for (const id of activeProductIds) {
    if (!ownedIds.has(id)) {
      return { error: "Uno o más productos no te pertenecen" };
    }
  }

  const activeSet = new Set(activeProductIds);
  const toKeepActive = products.filter((p) => activeSet.has(p.id)).map((p) => p.id);
  const toPause = products.filter((p) => !activeSet.has(p.id)).map((p) => p.id);

  await prisma.$transaction(async (tx) => {
    // Reactivate selected products
    if (toKeepActive.length > 0) {
      await tx.product.updateMany({
        where: { id: { in: toKeepActive } },
        data: { status: "APPROVED", pauseReason: null, pausedAt: null },
      });
    }

    // Pause unselected products
    if (toPause.length > 0) {
      await tx.product.updateMany({
        where: { id: { in: toPause } },
        data: { status: "PAUSED", pauseReason: "DOWNGRADE", pausedAt: new Date() },
      });
    }
  });

  // If in grace period, complete the downgrade immediately
  if (currentSub.status === "GRACE_PERIOD") {
    const essentialPlan = await prisma.membershipPlan.findFirst({
      where: { name: "esencial" },
    });

    // Mark subscription as expired
    await prisma.membershipSubscription.update({
      where: { id: currentSub.id },
      data: { status: "EXPIRED" },
    });

    // Create Esencial subscription
    if (essentialPlan) {
      await prisma.membershipSubscription.create({
        data: {
          artisanId: artisan.id,
          planId: essentialPlan.id,
          status: "ACTIVE",
          startDate: new Date(),
          source: "DEFAULT",
        },
      });
    }

    // Reset commission
    await prisma.artisan.update({
      where: { id: artisan.id },
      data: { commissionRate: 0.18, commissionOverride: null },
    });
  }

  revalidatePath("/portal/orfebre/gestionar-productos");
  revalidatePath("/portal/orfebre/productos");
  revalidatePath("/portal/orfebre");
  return { success: true };
}
