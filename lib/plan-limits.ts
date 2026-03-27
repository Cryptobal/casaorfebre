import { prisma } from "@/lib/prisma";

interface PlanLimits {
  maxProducts: number; // 0 = unlimited
  maxPhotosPerProduct: number; // 0 = unlimited
  planName: string;
  nextPlanName: string | null;
}

const PLAN_UPGRADE_MAP: Record<string, string> = {
  esencial: "Artesano",
  artesano: "Maestro",
};

/**
 * Get the effective plan limits for an artisan, considering overrides.
 * Returns null if the artisan has no active subscription (defaults to esencial limits).
 */
export async function getArtisanPlanLimits(artisanId: string): Promise<PlanLimits> {
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!artisan) {
    throw new Error("Artisan not found");
  }

  // Get the active plan, or default to esencial
  const activeSub = artisan.subscriptions[0];
  const activePlan = activeSub?.plan;

  const esencialDefaults = { name: "esencial", maxProducts: 10, maxPhotosPerProduct: 3 };

  const planName = activePlan?.name || esencialDefaults.name;
  const planMaxProducts = activePlan?.maxProducts ?? esencialDefaults.maxProducts;
  const planMaxPhotos = activePlan?.maxPhotosPerProduct ?? esencialDefaults.maxPhotosPerProduct;

  const maxProducts = artisan.maxProductsOverride ?? planMaxProducts;
  const maxPhotosPerProduct = artisan.maxPhotosOverride ?? planMaxPhotos;

  return {
    maxProducts,
    maxPhotosPerProduct,
    planName,
    nextPlanName: PLAN_UPGRADE_MAP[planName] || null,
  };
}
