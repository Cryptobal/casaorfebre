"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserAddresses() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.shippingAddress.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}

export async function createShippingAddress(data: {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  commune: string;
  city: string;
  region: string;
  postalCode?: string;
  isDefault?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // If first address, make it default
  const count = await prisma.shippingAddress.count({
    where: { userId: session.user.id },
  });
  const isDefault = count === 0 || data.isDefault === true;

  if (isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.shippingAddress.create({
    data: {
      userId: session.user.id,
      label: data.label,
      fullName: data.fullName,
      phone: data.phone,
      street: data.street,
      apartment: data.apartment || null,
      commune: data.commune,
      city: data.city,
      region: data.region,
      postalCode: data.postalCode || null,
      isDefault,
    },
  });

  revalidatePath("/portal/comprador/perfil");
  return { success: true, id: address.id };
}

export async function updateShippingAddress(
  id: string,
  data: {
    label?: string;
    fullName?: string;
    phone?: string;
    street?: string;
    apartment?: string;
    commune?: string;
    city?: string;
    region?: string;
    postalCode?: string;
  },
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Dirección no encontrada" };

  await prisma.shippingAddress.update({ where: { id }, data });

  revalidatePath("/portal/comprador/perfil");
  return { success: true };
}

export async function deleteShippingAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Dirección no encontrada" };

  await prisma.shippingAddress.delete({ where: { id } });

  // If it was default, make the next one default
  if (existing.isDefault) {
    const next = await prisma.shippingAddress.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
    if (next) {
      await prisma.shippingAddress.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/portal/comprador/perfil");
  return { success: true };
}

export async function setDefaultAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Dirección no encontrada" };

  await prisma.shippingAddress.updateMany({
    where: { userId: session.user.id, isDefault: true },
    data: { isDefault: false },
  });

  await prisma.shippingAddress.update({
    where: { id },
    data: { isDefault: true },
  });

  revalidatePath("/portal/comprador/perfil");
  return { success: true };
}
