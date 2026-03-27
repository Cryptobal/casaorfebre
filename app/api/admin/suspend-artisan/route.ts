import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { artisanId } = await req.json();
  if (!artisanId) {
    return NextResponse.json({ error: "artisanId requerido" }, { status: 400 });
  }

  await prisma.artisan.update({
    where: { id: artisanId },
    data: { status: "SUSPENDED" },
  });

  return NextResponse.json({ success: true });
}
