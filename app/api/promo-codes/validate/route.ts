import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ valid: false, reason: "not_found" });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (!promo) {
    return NextResponse.json({ valid: false, reason: "not_found" });
  }

  if (!promo.isActive) {
    return NextResponse.json({ valid: false, reason: "inactive" });
  }

  if (promo.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, reason: "expired" });
  }

  if (promo.currentUses >= promo.maxUses) {
    return NextResponse.json({ valid: false, reason: "used" });
  }

  // Fetch the plan to show benefits
  const plan = await prisma.membershipPlan.findFirst({
    where: { name: { equals: promo.planName, mode: "insensitive" } },
  });

  const freeMonths = Math.round(promo.durationDays / 30);
  const totalValue = plan ? plan.price * freeMonths : 0;

  return NextResponse.json({
    valid: true,
    planName: promo.planName,
    durationDays: promo.durationDays,
    campaign: promo.campaign,
    benefits: {
      planDisplayName: plan
        ? plan.name.charAt(0).toUpperCase() + plan.name.slice(1)
        : promo.planName,
      price: plan
        ? new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
          }).format(plan.price) + "/mes"
        : "",
      freeMonths,
      totalValue: plan
        ? new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
          }).format(totalValue)
        : "",
    },
  });
}
