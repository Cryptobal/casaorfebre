import { prisma } from "@/lib/prisma";
import type { Product, Artisan, ProductImage } from "@prisma/client";

/** Only show approved images in public queries */
const approvedImagesFirst = {
  where: { status: "APPROVED" as const },
  orderBy: { position: "asc" as const },
  take: 1,
} as const;

/**
 * Dos imágenes aprobadas para cards editoriales:
 * la primera se muestra por defecto, la segunda se cross-fade en hover.
 */
const approvedImagesForCard = {
  where: { status: "APPROVED" as const },
  orderBy: { position: "asc" as const },
  take: 2,
} as const;

/**
 * Reorders the first N products so no two consecutive items share the same
 * artisan. Preserves internal score order within each artisan. Pieces beyond
 * position N remain untouched.
 *
 * If only one artisan has remaining stock at some point, consecutive pieces
 * from that artisan are allowed (graceful fallback).
 */
function diversifyByArtisan<T extends { artisanId: string }>(
  products: T[],
  headSize = 12,
): T[] {
  if (products.length <= 1) return products;

  const head = products.slice(0, headSize);
  const tail = products.slice(headSize);

  // Group head by artisanId preserving original order (which is score desc).
  const byArtisan = new Map<string, T[]>();
  for (const p of head) {
    const bucket = byArtisan.get(p.artisanId);
    if (bucket) bucket.push(p);
    else byArtisan.set(p.artisanId, [p]);
  }

  // Only one artisan in head? Nothing to diversify.
  if (byArtisan.size === 1) return products;

  const groups = Array.from(byArtisan.entries()).map(([artisanId, pieces]) => ({
    artisanId,
    pieces,
  }));

  const diversified: T[] = [];
  while (diversified.length < head.length) {
    const lastArtisanId = diversified[diversified.length - 1]?.artisanId;

    // Prefer a group whose artisanId differs from the previous pick.
    let pick = groups.find(
      (g) => g.pieces.length > 0 && g.artisanId !== lastArtisanId,
    );
    // Fallback: if only the last artisan has stock left, allow repetition.
    if (!pick) pick = groups.find((g) => g.pieces.length > 0);
    if (!pick) break;

    diversified.push(pick.pieces.shift()!);
  }

  return [...diversified, ...tail];
}

export type ProductSort =
  | "recommended"   // default: score compuesto + diversificación por orfebre
  | "newest"        // publishedAt desc + diversificación
  | "rating"        // rating del orfebre desc + diversificación
  | "most_viewed"   // viewCount desc + diversificación
  | "popular"       // favoriteCount desc + diversificación
  | "price_asc"     // orden estricto, sin diversificación
  | "price_desc"    // orden estricto, sin diversificación
  | "az";           // alfabético por nombre, sin diversificación

interface ProductFilters {
  categorySlug?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  artisanSlug?: string;
  occasionSlug?: string;
  specialtySlug?: string;
  audiencia?: string;
  productionType?: "UNIQUE" | "MADE_TO_ORDER" | "LIMITED";
  sort?: ProductSort;
}

export async function getApprovedProducts(filters: ProductFilters = {}) {
  const where: Record<string, unknown> = {
    status: "APPROVED" as const,
    // Excluye productos de cuentas administrativas (Admin Test vía role-switcher).
    artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
  };

  if (filters.categorySlug) where.categories = { some: { slug: filters.categorySlug } };
  if (filters.material) where.materials = { some: { name: filters.material } };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.artisanSlug) {
    where.artisan = {
      ...(where.artisan as Record<string, unknown>),
      slug: filters.artisanSlug,
    };
  }
  if (filters.occasionSlug) {
    where.occasions = { some: { slug: filters.occasionSlug } };
  }
  if (filters.specialtySlug) {
    where.specialties = { some: { slug: filters.specialtySlug } };
  }
  if (filters.audiencia) {
    where.audiencia = filters.audiencia;
  }
  if (filters.productionType) {
    where.productionType = filters.productionType;
  }

  const sort: ProductSort = filters.sort ?? "recommended";

  // "recommended" rehidrata en memoria con un score compuesto que pondera
  // editorialRank + favoriteCount + viewCount + rating del orfebre + searchWeight
  // del plan + recency. Además diversifica por orfebre en las primeras 12
  // posiciones para que nadie tape a los demás.
  const useCompositeScore = sort === "recommended";
  // Sorts "equilibrados" — diversificamos para evitar dominancia de un orfebre.
  const applyDiversify =
    sort === "recommended" ||
    sort === "newest" ||
    sort === "rating" ||
    sort === "most_viewed" ||
    sort === "popular";

  // Orden base pedido a Postgres. Para "recommended" igual hacemos un pre-orden
  // razonable; el score compuesto lo re-ordena en memoria.
  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : sort === "az"
          ? { name: "asc" as const }
          : sort === "popular"
            ? [
                { favoriteCount: "desc" as const },
                { publishedAt: "desc" as const },
              ]
            : sort === "most_viewed"
              ? [
                  { viewCount: "desc" as const },
                  { publishedAt: "desc" as const },
                ]
              : sort === "rating"
                ? [
                    { artisan: { rating: "desc" as const } },
                    { publishedAt: "desc" as const },
                  ]
                : sort === "newest"
                  ? { publishedAt: "desc" as const }
                  : [
                      // "recommended": editorialRank manda si está puesto,
                      // luego favoriteCount, luego fecha. Este pre-orden se
                      // refina con el score compuesto abajo.
                      { editorialRank: { sort: "asc" as const, nulls: "last" as const } },
                      { favoriteCount: "desc" as const },
                      { publishedAt: "desc" as const },
                    ];

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      artisan: {
        select: {
          displayName: true,
          slug: true,
          // Para "recommended" y "rating" necesitamos rating + subscriptions
          // para el score compuesto y el peso del plan.
          ...(useCompositeScore || sort === "rating"
            ? {
                rating: true,
                reviewCount: true,
                subscriptions: {
                  where: { status: "ACTIVE" },
                  take: 1,
                  orderBy: { startDate: "desc" as const },
                  include: { plan: { select: { searchWeight: true } } },
                },
              }
            : {}),
        },
      },
      categories: { select: { id: true, name: true, slug: true } },
      materials: { select: { id: true, name: true } },
      images: approvedImagesForCard,
      specialties: { select: { id: true, name: true, slug: true } },
      occasions: { select: { id: true, name: true, slug: true } },
    },
  });


  // Re-ordenamos en memoria para "recommended" con score compuesto.
  if (useCompositeScore) {
    const now = Date.now();
    const dayMs = 86_400_000;

    products.sort((a, b) => {
      const aScore = compositeScore(a, now, dayMs);
      const bScore = compositeScore(b, now, dayMs);
      return bScore - aScore;
    });
  }

  // Diversificar: ningún orfebre ocupa dos posiciones consecutivas en las
  // primeras 12. Preserva orden interno por score dentro de cada orfebre.
  if (applyDiversify) {
    const diversified = diversifyByArtisan(products, 12);
    products.length = 0;
    products.push(...diversified);
  }

  // Limpiar datos internos del shape del artisan antes de devolver.
  if (useCompositeScore || sort === "rating") {
    for (const p of products) {
      const art = p.artisan as Record<string, unknown>;
      delete art.subscriptions;
      delete art.rating;
      delete art.reviewCount;
    }
  }

  return products;
}

/**
 * Score compuesto para el orden "Recomendadas". Combina señales editoriales
 * (editorialRank), de compradores (favoriteCount), de tráfico (viewCount),
 * de calidad (rating del orfebre × reviews), peso del plan del orfebre
 * (searchWeight) y frescura (días desde publicación).
 */
function compositeScore(
  product: {
    editorialRank?: number | null;
    favoriteCount: number;
    viewCount: number;
    publishedAt: Date | null;
    artisan: unknown;
  },
  now: number,
  dayMs: number,
): number {
  const art = product.artisan as {
    rating?: number;
    reviewCount?: number;
    subscriptions?: { plan: { searchWeight: number } }[];
  };

  const rank = product.editorialRank;
  const editorialBonus = rank != null ? 10_000 / (rank + 1) : 0;

  const artisanRating = art.rating ?? 0;
  const artisanReviews = art.reviewCount ?? 0;
  const qualityScore = artisanRating * Math.log(1 + artisanReviews) * 6;

  const buyerSignal = product.favoriteCount * 3;
  const trafficSignal = Math.log(1 + product.viewCount) * 4;

  const searchWeight = art.subscriptions?.[0]?.plan?.searchWeight ?? 1.0;
  const ageDays = Math.max(
    0,
    (now - (product.publishedAt?.getTime() ?? now)) / dayMs,
  );
  const recency = (1 / (1 + ageDays / 14)) * searchWeight * 10;

  return editorialBonus + qualityScore + buyerSignal + trafficSignal + recency;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: "APPROVED",
      artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
    },
    include: {
      artisan: {
        select: {
          id: true,
          displayName: true,
          slug: true,
          region: true,
          location: true,
          specialty: true,
          specialties: { select: { id: true, name: true, slug: true } },
          materials: true,
          profileImage: true,
        },
      },
      categories: { select: { id: true, name: true, slug: true } },
      materials: { select: { id: true, name: true } },
      images: { where: { status: "APPROVED" }, orderBy: { position: "asc" } },
      video: true,
      specialties: { select: { id: true, name: true, slug: true } },
      occasions: { select: { id: true, name: true, slug: true } },
      collection: { select: { name: true } },
      stones: { orderBy: { position: "asc" } },
    },
  });
}

export async function getLatestProducts(limit = 8) {
  return prisma.product.findMany({
    where: {
      status: "APPROVED",
      artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: approvedImagesForCard,
      materials: { select: { id: true, name: true } },
    },
  });
}

export async function getUserFavoriteIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(favorites.map((f) => f.productId));
}

export async function getAllMaterials() {
  const materials = await prisma.material.findMany({
    where: {
      isActive: true,
      products: { some: { status: "APPROVED" } },
    },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return materials.map((m) => m.name);
}

export async function getNewProducts({
  page = 1,
  perPage = 12,
  categorySlug,
  material,
  minPrice,
  maxPrice,
}: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
} = {}) {
  const now = new Date();
  let cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const where: Record<string, unknown> = {
    status: "APPROVED" as const,
    createdAt: { gte: cutoff },
    artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
  };
  if (categorySlug) where.categories = { some: { slug: categorySlug } };
  if (material) where.materials = { some: { name: material } };
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: minPrice } : {}),
      ...(maxPrice ? { lte: maxPrice } : {}),
    };
  }

  let total = await prisma.product.count({ where });

  // Expand to 60 days if nothing in 30
  if (total === 0 && !categorySlug && !material && !minPrice && !maxPrice) {
    cutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: cutoff };
    total = await prisma.product.count({ where });
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: approvedImagesForCard,
      materials: { select: { id: true, name: true } },
    },
  });

  return { products, total, totalPages: Math.ceil(total / perPage) };
}

/**
 * Pieza del Mes — sólo una pieza está marcada featuredOfMonth a la vez.
 * Retorna null si no hay ninguna (sección se omite con elegancia en el home).
 */
export async function getFeaturedOfMonth() {
  return prisma.product.findFirst({
    where: {
      status: "APPROVED",
      featuredOfMonth: true,
      artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
    },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: approvedImagesForCard,
      materials: { select: { id: true, name: true } },
    },
  });
}

export async function getCuratorPicks(limit?: number) {
  return prisma.product.findMany({
    where: {
      status: "APPROVED",
      isCuratorPick: true,
      artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
    },
    orderBy: { curatorPickAt: "desc" },
    ...(limit ? { take: limit } : {}),
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: approvedImagesForCard,
      materials: { select: { id: true, name: true } },
    },
  });
}

type SimilarProduct = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
};

/**
 * Get similar products for the product detail page.
 * Priority 1: same category + same main material (max 4)
 * Priority 2: same category + price range ±30% (max 3)
 * Priority 3: other pieces by the same artisan (max 3)
 * Priority 4: best-selling products in same category (rest up to 12)
 */
export async function getSimilarProducts(product: {
  id: string;
  categorySlugs: string[];
  materials: { id: string; name: string }[];
  price: number;
  artisanId: string;
}): Promise<SimilarProduct[]> {
  const collected = new Set<string>();
  collected.add(product.id);
  const results: SimilarProduct[] = [];
  const catFilter = product.categorySlugs.length > 0
    ? { categories: { some: { slug: { in: product.categorySlugs } } } }
    : {};

  const include = {
    artisan: { select: { displayName: true, slug: true } as const },
    images: approvedImagesFirst,
  };

  const mainMaterial = product.materials[0];

  // Priority 1: same category + same main material (max 4)
  if (mainMaterial) {
    const p1 = await prisma.product.findMany({
      where: { status: "APPROVED", ...catFilter, materials: { some: { id: mainMaterial.id } }, id: { notIn: [...collected] } },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include,
    });
    for (const p of p1) { collected.add(p.id); results.push(p); }
  }

  // Priority 2: same category + price ±30% (max 3)
  const minPrice = Math.round(product.price * 0.7);
  const maxPrice = Math.round(product.price * 1.3);
  const p2 = await prisma.product.findMany({
    where: { status: "APPROVED", ...catFilter, price: { gte: minPrice, lte: maxPrice }, id: { notIn: [...collected] } },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include,
  });
  for (const p of p2) { collected.add(p.id); results.push(p); }

  // Priority 3: same artisan (max 3)
  const p3 = await prisma.product.findMany({
    where: { status: "APPROVED", artisanId: product.artisanId, id: { notIn: [...collected] } },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include,
  });
  for (const p of p3) { collected.add(p.id); results.push(p); }

  // Priority 4: best-selling same category (fill up to 12)
  if (results.length < 12) {
    const p4 = await prisma.product.findMany({
      where: { status: "APPROVED", ...catFilter, id: { notIn: [...collected] } },
      take: 12 - results.length,
      orderBy: [{ orderItems: { _count: "desc" } }, { publishedAt: "desc" }],
      include,
    });
    for (const p of p4) results.push(p);
  }

  return results;
}

/**
 * Get products for Tesoros de Chile editorial sections.
 * Flexible search: matches materials array OR name/description ILIKE.
 */
export async function getTesorosProducts(
  materialKeywords: string[],
  textKeywords: string[],
  limit = 4
) {
  const orConditions: Record<string, unknown>[] = [];

  for (const mat of materialKeywords) {
    orConditions.push({ materials: { some: { name: { equals: mat, mode: "insensitive" as const } } } });
  }
  for (const kw of textKeywords) {
    orConditions.push({ name: { contains: kw, mode: "insensitive" } });
    orConditions.push({ description: { contains: kw, mode: "insensitive" } });
  }

  if (orConditions.length === 0) return [];

  return prisma.product.findMany({
    where: {
      status: "APPROVED",
      OR: orConditions,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: approvedImagesFirst,
    },
  });
}

/**
 * Get products filtered by gender keyword in name or description.
 * Falls back to unfiltered category products if no gender-tagged items found.
 */
export async function getProductsByGender(
  gender: "hombre" | "mujer",
  categorySlug?: string,
  limit = 4
) {
  const keywords =
    gender === "hombre"
      ? ["hombre", "masculin", "hombres", "unisex"]
      : ["mujer", "femenin", "mujeres", "unisex"];

  const catFilter = categorySlug
    ? { categories: { some: { slug: categorySlug } } }
    : {};

  // Try gender-filtered first
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED" as const,
      ...catFilter,
      OR: keywords.flatMap((kw) => [
        { name: { contains: kw, mode: "insensitive" as const } },
        { description: { contains: kw, mode: "insensitive" as const } },
      ]),
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      categories: { select: { id: true, name: true, slug: true } },
      materials: { select: { id: true, name: true } },
      images: {
        where: { status: "APPROVED" as const },
        orderBy: { position: "asc" as const },
        take: 1,
      },
      specialties: { select: { id: true, name: true, slug: true } },
      occasions: { select: { id: true, name: true, slug: true } },
    },
  });

  // Fallback: if not enough results, fill with general category products
  if (products.length < limit && categorySlug) {
    const existingIds = products.map((p) => p.id);
    const fallback = await prisma.product.findMany({
      where: {
        status: "APPROVED" as const,
        ...catFilter,
        id: { notIn: existingIds },
      },
      take: limit - products.length,
      orderBy: { publishedAt: "desc" },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        categories: { select: { id: true, name: true, slug: true } },
        materials: { select: { id: true, name: true } },
        images: {
          where: { status: "APPROVED" as const },
          orderBy: { position: "asc" as const },
          take: 1,
        },
        specialties: { select: { id: true, name: true, slug: true } },
        occasions: { select: { id: true, name: true, slug: true } },
      },
    });
    products.push(...fallback);
  }

  return products;
}
