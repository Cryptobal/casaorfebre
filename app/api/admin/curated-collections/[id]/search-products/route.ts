import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  await params; // id validated by the route existing; not used for search scope

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) {
    return Response.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        {
          artisan: {
            displayName: { contains: q, mode: "insensitive" },
          },
        },
        {
          categories: {
            some: { name: { contains: q, mode: "insensitive" } },
          },
        },
        {
          materials: {
            some: { name: { contains: q, mode: "insensitive" } },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      status: true,
      images: {
        take: 1,
        orderBy: { position: "asc" },
        select: { url: true },
      },
      artisan: { select: { displayName: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 30,
  });

  return Response.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      status: p.status,
      image: p.images[0]?.url ?? null,
      artisanName: p.artisan.displayName,
    })),
  });
}
