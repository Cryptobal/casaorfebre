import { prisma } from "@/lib/prisma";
import { semanticSearch } from "@/lib/ai/search";
import { NextRequest } from "next/server";

/* ------------------------------------------------------------------ */
/*  Simple in-memory rate limiter: 1 req/s per IP                      */
/* ------------------------------------------------------------------ */

const rateLimitMap = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < 1000) return true;
  rateLimitMap.set(ip, now);
  // Evict stale entries every 1000 IPs
  if (rateLimitMap.size > 1000) {
    for (const [key, ts] of rateLimitMap) {
      if (now - ts > 10_000) rateLimitMap.delete(key);
    }
  }
  return false;
}

/* ------------------------------------------------------------------ */
/*  GET /api/search?q=...&category=...&maxPrice=...&material=...       */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ products: [], artisans: [] }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return Response.json({ products: [], artisans: [] });

  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const maxPriceParam = req.nextUrl.searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const material = req.nextUrl.searchParams.get("material") ?? undefined;

  // Artisan search (always text-based)
  const artisansPromise = prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { displayName: { contains: q, mode: "insensitive" } },
        { specialty: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { region: { contains: q, mode: "insensitive" } },
        { specialties: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    },
    select: {
      slug: true,
      displayName: true,
      location: true,
      specialty: true,
      profileImage: true,
    },
    take: 4,
  });

  // Products: semantic search for longer queries, text search for short ones
  let products;
  if (q.length > 3) {
    try {
      const semanticResults = await semanticSearch(q, { category, maxPrice, material }, 6);
      const ids = semanticResults.map((r) => r.id);
      const rows = await prisma.product.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          categories: { select: { name: true } },
          images: { take: 1, select: { url: true, altText: true } },
          artisan: { select: { displayName: true } },
        },
      });
      // Preserve semantic ordering
      const byId = new Map(rows.map((r) => [r.id, r]));
      products = ids.map((id) => byId.get(id)).filter(Boolean);
    } catch {
      // Fallback to text search if semantic search fails (e.g., no OPENAI_API_KEY)
      products = await textSearchProducts(q, 6);
    }
  } else {
    products = await textSearchProducts(q, 6);
  }

  const artisans = await artisansPromise;

  return Response.json({ products, artisans });
}

/* ------------------------------------------------------------------ */
/*  Text-based product search fallback                                 */
/* ------------------------------------------------------------------ */

function textSearchProducts(q: string, take: number) {
  return prisma.product.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { materials: { some: { name: { contains: q, mode: "insensitive" } } } },
        { artisan: { displayName: { contains: q, mode: "insensitive" } } },
        { occasions: { some: { name: { contains: q, mode: "insensitive" } } } },
        { specialties: { some: { name: { contains: q, mode: "insensitive" } } } },
      ],
    },
    select: {
      slug: true,
      name: true,
      price: true,
      categories: { select: { name: true } },
      images: { take: 1, select: { url: true, altText: true } },
      artisan: { select: { displayName: true } },
    },
    take,
  });
}
