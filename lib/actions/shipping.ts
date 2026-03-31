"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("No autorizado");
  return session.user;
}

export async function updateShippingZone(
  zoneId: string,
  data: { name?: string; price?: number; estimatedDays?: string; regions?: string[]; isActive?: boolean }
) {
  await requireAdmin();
  await prisma.shippingZone.update({
    where: { id: zoneId },
    data: {
      ...data,
      ...(data.name ? { slug: slugify(data.name) } : {}),
    },
  });
  revalidatePath("/portal/admin/despacho");
  return { success: true };
}

export async function createShippingZone(data: {
  name: string;
  price: number;
  estimatedDays: string;
  regions: string[];
}) {
  await requireAdmin();
  const maxPosition = await prisma.shippingZone.aggregate({ _max: { position: true } });
  await prisma.shippingZone.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      price: data.price,
      estimatedDays: data.estimatedDays,
      regions: data.regions,
      position: (maxPosition._max.position ?? 0) + 1,
    },
  });
  revalidatePath("/portal/admin/despacho");
  return { success: true };
}

export async function deleteShippingZone(zoneId: string) {
  await requireAdmin();
  await prisma.shippingZone.delete({ where: { id: zoneId } });
  revalidatePath("/portal/admin/despacho");
  return { success: true };
}

export async function updateShippingSettings(data: {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
}) {
  await requireAdmin();
  await prisma.shippingSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  revalidatePath("/portal/admin/despacho");
  return { success: true };
}
