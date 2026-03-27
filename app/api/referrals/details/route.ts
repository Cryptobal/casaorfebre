import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Get referred users with their first order status
  const referredUsers = await prisma.user.findMany({
    where: { referredBy: session.user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      orders: {
        where: { status: "PAID" },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get rewards earned (as referrer)
  const rewards = await prisma.referralReward.findMany({
    where: { referrerId: session.user.id },
    select: {
      id: true,
      code: true,
      rewardAmount: true,
      status: true,
      activatedAt: true,
      usedAt: true,
      expiresAt: true,
      referred: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const referrals = referredUsers.map((u) => {
    const reward = rewards.find((r) => r.referred?.name === u.name);
    const hasPurchased = u.orders.length > 0;
    return {
      id: u.id,
      name: u.name || "Usuario",
      date: u.createdAt,
      hasPurchased,
      rewardStatus: reward?.status || null,
    };
  });

  const activeRewards = rewards.filter((r) => r.status === "ACTIVATED");
  const usedRewards = rewards.filter((r) => r.status === "USED");

  return NextResponse.json({
    referrals,
    activeRewards: activeRewards.map((r) => ({
      id: r.id,
      code: r.code,
      amount: r.rewardAmount,
      expiresAt: r.expiresAt,
      referredName: r.referred?.name || "Amigo/a",
    })),
    usedRewards: usedRewards.map((r) => ({
      id: r.id,
      code: r.code,
      amount: r.rewardAmount,
      usedAt: r.usedAt,
      referredName: r.referred?.name || "Amigo/a",
    })),
  });
}
