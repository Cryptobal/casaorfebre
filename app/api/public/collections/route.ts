import { prisma } from "@/lib/prisma";

export async function GET() {
  const collections = await prisma.curatedCollection.findMany({
    where: { isActive: true },
    select: {
      name: true,
      slug: true,
      description: true,
      coverImage: true,
      _count: {
        select: {
          products: { where: { status: "APPROVED" } },
        },
      },
    },
    orderBy: { curatedAt: "desc" },
  });

  const data = collections.map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.coverImage,
    productCount: c._count.products,
  }));

  return Response.json(
    { collections: data, total: data.length },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=3600",
      },
    },
  );
}
