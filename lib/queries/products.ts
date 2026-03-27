import { prisma } from "@/lib/prisma";
import type { ProductCategory, Product, Artisan, ProductImage } from "@prisma/client";

interface ProductFilters {
  category?: ProductCategory;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  artisanSlug?: string;
  occasionSlug?: string;
  specialtySlug?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
}

export async function getApprovedProducts(filters: ProductFilters = {}) {
  const where: Record<string, unknown> = { status: "APPROVED" as const };

  if (filters.category) where.category = filters.category;
  if (filters.material) where.materials = { has: filters.material };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.artisanSlug) {
    where.artisan = { slug: filters.artisanSlug };
  }
  if (filters.occasionSlug) {
    where.occasions = { some: { slug: filters.occasionSlug } };
  }
  if (filters.specialtySlug) {
    where.specialty = { slug: filters.specialtySlug };
  }

  const isRelevanceSort = !filters.sort || filters.sort === "newest";

  const orderBy =
    filters.sort === "price_asc"
      ? { price: "asc" as const }
      : filters.sort === "price_desc"
        ? { price: "desc" as const }
        : { publishedAt: "desc" as const };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      artisan: {
        select: {
          displayName: true,
          slug: true,
          ...(isRelevanceSort
            ? {
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
      images: { orderBy: { position: "asc" }, take: 1 },
      specialty: { select: { id: true, name: true, slug: true } },
      occasions: { select: { id: true, name: true, slug: true } },
    },
  });

  // Apply search weight priority when sorting by relevance (default)
  if (isRelevanceSort) {
    const now = Date.now();
    products.sort((a, b) => {
      const aWeight = (a.artisan as unknown as { subscriptions?: { plan: { searchWeight: number } }[] })
        .subscriptions?.[0]?.plan?.searchWeight ?? 1.0;
      const bWeight = (b.artisan as unknown as { subscriptions?: { plan: { searchWeight: number } }[] })
        .subscriptions?.[0]?.plan?.searchWeight ?? 1.0;

      // Score = recency (0-1 normalized) * searchWeight
      const aAge = now - (a.publishedAt?.getTime() ?? 0);
      const bAge = now - (b.publishedAt?.getTime() ?? 0);
      const aScore = (1 / (1 + aAge / 86400000)) * aWeight;
      const bScore = (1 / (1 + bAge / 86400000)) * bWeight;

      return bScore - aScore;
    });

    // Strip subscription data from response to keep artisan shape clean
    for (const p of products) {
      const art = p.artisan as Record<string, unknown>;
      delete art.subscriptions;
    }
  }

  return products;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, status: "APPROVED" },
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
      images: { orderBy: { position: "asc" } },
      video: true,
      specialty: { select: { id: true, name: true, slug: true } },
      occasions: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getLatestProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "APPROVED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
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
  const products = await prisma.product.findMany({
    where: { status: "APPROVED" },
    select: { materials: true },
  });
  const materials = new Set(products.flatMap((p) => p.materials));
  return Array.from(materials).sort();
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
  category: string;
  materials: string[];
  price: number;
  artisanId: string;
}): Promise<SimilarProduct[]> {
  const collected = new Set<string>();
  collected.add(product.id);
  const results: SimilarProduct[] = [];
  const cat = product.category as ProductCategory;

  const include = {
    artisan: { select: { displayName: true, slug: true } as const },
    images: { orderBy: { position: "asc" as const }, take: 1 },
  };

  const mainMaterial = product.materials[0];

  // Priority 1: same category + same main material (max 4)
  if (mainMaterial) {
    const p1 = await prisma.product.findMany({
      where: { status: "APPROVED", category: cat, materials: { has: mainMaterial }, id: { notIn: [...collected] } },
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
    where: { status: "APPROVED", category: cat, price: { gte: minPrice, lte: maxPrice }, id: { notIn: [...collected] } },
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
      where: { status: "APPROVED", category: cat, id: { notIn: [...collected] } },
      take: 12 - results.length,
      orderBy: [{ orderItems: { _count: "desc" } }, { publishedAt: "desc" }],
      include,
    });
    for (const p of p4) results.push(p);
  }

  return results;
}
