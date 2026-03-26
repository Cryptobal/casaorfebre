import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return Response.json({ products: [], artisans: [] });

  const [products, artisans] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { materials: { hasSome: [q.toUpperCase()] } },
          { artisan: { displayName: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        slug: true,
        name: true,
        price: true,
        category: true,
        images: { take: 1, select: { url: true, altText: true } },
        artisan: { select: { displayName: true } },
      },
      take: 6,
    }),
    prisma.artisan.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { displayName: { contains: q, mode: "insensitive" } },
          { specialty: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        slug: true,
        displayName: true,
        location: true,
        specialty: true,
        profileImage: true,
      },
      take: 4,
    }),
  ]);

  return Response.json({ products, artisans });
}
