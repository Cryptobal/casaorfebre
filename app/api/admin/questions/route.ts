import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { questionId, action } = await request.json();
  if (!questionId || !action) {
    return NextResponse.json({ error: "Datos faltantes" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (action === "block") data.isBlocked = true;
  if (action === "unblock") data.isBlocked = false;
  if (action === "hide") data.isPublic = false;
  if (action === "show") data.isPublic = true;

  await prisma.productQuestion.update({ where: { id: questionId }, data });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { questionId } = await request.json();
  if (!questionId) {
    return NextResponse.json({ error: "Datos faltantes" }, { status: 400 });
  }

  await prisma.productQuestion.delete({ where: { id: questionId } });

  return NextResponse.json({ success: true });
}
