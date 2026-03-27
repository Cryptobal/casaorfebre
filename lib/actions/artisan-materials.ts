"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getArtisan() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan || artisan.status !== "APPROVED") return null;
  return artisan;
}

export async function getArtisanMaterials() {
  const artisan = await getArtisan();
  if (!artisan) return [];

  return prisma.artisanMaterial.findMany({
    where: { artisanId: artisan.id },
    orderBy: { name: "asc" },
  });
}

export async function getReferencePrices() {
  return prisma.materialPrice.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getArtisanCommissionRate(): Promise<number> {
  const artisan = await getArtisan();
  if (!artisan) return 0.18;
  return artisan.commissionOverride ?? artisan.commissionRate;
}

export async function importReferencePrices(): Promise<{ error?: string; success?: boolean; count?: number }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const referencePrices = await prisma.materialPrice.findMany();

  let imported = 0;
  for (const ref of referencePrices) {
    await prisma.artisanMaterial.upsert({
      where: {
        artisanId_name: { artisanId: artisan.id, name: ref.name },
      },
      update: { pricePerUnit: ref.pricePerGram, unit: ref.unit },
      create: {
        artisanId: artisan.id,
        name: ref.name,
        pricePerUnit: ref.pricePerGram,
        unit: ref.unit,
        isCustom: false,
      },
    });
    imported++;
  }

  revalidatePath("/portal/orfebre/herramientas/calculadora");
  return { success: true, count: imported };
}

export async function saveArtisanMaterial(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string)?.trim();
  const pricePerUnit = parseInt(formData.get("pricePerUnit") as string, 10);
  const unit = (formData.get("unit") as string) || "gramo";

  if (!name) return { error: "El nombre es requerido" };
  if (isNaN(pricePerUnit) || pricePerUnit < 1) return { error: "El precio debe ser mayor a 0" };

  if (id) {
    const existing = await prisma.artisanMaterial.findFirst({
      where: { id, artisanId: artisan.id },
    });
    if (!existing) return { error: "Material no encontrado" };

    await prisma.artisanMaterial.update({
      where: { id },
      data: { name, pricePerUnit, unit, isCustom: true },
    });
  } else {
    const duplicate = await prisma.artisanMaterial.findFirst({
      where: { artisanId: artisan.id, name },
    });
    if (duplicate) return { error: `Ya tienes un material llamado "${name}"` };

    await prisma.artisanMaterial.create({
      data: {
        artisanId: artisan.id,
        name,
        pricePerUnit,
        unit,
        isCustom: true,
      },
    });
  }

  revalidatePath("/portal/orfebre/herramientas/calculadora");
  return { success: true };
}

export async function deleteArtisanMaterial(materialId: string): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const material = await prisma.artisanMaterial.findFirst({
    where: { id: materialId, artisanId: artisan.id },
  });
  if (!material) return { error: "Material no encontrado" };

  await prisma.artisanMaterial.delete({ where: { id: materialId } });

  revalidatePath("/portal/orfebre/herramientas/calculadora");
  return { success: true };
}

// ─── Admin actions ───

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  return session.user.role === "ADMIN";
}

export async function updateMaterialPrice(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "No tienes permisos" };

  const id = formData.get("id") as string;
  const pricePerGram = parseInt(formData.get("pricePerGram") as string, 10);

  if (isNaN(pricePerGram) || pricePerGram < 1) return { error: "El precio debe ser mayor a 0" };

  await prisma.materialPrice.update({
    where: { id },
    data: { pricePerGram },
  });

  revalidatePath("/portal/admin/materiales-precio");
  return { success: true };
}

export async function createMaterialPrice(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "No tienes permisos" };

  const name = (formData.get("name") as string)?.trim();
  const pricePerGram = parseInt(formData.get("pricePerGram") as string, 10);
  const unit = (formData.get("unit") as string) || "gramo";

  if (!name) return { error: "El nombre es requerido" };
  if (isNaN(pricePerGram) || pricePerGram < 1) return { error: "El precio debe ser mayor a 0" };

  const existing = await prisma.materialPrice.findUnique({ where: { name } });
  if (existing) return { error: `Ya existe un material llamado "${name}"` };

  await prisma.materialPrice.create({
    data: { name, pricePerGram, unit },
  });

  revalidatePath("/portal/admin/materiales-precio");
  return { success: true };
}
