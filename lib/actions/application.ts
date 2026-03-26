"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitApplication(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const location = formData.get("location") as string;
  const specialty = formData.get("specialty") as string;
  const bio = formData.get("bio") as string;
  const materialsRaw = formData.get("materials") as string;
  const experience = (formData.get("experience") as string) || null;
  const portfolioUrl = (formData.get("portfolioUrl") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  if (!name || !email || !location || !specialty || !bio || !materialsRaw) {
    return { error: "Todos los campos marcados son requeridos" };
  }

  if (!email.includes("@")) {
    return { error: "Email no válido" };
  }

  const materials = materialsRaw
    .split(",")
    .map((m: string) => m.trim())
    .filter(Boolean);

  if (materials.length === 0) {
    return { error: "Indica al menos un material con el que trabajas" };
  }

  // Check for existing pending application
  const existing = await prisma.artisanApplication.findFirst({
    where: { email, status: "PENDING" },
  });
  if (existing) {
    return { error: "Ya tienes una postulación pendiente de revisión" };
  }

  await prisma.artisanApplication.create({
    data: {
      name,
      email,
      location,
      specialty,
      bio,
      materials,
      experience,
      portfolioUrl,
      phone,
      portfolioImages: [],
      status: "PENDING",
    },
  });

  revalidatePath("/portal/admin/postulaciones");
  return { success: true };
}
