import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const category = params.get("category") ?? undefined;
  const material = params.get("material") ?? undefined;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const limit = Math.min(Number(params.get("limit")) || 20, 100);
  const offset = Number(params.get("offset")) || 0;

  const where: Record<string, unknown> = { status: "APPROVED" as const };

  if (category) where.categories = { some: { slug: category } };
  if (material) where.materials = { some: { name: { contains: material, mode: "insensitive" } } };
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: minPrice } : {}),
      ...(maxPrice ? { lte: maxPrice } : {}),
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        productionType: true,
        createdAt: true,
        materials: { select: { name: true } },
        categories: { select: { name: true } },
        artisan: { select: { displayName: true, location: true } },
        images: {
          where: { status: "APPROVED" },
          orderBy: { position: "asc" },
          select: { url: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const data = products.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    const averageRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      currency: "CLP",
      materials: p.materials.map((m) => m.name),
      categories: p.categories.map((c) => c.name),
      artisanName: p.artisan.displayName,
      artisanLocation: p.artisan.location,
      images: p.images.map((i) => i.url),
      mainImage: p.images[0]?.url ?? null,
      averageRating,
      reviewCount: ratings.length,
      productionType: p.productionType,
      createdAt: p.createdAt.toISOString(),
    };
  });

  return Response.json(
    { products: data, total, limit, offset },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600",
      },
    },
  );
}
