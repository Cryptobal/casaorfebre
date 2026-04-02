import { prisma } from "@/lib/prisma";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  artisanName: string;
}

const DEFAULT_LIMIT = 8;

/**
 * Generate personalized product recommendations for a buyer based on their
 * favorites, purchase history, and the categories / materials / artisans
 * they have interacted with. Falls back to popular products when there is
 * no interaction history.
 */
export async function getBuyerRecommendations(
  userId: string,
  limit = DEFAULT_LIMIT,
): Promise<RecommendedProduct[]> {
  // 1. Gather favorited product IDs
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });

  // 2. Gather purchased product IDs (only from successful orders)
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ["PAID", "SHIPPED", "DELIVERED", "COMPLETED"] },
    },
    select: { items: { select: { productId: true } } },
  });
  const purchasedIds = orders.flatMap((o) => o.items.map((i) => i.productId));

  // 3. Deduplicate all interacted product IDs
  const interactedIds = [
    ...new Set([...favorites.map((f) => f.productId), ...purchasedIds]),
  ];

  if (interactedIds.length === 0) {
    return getPopularProducts(limit);
  }

  // 4. Extract preference signals from interacted products
  const interactedProducts = await prisma.product.findMany({
    where: { id: { in: interactedIds } },
    select: {
      categories: { select: { id: true } },
      materials: { select: { id: true } },
      artisanId: true,
    },
  });

  const categoryIds = [
    ...new Set(interactedProducts.flatMap((p) => p.categories.map((c) => c.id))),
  ];
  const materialIds = [
    ...new Set(interactedProducts.flatMap((p) => p.materials.map((m) => m.id))),
  ];
  const artisanIds = [
    ...new Set(interactedProducts.map((p) => p.artisanId)),
  ];

  // 5. Find similar approved products the user has NOT already interacted with
  const recommendations = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      id: { notIn: interactedIds },
      OR: [
        ...(categoryIds.length > 0
          ? [{ categories: { some: { id: { in: categoryIds } } } }]
          : []),
        ...(materialIds.length > 0
          ? [{ materials: { some: { id: { in: materialIds } } } }]
          : []),
        ...(artisanIds.length > 0 ? [{ artisanId: { in: artisanIds } }] : []),
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: {
        take: 1,
        orderBy: { position: "asc" },
        select: { url: true },
      },
      artisan: { select: { displayName: true } },
    },
    orderBy: { viewCount: "desc" },
    take: limit,
  });

  const results = mapToRecommended(recommendations);

  // If we got fewer results than requested, pad with popular products
  if (results.length < limit) {
    const excludeIds = [...interactedIds, ...results.map((r) => r.id)];
    const extra = await getPopularProducts(limit - results.length, excludeIds);
    results.push(...extra);
  }

  return results;
}

/**
 * Return the most-viewed approved products, optionally excluding a set of IDs.
 */
async function getPopularProducts(
  limit: number,
  excludeIds: string[] = [],
): Promise<RecommendedProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: {
        take: 1,
        orderBy: { position: "asc" },
        select: { url: true },
      },
      artisan: { select: { displayName: true } },
    },
    orderBy: { viewCount: "desc" },
    take: limit,
  });

  return mapToRecommended(products);
}

type RawProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
  artisan: { displayName: string };
};

function mapToRecommended(products: RawProduct[]): RecommendedProduct[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.images[0]?.url ?? null,
    artisanName: p.artisan.displayName,
  }));
}
