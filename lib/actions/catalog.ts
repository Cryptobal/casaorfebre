"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") throw new Error("No autorizado");
  return session.user.id;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- Categories ---

export async function createCategory(name: string) {
  await requireAdmin();
  const slug = slugify(name);
  const maxPos = await prisma.category.aggregate({
    _max: { position: true },
  });
  await prisma.category.create({
    data: { name, slug, position: (maxPos._max.position ?? 0) + 1 },
  });
  revalidatePath("/portal/admin/catalogo");
}

export async function updateCategory(
  id: string,
  data: { name?: string; isActive?: boolean; position?: number }
) {
  await requireAdmin();
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = slugify(data.name);
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.position !== undefined) updateData.position = data.position;
  await prisma.category.update({ where: { id }, data: updateData });
  revalidatePath("/portal/admin/catalogo");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/portal/admin/catalogo");
}

// --- Materials ---

export async function createMaterial(name: string) {
  await requireAdmin();
  const maxPos = await prisma.material.aggregate({
    _max: { position: true },
  });
  await prisma.material.create({
    data: { name, position: (maxPos._max.position ?? 0) + 1 },
  });
  revalidatePath("/portal/admin/catalogo");
}

export async function updateMaterial(
  id: string,
  data: { name?: string; isActive?: boolean; position?: number }
) {
  await requireAdmin();
  await prisma.material.update({ where: { id }, data });
  revalidatePath("/portal/admin/catalogo");
}

export async function deleteMaterial(id: string) {
  await requireAdmin();
  await prisma.material.delete({ where: { id } });
  revalidatePath("/portal/admin/catalogo");
}
