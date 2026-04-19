import { prisma } from "@/lib/prisma";

interface ArtisanFilters {
  specialtySlug?: string;
  region?: string;
  material?: string;
  /** Filtra por tier curatorial (MAESTRO, ORFEBRE, EMERGENTE). */
  tier?: "EMERGENTE" | "ORFEBRE" | "MAESTRO";
  /** Si true, incluye orfebres sin piezas aprobadas (uso admin). */
  includeEmpty?: boolean;
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

/**
 * Filtro base para excluir orfebres administrativos de listados públicos.
 * - Excluye los artisans creados por el role-switcher (slug `admin-test-*`).
 *   Así no quedan fuera Camila ni Carlos, que son ADMIN pero también orfebres
 *   reales de la plataforma.
 * - Por default, exige al menos una pieza APPROVED para aparecer en el directorio.
 */
function publicArtisanWhere(requireApprovedProduct: boolean) {
  const where: Record<string, unknown> = {
    status: "APPROVED" as const,
    NOT: { slug: { startsWith: "admin-test-" } },
  };
  if (requireApprovedProduct) {
    where.products = { some: { status: "APPROVED" as const } };
  }
  return where;
}

export async function getApprovedArtisans(filters: ArtisanFilters = {}) {
  const where = publicArtisanWhere(!filters.includeEmpty);

  if (filters.specialtySlug) {
    where.specialties = { some: { slug: filters.specialtySlug } };
  }
  if (filters.region) {
    where.region = filters.region;
  }
  if (filters.material) {
    where.materials = { has: filters.material };
  }
  if (filters.tier) {
    where.tier = filters.tier;
  }

  return prisma.artisan.findMany({
    where,
    // Orden editorial del directorio:
    //   editorialRank ASC NULLS LAST → tier DESC → totalSales DESC.
    // El enum ArtisanTier está declarado { EMERGENTE, ORFEBRE, MAESTRO },
    // por lo que DESC lo ordena MAESTRO → ORFEBRE → EMERGENTE (Postgres
    // usa posición de declaración, no alfabético). Camila y Pamela
    // (MAESTRO) suben por este criterio cuando no hay editorialRank.
    orderBy: [
      { editorialRank: { sort: "asc", nulls: "last" } },
      { tier: "desc" },
      { totalSales: "desc" },
    ],
    include: {
      specialties: { select: { id: true, name: true, slug: true } },
      ...activePlanInclude,
      ...approvedProductCount,
    },
  });
}

export async function getFeaturedArtisans(limit = 3) {
  return prisma.artisan.findMany({
    where: publicArtisanWhere(true),
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
      ...publicArtisanWhere(true),
      tier: "MAESTRO",
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
  return prisma.artisan.findFirst({
    where: {
      slug,
      status: "APPROVED",
      NOT: { slug: { startsWith: "admin-test-" } },
    },
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
      NOT: { slug: { startsWith: "admin-test-" } },
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
