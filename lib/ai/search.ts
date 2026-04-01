import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/ai/embeddings";
import type { Product } from "@prisma/client";

interface SearchFilters {
  category?: string;
  maxPrice?: number;
  material?: string;
}

interface ProductWithScore extends Product {
  similarity: number;
}

export async function semanticSearch(
  query: string,
  filters?: SearchFilters,
  limit: number = 12,
): Promise<ProductWithScore[]> {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const conditions: string[] = [
    `p."status" = 'APPROVED'`,
    `p."embedding" IS NOT NULL`,
  ];
  const params: unknown[] = [embeddingStr, limit];

  if (filters?.category) {
    params.push(filters.category);
    conditions.push(
      `EXISTS (SELECT 1 FROM "_CategoryToProduct" cp JOIN "categories" c ON c."id" = cp."A" WHERE cp."B" = p."id" AND c."slug" = $${params.length})`,
    );
  }

  if (filters?.maxPrice) {
    params.push(filters.maxPrice);
    conditions.push(`p."price" <= $${params.length}`);
  }

  if (filters?.material) {
    params.push(filters.material);
    conditions.push(
      `EXISTS (SELECT 1 FROM "_MaterialToProduct" mp JOIN "materials" m ON m."id" = mp."A" WHERE mp."B" = p."id" AND m."name" ILIKE $${params.length})`,
    );
  }

  const whereClause = conditions.join(" AND ");

  const results = await prisma.$queryRawUnsafe<ProductWithScore[]>(
    `SELECT p.*, 1 - (p."embedding" <=> $1::vector) AS similarity
     FROM "products" p
     WHERE ${whereClause}
     ORDER BY p."embedding" <=> $1::vector
     LIMIT $2`,
    ...params,
  );

  return results;
}
