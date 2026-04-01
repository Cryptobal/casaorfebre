"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";

export async function updateArtisanProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  // Specialty IDs from catalog
  const specialtyIdsRaw = formData.get("specialtyIds") as string;
  const specialtyIds = specialtyIdsRaw
    ? specialtyIdsRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  // Custom specialties (stored in the specialty text field)
  const customSpecialty = (formData.get("specialty") as string) || "";

  await prisma.artisan.update({
    where: { id: artisan.id },
    data: {
      displayName: formData.get("displayName") as string || artisan.displayName,
      bio: formData.get("bio") as string || artisan.bio,
      story: (formData.get("story") as string) || null,
      specialty: customSpecialty,
      specialties: { set: specialtyIds.map((id) => ({ id })) },
      materials: (formData.get("materials") as string)?.split(",").map(m => m.trim()).filter(Boolean) || artisan.materials,
      location: formData.get("location") as string || artisan.location,
      region: (formData.get("region") as string) || artisan.region,
      videoUrl: (formData.get("videoUrl") as string) || null,
      yearsExperience: formData.get("yearsExperience") ? parseInt(formData.get("yearsExperience") as string, 10) : null,
      awards: (formData.get("awards") as string)?.split("|||").filter(Boolean) || [],
    },
  });

  revalidatePath("/portal/orfebre/perfil");
  revalidatePath(`/orfebres/${artisan.slug}`);
  return { success: true };
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function updateProfileImage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Archivo requerido" };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Formato no soportado. Usa JPG, PNG o WebP." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "La imagen no debe superar los 5 MB." };
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `artisans/${artisan.id}/profile.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, key, file.type);

    console.log("[updateProfileImage] artisanId:", artisan.id, "url:", url);

    await prisma.artisan.update({
      where: { id: artisan.id },
      data: { profileImage: url },
    });

    // Verify it was saved
    const check = await prisma.artisan.findUnique({ where: { id: artisan.id }, select: { profileImage: true } });
    console.log("[updateProfileImage] saved in DB:", check?.profileImage);

    revalidatePath("/portal/orfebre/perfil");
    revalidatePath("/");
    revalidatePath("/orfebres");
    revalidatePath(`/orfebres/${artisan.slug}`);
    return { success: true };
  } catch (e) {
    console.error("[updateProfileImage] Error:", e);
    return { error: "Error al subir la imagen. Intenta de nuevo." };
  }
}

const RUT_PATTERN = /^\d{7,8}-[\dkK]$/;

export async function updateBankingData(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "Orfebre no encontrado" };

  const bankRut = formData.get("bankRut") as string;
  const bankHolderName = formData.get("bankHolderName") as string;
  const bankName = formData.get("bankName") as string;
  const bankAccountType = formData.get("bankAccountType") as string;
  const bankAccountNumber = formData.get("bankAccountNumber") as string;

  if (!bankRut || !bankHolderName || !bankName || !bankAccountType || !bankAccountNumber) {
    return { error: "Todos los campos bancarios son requeridos" };
  }

  // Validate RUT format: 7-8 digits, dash, 1 digit or K. No dots.
  if (!RUT_PATTERN.test(bankRut.trim())) {
    return { error: "RUT inválido. Formato: 12345678-9 (sin puntos, con guión)" };
  }

  await prisma.artisan.update({
    where: { id: artisan.id },
    data: {
      bankRut: bankRut.trim(),
      bankHolderName: bankHolderName.trim(),
      bankName,
      bankAccountType,
      bankAccountNumber: bankAccountNumber.trim(),
      bankDataUpdatedAt: new Date(),
    },
  });

  revalidatePath("/portal/orfebre/perfil");
  return { success: true };
}
