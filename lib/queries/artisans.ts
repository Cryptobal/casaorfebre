import { prisma } from "@/lib/prisma";

export async function getApprovedArtisans() {
  return prisma.artisan.findMany({
    where: { status: "APPROVED" },
    orderBy: { totalSales: "desc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getFeaturedArtisans(limit = 3) {
  return prisma.artisan.findMany({
    where: { status: "APPROVED" },
    orderBy: { rating: "desc" },
    take: limit,
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getArtisanBySlug(slug: string) {
  return prisma.artisan.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      products: {
        where: { status: "APPROVED" },
        orderBy: { publishedAt: "desc" },
        include: {
          artisan: { select: { displayName: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
      _count: { select: { products: true, reviews: true } },
    },
  });
}
