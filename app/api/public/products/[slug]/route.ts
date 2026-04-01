import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, status: "APPROVED" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      story: true,
      price: true,
      compareAtPrice: true,
      productionType: true,
      isCustomizable: true,
      personalizable: true,
      dimensions: true,
      weight: true,
      technique: true,
      createdAt: true,
      materials: { select: { name: true } },
      categories: { select: { name: true } },
      occasions: { select: { name: true } },
      specialties: { select: { name: true } },
      stones: {
        select: {
          stoneType: true,
          stoneCarat: true,
          stoneColor: true,
          stoneCut: true,
          stoneOrigin: true,
          quantity: true,
        },
      },
      artisan: {
        select: {
          displayName: true,
          slug: true,
          location: true,
          region: true,
          bio: true,
          specialty: true,
        },
      },
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        select: { url: true, altText: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const ratings = product.reviews.map((r) => r.rating);
  const averageRating = ratings.length > 0
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  const data = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    story: product.story,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    currency: "CLP",
    productionType: product.productionType,
    isCustomizable: product.isCustomizable,
    personalizable: product.personalizable,
    dimensions: product.dimensions,
    weight: product.weight,
    technique: product.technique,
    materials: product.materials.map((m) => m.name),
    categories: product.categories.map((c) => c.name),
    occasions: product.occasions.map((o) => o.name),
    specialties: product.specialties.map((s) => s.name),
    stones: product.stones.map((s) => ({
      type: s.stoneType,
      carat: s.stoneCarat,
      color: s.stoneColor,
      cut: s.stoneCut,
      origin: s.stoneOrigin,
      quantity: s.quantity,
    })),
    artisan: {
      name: product.artisan.displayName,
      slug: product.artisan.slug,
      location: product.artisan.location,
      region: product.artisan.region,
      bio: product.artisan.bio.substring(0, 300),
      specialty: product.artisan.specialty,
    },
    images: product.images.map((i) => ({ url: i.url, altText: i.altText })),
    averageRating,
    reviewCount: ratings.length,
    createdAt: product.createdAt.toISOString(),
  };

  return Response.json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}
