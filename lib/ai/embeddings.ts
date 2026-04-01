import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import type { Product, Artisan, Category, Material, Specialty } from "@prisma/client";

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

type ProductWithRelations = Product & {
  artisan: Pick<Artisan, "displayName" | "region" | "specialty">;
  categories: Pick<Category, "name">[];
  materials: Pick<Material, "name">[];
  specialties: Pick<Specialty, "name">[];
};

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

export function buildProductText(product: ProductWithRelations): string {
  const parts: string[] = [
    product.name,
    product.description,
  ];

  if (product.story) parts.push(product.story);

  const materials = product.materials.map((m) => m.name).join(", ");
  if (materials) parts.push(`Materiales: ${materials}`);

  const categories = product.categories.map((c) => c.name).join(", ");
  if (categories) parts.push(`Categorías: ${categories}`);

  const specialties = product.specialties.map((s) => s.name).join(", ");
  if (specialties) parts.push(`Especialidades: ${specialties}`);

  const productionLabels: Record<string, string> = {
    UNIQUE: "Pieza única",
    MADE_TO_ORDER: "Hecha por encargo",
    LIMITED: "Producción limitada",
  };
  parts.push(`Tipo: ${productionLabels[product.productionType] ?? product.productionType}`);

  parts.push(`Precio: $${product.price.toLocaleString("es-CL")}`);

  if (product.artisan.region) parts.push(`Región: ${product.artisan.region}`);
  parts.push(`Orfebre: ${product.artisan.displayName}`);
  parts.push(`Especialidad: ${product.artisan.specialty}`);

  return parts.join(". ");
}

export async function updateProductEmbedding(productId: string): Promise<void> {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: {
      artisan: { select: { displayName: true, region: true, specialty: true } },
      categories: { select: { name: true } },
      materials: { select: { name: true } },
      specialties: { select: { name: true } },
    },
  });

  const text = buildProductText(product);
  const embedding = await generateEmbedding(text);
  const embeddingStr = `[${embedding.join(",")}]`;

  await prisma.$executeRawUnsafe(
    `UPDATE "products" SET "embedding" = $1::vector WHERE "id" = $2`,
    embeddingStr,
    productId,
  );
}

export async function updateAllEmbeddings(): Promise<{ updated: number; errors: number }> {
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
    },
    select: { id: true },
  });

  // Filter products without embedding via raw query
  const withoutEmbedding = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT "id" FROM "products" WHERE "status" = 'APPROVED' AND "embedding" IS NULL`,
  );

  const idsToUpdate = new Set(withoutEmbedding.map((p) => p.id));
  const toProcess = products.filter((p) => idsToUpdate.has(p.id));

  let updated = 0;
  let errors = 0;

  for (const product of toProcess) {
    try {
      await updateProductEmbedding(product.id);
      updated++;
      // Rate limiting: 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (e) {
      console.error(`Failed to update embedding for product ${product.id}:`, e);
      errors++;
    }
  }

  return { updated, errors };
}
