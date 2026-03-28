import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 });
    }

    await prisma.promoCode.updateMany({
      where: {
        code,
        openedAt: null,
        invitationStatus: "SENT",
      },
      data: {
        openedAt: new Date(),
        invitationStatus: "OPENED",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error tracking promo code open:", error);
    return NextResponse.json({ ok: true });
  }
}
