import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }

  const count = await prisma.user.count({
    where: { referredBy: session.user.id },
  });

  return NextResponse.json({ count });
}
