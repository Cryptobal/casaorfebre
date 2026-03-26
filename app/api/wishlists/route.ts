import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const wishlists = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { items: true } },
      items: {
        include: {
          product: {
            include: {
              artisan: { select: { displayName: true, slug: true } },
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlists);
}
