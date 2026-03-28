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

  await prisma.artisan.update({
    where: { id: artisan.id },
    data: {
      displayName: formData.get("displayName") as string || artisan.displayName,
      bio: formData.get("bio") as string || artisan.bio,
      story: (formData.get("story") as string) || null,
      specialty: formData.get("specialty") as string || artisan.specialty,
      materials: (formData.get("materials") as string)?.split(",").map(m => m.trim()).filter(Boolean) || artisan.materials,
      location: formData.get("location") as string || artisan.location,
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
    return { success: true };
  } catch (e) {
    console.error("[updateProfileImage] Error:", e);
    return { error: "Error al subir la imagen. Intenta de nuevo." };
  }
}
