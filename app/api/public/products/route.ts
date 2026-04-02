import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const category = params.get("category") ?? undefined;
  const material = params.get("material") ?? undefined;
  const occasion = params.get("occasion") ?? undefined;
  const style = params.get("style") ?? undefined;
  const slugValues = params.getAll("slug");
  const slug = slugValues.length > 0 ? slugValues.join(",") : undefined;
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const limit = Math.min(Number(params.get("limit")) || 20, 100);
  const offset = Number(params.get("offset")) || 0;
  const sort = params.get("sort") || "newest";

  const where: Record<string, unknown> = { status: "APPROVED" as const };

  if (slug) where.slug = { in: slug.split(",") };
  if (category) where.categories = { some: { slug: category } };
  if (material) where.materials = { some: { name: { contains: material, mode: "insensitive" } } };
  if (occasion) where.occasions = { some: { slug: occasion } };
  if (style) where.specialties = { some: { slug: style } };
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: minPrice } : {}),
      ...(maxPrice ? { lte: maxPrice } : {}),
    };
  }

  // Sort order
  type OrderBy = Record<string, string>;
  let orderBy: OrderBy = { publishedAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "popular") orderBy = { viewCount: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
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
        occasions: { select: { name: true } },
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
      occasions: p.occasions.map((o) => o.name),
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
