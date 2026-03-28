import { prisma } from "@/lib/prisma";

/**
 * Executes the downgrade of an artisan from their current plan to Esencial.
 * - Marks current subscription as EXPIRED
 * - Creates a new Esencial subscription
 * - Pauses excess products (keeps the best-performing ones)
 * - Resets commission to 18%
 *
 * Returns the count of active and paused products after downgrade.
 */
export async function executeDowngrade(
  artisanId: string,
  subscriptionId: string
): Promise<{ pausedCount: number; activeCount: number }> {
  const essentialPlan = await prisma.membershipPlan.findFirst({
    where: { name: "esencial" },
  });

  const maxProducts = essentialPlan?.maxProducts ?? 10;

  // Get all active (APPROVED) products, ordered by performance
  const activeProducts = await prisma.product.findMany({
    where: { artisanId, status: "APPROVED" },
    orderBy: [
      { viewCount: "desc" },
      { createdAt: "asc" },
    ],
  });

  let pausedCount = 0;

  if (activeProducts.length > maxProducts) {
    const productsToPause = activeProducts.slice(maxProducts);
    pausedCount = productsToPause.length;

    await prisma.product.updateMany({
      where: {
        id: { in: productsToPause.map((p) => p.id) },
      },
      data: {
        status: "PAUSED",
        pauseReason: "DOWNGRADE",
        pausedAt: new Date(),
      },
    });
  }

  // Mark subscription as expired
  await prisma.membershipSubscription.update({
    where: { id: subscriptionId },
    data: { status: "EXPIRED" },
  });

  // Create Esencial subscription
  if (essentialPlan) {
    await prisma.membershipSubscription.create({
      data: {
        artisanId,
        planId: essentialPlan.id,
        status: "ACTIVE",
        startDate: new Date(),
        source: "DEFAULT",
      },
    });
  }

  // Reset commission to 18% and clear any override
  await prisma.artisan.update({
    where: { id: artisanId },
    data: {
      commissionRate: 0.18,
      commissionOverride: null,
    },
  });

  const activeCount = Math.min(activeProducts.length, maxProducts);

  return { pausedCount, activeCount };
}
