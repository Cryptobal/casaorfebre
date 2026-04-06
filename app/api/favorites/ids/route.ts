import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ids: [] },
      { headers: { "cache-control": "private, no-store" } },
    );
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return NextResponse.json(
    { ids: favorites.map((f) => f.productId) },
    { headers: { "cache-control": "private, no-store" } },
  );
}
