import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateDiscountCode } from "@/lib/actions/referral";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { code } = await request.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false, error: "Código requerido" });
  }

  const result = await validateDiscountCode(code.trim().toUpperCase());

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error });
  }

  // Ensure the reward belongs to this user (the referrer)
  if (result.reward!.referrerId !== session.user.id) {
    return NextResponse.json({ valid: false, error: "Este código no pertenece a tu cuenta" });
  }

  return NextResponse.json({
    valid: true,
    discountAmount: result.reward!.rewardAmount,
    rewardId: result.reward!.id,
  });
}
