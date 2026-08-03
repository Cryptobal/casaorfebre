import { prisma } from "@/lib/prisma";
import { PUBLIC_PRODUCT_SQL, publicProductWhere } from "@/lib/product-visibility";

const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "en", "con", "para", "y", "o", "un", "una", "por",
]);

export function tokenizeQuery(q: string): string[] {
  const norm = q
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
  const tokens = norm
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
    .slice(0, 5);
  return tokens.length > 0 ? tokens : [norm];
}

interface TextHit {
  id: string;
}

/** Búsqueda por texto tolerante a tildes y multi-palabra (AND entre tokens). */
export async function textSearchProductIds(q: string, take: number): Promise<string[]> {
  const tokens = tokenizeQuery(q);
  const qNorm = tokens.join(" ");

  // Intento 1: raw SQL con unaccent (ranking: match exacto de nombre > prefijo > recencia)
  try {
    const tokenConds = tokens
      .map((_, i) => {
        const p = `$${i + 2}`; // $1 = qNorm
        return `(
          unaccent(lower(p."name")) LIKE '%' || ${p} || '%'
          OR unaccent(lower(p."description")) LIKE '%' || ${p} || '%'
          OR EXISTS (SELECT 1 FROM "_MaterialToProduct" mp JOIN "materials" m ON m."id" = mp."A"
                     WHERE mp."B" = p."id" AND unaccent(lower(m."name")) LIKE '%' || ${p} || '%')
          OR EXISTS (SELECT 1 FROM "_CategoryToProduct" cp JOIN "categories" c ON c."id" = cp."A"
                     WHERE cp."B" = p."id" AND unaccent(lower(c."name")) LIKE '%' || ${p} || '%')
          OR EXISTS (SELECT 1 FROM "artisans" a WHERE a."id" = p."artisanId"
                     AND unaccent(lower(a."displayName")) LIKE '%' || ${p} || '%')
        )`;
      })
      .join(" AND ");

    const rows = await prisma.$queryRawUnsafe<TextHit[]>(
      `SELECT p."id"
       FROM "products" p
       WHERE ${PUBLIC_PRODUCT_SQL} AND ${tokenConds}
       ORDER BY (unaccent(lower(p."name")) = $1) DESC,
                (unaccent(lower(p."name")) LIKE $1 || '%') DESC,
                p."createdAt" DESC
       LIMIT ${Number(take)}`,
      qNorm,
      ...tokens,
    );
    return rows.map((r) => r.id);
  } catch (e) {
    console.error("unaccent text search failed, Prisma fallback:", e);
  }

  // Intento 2: Prisma tokenizado (sin tildes-DB pero multi-palabra correcto)
  const rows = await prisma.product.findMany({
    where: publicProductWhere({
      AND: tokens.map((t) => ({
        OR: [
          { name: { contains: t, mode: "insensitive" as const } },
          { description: { contains: t, mode: "insensitive" as const } },
          { materials: { some: { name: { contains: t, mode: "insensitive" as const } } } },
          { categories: { some: { name: { contains: t, mode: "insensitive" as const } } } },
          { artisan: { displayName: { contains: t, mode: "insensitive" as const } } },
        ],
      })),
    }),
    select: { id: true },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map((r) => r.id);
}

/** Categorías cuyo nombre matchea los tokens (para la sección Categorías del modal). */
export async function searchCategories(
  q: string,
  take = 3,
): Promise<{ name: string; slug: string }[]> {
  const tokens = tokenizeQuery(q);
  return prisma.category.findMany({
    where: {
      isActive: true,
      OR: tokens.map((t) => ({ name: { contains: t, mode: "insensitive" as const } })),
    },
    select: { name: true, slug: true },
    take,
  });
}
