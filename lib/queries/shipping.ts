import { prisma } from "@/lib/prisma";

export async function getShippingZones() {
  return prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
}

export async function getAllShippingZones() {
  return prisma.shippingZone.findMany({
    orderBy: { position: "asc" },
  });
}

export async function getShippingSettings() {
  const settings = await prisma.shippingSettings.findUnique({
    where: { id: "default" },
  });
  return settings ?? { freeShippingEnabled: true, freeShippingThreshold: 100000 };
}

export async function getShippingZoneByRegion(region: string) {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
  });
  return zones.find((z) => z.regions.includes(region)) ?? null;
}

export async function calculateShippingCost(region: string, subtotal: number) {
  const [zone, settings] = await Promise.all([
    getShippingZoneByRegion(region),
    getShippingSettings(),
  ]);

  if (!zone) {
    return { error: "Lo sentimos, actualmente no realizamos envíos a esta región" };
  }

  const isFreeShipping = settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold;

  return {
    cost: isFreeShipping ? 0 : zone.price,
    zoneName: zone.name,
    estimatedDays: zone.estimatedDays,
    isFreeShipping,
    freeShippingThreshold: settings.freeShippingThreshold,
    freeShippingEnabled: settings.freeShippingEnabled,
  };
}
