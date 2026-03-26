import { prisma } from "@/lib/prisma";

interface ArtisanFilters {
  specialtySlug?: string;
  region?: string;
  material?: string;
}

export async function getApprovedArtisans(filters: ArtisanFilters = {}) {
  const where: Record<string, unknown> = { status: "APPROVED" as const };

  if (filters.specialtySlug) {
    where.specialties = { some: { slug: filters.specialtySlug } };
  }
  if (filters.region) {
    where.region = filters.region;
  }
  if (filters.material) {
    where.materials = { has: filters.material };
  }

  return prisma.artisan.findMany({
    where,
    orderBy: { totalSales: "desc" },
    include: {
      specialties: { select: { id: true, name: true, slug: true } },
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
      specialties: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
  });
}

export async function getArtisanBySlug(slug: string) {
  return prisma.artisan.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      specialties: { select: { id: true, name: true, slug: true } },
      products: {
        where: { status: "APPROVED" },
        orderBy: { publishedAt: "desc" },
        include: {
          artisan: { select: { displayName: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
          specialty: { select: { id: true, name: true, slug: true } },
          occasions: { select: { id: true, name: true, slug: true } },
        },
      },
      _count: { select: { products: true, reviews: true } },
    },
  });
}
