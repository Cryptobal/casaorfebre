"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateReferralCode(name?: string | null): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  // First 3 letters of name (uppercase, no accents), padded if short
  const clean = (name || "USR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
  const prefix = (clean + "XXX").slice(0, 3);
  let suffix = "";
  for (let i = 0; i < 4; i++)
    suffix += chars[Math.floor(Math.random() * chars.length)];
  return prefix + suffix;
}

export async function generateUniqueReferralCode(
  name?: string | null,
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateReferralCode(name);
    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  // Fallback: purely random 7-char code
  return generateReferralCode(null);
}

export async function getOrCreateReferralCode(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true, name: true },
  });
  if (user?.referralCode) return user.referralCode;

  const code = await generateUniqueReferralCode(user?.name);
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

function generateRewardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "REF-";
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/**
 * Called when an order is paid. If the buyer was referred,
 * creates a ReferralReward for the referrer.
 */
export async function createReferralRewardIfApplicable(
  buyerId: string,
): Promise<void> {
  const buyer = await prisma.user.findUnique({
    where: { id: buyerId },
    select: { id: true, name: true, referredBy: true },
  });
  if (!buyer?.referredBy) return;

  // Only reward on the buyer's FIRST paid order
  const paidOrderCount = await prisma.order.count({
    where: { userId: buyerId, status: "PAID" },
  });
  if (paidOrderCount > 1) return; // Already had a previous paid order

  // Check if reward already exists for this pair
  const existingReward = await prisma.referralReward.findFirst({
    where: { referrerId: buyer.referredBy, referredId: buyerId },
  });
  if (existingReward) return;

  // Generate unique reward code
  let code = generateRewardCode();
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.referralReward.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!exists) break;
    code = generateRewardCode();
  }

  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

  await prisma.referralReward.create({
    data: {
      referrerId: buyer.referredBy,
      referredId: buyerId,
      rewardType: "DISCOUNT",
      rewardAmount: 5000,
      code,
      status: "ACTIVATED",
      activatedAt: new Date(),
      expiresAt,
    },
  });

  // Send email to referrer
  const referrer = await prisma.user.findUnique({
    where: { id: buyer.referredBy },
    select: { email: true, name: true },
  });
  if (referrer?.email) {
    try {
      const { sendReferralRewardEmail } = await import("@/lib/emails/templates");
      await sendReferralRewardEmail(referrer.email, {
        referrerName: referrer.name || "Amigo/a",
        referredName: buyer.name || "Tu amigo/a",
        rewardAmount: 5000,
        discountCode: code,
        expiresAt,
      });
    } catch (e) {
      console.error("Referral reward email failed:", e);
    }
  }
}

/**
 * Validates a discount code and returns the reward if valid.
 */
export async function validateDiscountCode(code: string) {
  const reward = await prisma.referralReward.findUnique({
    where: { code },
  });
  if (!reward) return { valid: false, error: "Código no encontrado" };
  if (reward.status === "USED") return { valid: false, error: "Este código ya fue utilizado" };
  if (reward.status === "EXPIRED") return { valid: false, error: "Este código ha expirado" };
  if (reward.status !== "ACTIVATED") return { valid: false, error: "Código no válido" };
  if (new Date() > reward.expiresAt) {
    // Mark as expired
    await prisma.referralReward.update({
      where: { id: reward.id },
      data: { status: "EXPIRED" },
    });
    return { valid: false, error: "Este código ha expirado" };
  }
  return { valid: true, reward };
}

/**
 * Marks a reward as used after a successful purchase.
 */
export async function markRewardAsUsed(
  rewardId: string,
  orderId: string,
): Promise<void> {
  await prisma.referralReward.update({
    where: { id: rewardId },
    data: {
      status: "USED",
      usedAt: new Date(),
      orderId,
    },
  });
}
