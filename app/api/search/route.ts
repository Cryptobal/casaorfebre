import { prisma } from "@/lib/prisma";
import { semanticSearch } from "@/lib/ai/search";
import {
  textSearchProductIds,
  searchCategories,
  tokenizeQuery,
} from "@/lib/search/product-text-search";
import { NextRequest } from "next/server";

/** Umbral de similitud semántica: subir si aparecen resultados irrelevantes, bajar si faltan. */
const SEMANTIC_MIN_SIMILARITY = 0.30;

const hasUpstash = Boolean(
  (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
  (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
);

/* ------------------------------------------------------------------ */
/*  Rate limiting: Upstash (30/min/IP) o fallback en memoria (1 req/s) */
/* ------------------------------------------------------------------ */

const rateLimitMap = new Map<string, number>();

function memRateLimited(ip: string): boolean {
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

async function isRateLimited(ip: string): Promise<boolean> {
  if (!hasUpstash) return memRateLimited(ip);
  const { searchLimiter } = await import("@/lib/rate-limit");
  const { success } = await searchLimiter.limit(ip);
  return !success;
}

/* ------------------------------------------------------------------ */
/*  GET /api/search?q=...&category=...&maxPrice=...&material=...       */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(ip)) {
    return Response.json({ products: [], artisans: [], categories: [] }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return Response.json({ products: [], artisans: [], categories: [] });
  }

  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const maxPriceParam = req.nextUrl.searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
  const material = req.nextUrl.searchParams.get("material") ?? undefined;

  const tokens = tokenizeQuery(q);

  // Texto tokenizado (tolerante a tildes) + semántica con umbral, en paralelo.
  // Cualquiera que falle no rompe la respuesta.
  const [textRes, semanticRes] = await Promise.allSettled([
    textSearchProductIds(q, 8),
    q.length >= 3
      ? semanticSearch(q, { category, maxPrice, material }, 8, {
          minSimilarity: SEMANTIC_MIN_SIMILARITY,
        })
      : Promise.resolve([]),
  ]);

  const textIds = textRes.status === "fulfilled" ? textRes.value : [];
  const semanticIds =
    semanticRes.status === "fulfilled" ? semanticRes.value.map((r) => r.id) : [];

  // Merge: coincidencias de texto primero, luego semánticas no duplicadas → cap 8.
  const mergedIds: string[] = [];
  const seen = new Set<string>();
  for (const id of [...textIds, ...semanticIds]) {
    if (seen.has(id)) continue;
    seen.add(id);
    mergedIds.push(id);
    if (mergedIds.length >= 8) break;
  }

  // Orfebres: búsqueda tokenizada (AND entre tokens, OR entre campos).
  const artisansPromise = prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      AND: tokens.map((t) => ({
        OR: [
          { displayName: { contains: t, mode: "insensitive" as const } },
          { specialty: { contains: t, mode: "insensitive" as const } },
          { location: { contains: t, mode: "insensitive" as const } },
          { region: { contains: t, mode: "insensitive" as const } },
          { specialties: { some: { name: { contains: t, mode: "insensitive" as const } } } },
        ],
      })),
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

  const categoriesPromise = searchCategories(q, 3);

  // Hidratación en un solo query (in: [] devuelve vacío sin romper el paralelismo).
  const productsPromise = prisma.product.findMany({
    where: { id: { in: mergedIds }, status: "APPROVED" },
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

  const [productRows, artisans, categories] = await Promise.all([
    productsPromise,
    artisansPromise,
    categoriesPromise,
  ]);

  // Reordenar según mergedIds (texto primero) — patrón Map.
  const byId = new Map(productRows.map((r) => [r.id, r]));
  const products = mergedIds.map((id) => byId.get(id)).filter(Boolean);

  return Response.json({ products, artisans, categories });
}
