import { prisma } from "@/lib/prisma";

interface ArtisanFilters {
  specialtySlug?: string;
  region?: string;
  material?: string;
}

const activePlanInclude = {
  subscriptions: {
    where: { status: "ACTIVE" as const },
    include: { plan: { select: { name: true, badgeText: true, badgeType: true } } },
    orderBy: { startDate: "desc" as const },
    take: 1,
  },
} as const;

const approvedProductCount = {
  _count: {
    select: {
      products: { where: { status: "APPROVED" as const } },
    },
  },
} as const;

const approvedImageFilter = {
  where: { status: "APPROVED" as const },
  orderBy: { position: "asc" as const },
  take: 1,
} as const;

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
      ...activePlanInclude,
      ...approvedProductCount,
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
      ...activePlanInclude,
      ...approvedProductCount,
    },
  });
}

export async function getMaestroArtisans() {
  return prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      homeHighlight: true,
      subscriptions: {
        some: {
          status: "ACTIVE",
          plan: { homeHighlight: true },
        },
      },
    },
    orderBy: { rating: "desc" },
    include: {
      ...activePlanInclude,
      ...approvedProductCount,
      products: {
        where: { status: "APPROVED" },
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        take: 1,
        include: {
          images: approvedImageFilter,
        },
      },
    },
  });
}

export async function getArtisanBySlug(slug: string) {
  return prisma.artisan.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      specialties: { select: { id: true, name: true, slug: true } },
      ...activePlanInclude,
      products: {
        where: { status: "APPROVED" },
        orderBy: { publishedAt: "desc" },
        include: {
          artisan: { select: { displayName: true, slug: true } },
          images: approvedImageFilter,
          specialties: { select: { id: true, name: true, slug: true } },
          occasions: { select: { id: true, name: true, slug: true } },
        },
      },
      _count: { select: { reviews: true } },
    },
  });
}

export async function getArtisansByRegion(regionKeyword: string) {
  return prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { region: { contains: regionKeyword, mode: "insensitive" } },
        { location: { contains: regionKeyword, mode: "insensitive" } },
      ],
    },
    orderBy: { totalSales: "desc" },
    select: {
      id: true,
      displayName: true,
      slug: true,
      specialty: true,
      location: true,
      region: true,
      profileImage: true,
    },
  });
}
