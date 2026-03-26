import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@prisma/client";

interface ProductFilters {
  category?: ProductCategory;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  artisanSlug?: string;
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

  const orderBy =
    filters.sort === "price_asc"
      ? { price: "asc" as const }
      : filters.sort === "price_desc"
        ? { price: "desc" as const }
        : { publishedAt: "desc" as const };

  return prisma.product.findMany({
    where,
    orderBy,
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
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
          location: true,
          specialty: true,
          materials: true,
          profileImage: true,
        },
      },
      images: { orderBy: { position: "asc" } },
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
