"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function getOrCreateReferralCode(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  const code = generateReferralCode();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { referralCode: code },
  });
  return code;
}

export async function trackReferral(
  referralCode: string,
  newUserId: string,
) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
  });
  if (referrer) {
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id },
    });
  }
}
