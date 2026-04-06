import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { show: false },
      { headers: { "cache-control": "private, no-store" } },
    );
  }
  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, hashedPassword: true },
  });
  // Solo se muestra para usuarios de credenciales (con password) sin email verificado.
  const show = !!(u?.hashedPassword && !u.emailVerified);
  return NextResponse.json(
    { show },
    { headers: { "cache-control": "private, no-store" } },
  );
}
