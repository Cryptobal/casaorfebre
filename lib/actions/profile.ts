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
    },
  });

  revalidatePath("/portal/orfebre/perfil");
  revalidatePath(`/orfebres/${artisan.slug}`);
  return { success: true };
}

export async function updateProfileImage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Archivo requerido" };

  const ext = file.name.split(".").pop() || "jpg";
  const key = `artisans/${artisan.id}/profile.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToR2(buffer, key, file.type);

  await prisma.artisan.update({
    where: { id: artisan.id },
    data: { profileImage: url },
  });

  revalidatePath("/portal/orfebre/perfil");
  return { success: true };
}
