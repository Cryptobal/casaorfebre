import { prisma } from "@/lib/prisma";

export async function GET() {
  const artisans = await prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      products: { some: { status: "APPROVED" } },
    },
    select: {
      displayName: true,
      slug: true,
      location: true,
      region: true,
      specialty: true,
      profileImage: true,
      rating: true,
      reviewCount: true,
      _count: {
        select: {
          products: { where: { status: "APPROVED" } },
        },
      },
    },
    orderBy: { rating: "desc" },
  });

  const data = artisans.map((a) => ({
    name: a.displayName,
    slug: a.slug,
    location: a.location,
    region: a.region,
    specialty: a.specialty,
    profileImage: a.profileImage,
    averageRating: a.rating,
    reviewCount: a.reviewCount,
    productCount: a._count.products,
  }));

  return Response.json(
    { artisans: data, total: data.length },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600",
      },
    },
  );
}
