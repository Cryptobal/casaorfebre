"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordAcceptance } from "@/lib/legal/queries";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function acceptSellerAgreement(): Promise<{
  error?: string;
  success?: boolean;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autenticado" };
  }

  // Verify user is an artisan
  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!artisan) {
    return { error: "No eres un orfebre registrado" };
  }

  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    null;
  const userAgent = headersList.get("user-agent") || null;

  await recordAcceptance({
    userId: session.user.id,
    documentType: "SELLER_AGREEMENT",
    ipAddress,
    userAgent,
    method: "CLICK_WRAP",
  });

  revalidatePath("/portal/orfebre");
  return { success: true };
}
