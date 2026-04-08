"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateArtisanConsent(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, consentMarketing: true, consentSocialMedia: true },
  });

  if (!artisan) {
    return { error: "No se encontró cuenta de orfebre" };
  }

  const consentMarketing = formData.get("consentMarketing") === "on";
  const consentSocialMedia = formData.get("consentSocialMedia") === "on";

  const now = new Date();

  await prisma.artisan.update({
    where: { id: artisan.id },
    data: {
      consentMarketing,
      consentMarketingAt:
        consentMarketing !== artisan.consentMarketing ? now : undefined,
      consentSocialMedia,
      consentSocialMediaAt:
        consentSocialMedia !== artisan.consentSocialMedia ? now : undefined,
    },
  });

  revalidatePath("/portal/orfebre/privacidad");
  return { success: true };
}

export async function updateBuyerConsent(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  const consentMarketing = formData.get("consentMarketing") === "on";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { consentMarketing: true },
  });

  if (!user) return { error: "No se encontró usuario" };

  const now = new Date();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      consentMarketing,
      consentMarketingAt:
        consentMarketing !== user.consentMarketing ? now : undefined,
    },
  });

  revalidatePath("/portal/comprador/privacidad");
  return { success: true };
}
