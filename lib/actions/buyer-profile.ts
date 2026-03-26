"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateBuyerProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "El nombre es requerido" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  revalidatePath("/portal/comprador/perfil");
  return { success: true };
}

export async function updateShippingAddress(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autenticado" };

  const shippingName = (formData.get("shippingName") as string)?.trim();
  const shippingAddress = (formData.get("shippingAddress") as string)?.trim();
  const shippingCity = (formData.get("shippingCity") as string)?.trim();
  const shippingRegion = (formData.get("shippingRegion") as string)?.trim();
  const shippingPostalCode = (formData.get("shippingPostalCode") as string)?.trim() || null;
  const shippingPhone = (formData.get("shippingPhone") as string)?.trim() || null;

  if (!shippingName || !shippingAddress || !shippingCity || !shippingRegion) {
    return { error: "Nombre, dirección, ciudad y región son requeridos" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      shippingName,
      shippingAddress,
      shippingCity,
      shippingRegion,
      shippingPostalCode,
      shippingPhone,
    },
  });

  revalidatePath("/portal/comprador/perfil");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword) return { error: "Todos los campos son requeridos" };
  if (newPassword.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
  if (newPassword !== confirmPassword) return { error: "Las contraseñas no coinciden" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.hashedPassword) return { error: "Tu cuenta usa inicio de sesión con Google" };

  const valid = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!valid) return { error: "La contraseña actual es incorrecta" };

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword: hashed },
  });

  return { success: true };
}
