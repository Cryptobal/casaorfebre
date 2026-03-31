import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const asset = await prisma.adminAsset.findUnique({
    where: { key: "brochure-orfebres" },
  });

  return NextResponse.json({ asset });
}
