import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { artisanId, enable, months } = await request.json();

  if (!artisanId) {
    return NextResponse.json({ error: "artisanId requerido" }, { status: 400 });
  }

  const artisan = await prisma.artisan.findUnique({ where: { id: artisanId } });
  if (!artisan) {
    return NextResponse.json({ error: "Orfebre no encontrado" }, { status: 404 });
  }

  if (enable) {
    const pioneerUntil = months && months > 0
      ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
      : null;

    await prisma.artisan.update({
      where: { id: artisanId },
      data: {
        isPioneer: true,
        pioneerUntil,
        pioneerGrantedBy: session.user.email,
      },
    });
  } else {
    await prisma.artisan.update({
      where: { id: artisanId },
      data: {
        isPioneer: false,
        pioneerUntil: null,
        pioneerGrantedBy: null,
      },
    });
  }

  return NextResponse.json({ success: true });
}
