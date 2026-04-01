import Anthropic from "@anthropic-ai/sdk";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

interface ProductResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  artisanName: string;
  similarity: number;
}

export async function searchByImage(
  imageBase64: string,
  mediaType: string,
): Promise<{ products: ProductResult[]; description: string }> {
  // Step 1: Use Claude Vision to describe the jewelry in the image
  const visionResponse = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Describe esta joya en español para buscar piezas similares en un catálogo de joyería artesanal chilena.
Incluye: tipo de joya (anillo, collar, aros, pulsera, broche, colgante), material aparente (plata, oro, cobre, bronce),
estilo (minimalista, bohemio, clásico, statement), colores, piedras si las hay, forma general.
Responde en 2-3 oraciones descriptivas, sin formato especial.`,
          },
        ],
      },
    ],
  });

  const description =
    visionResponse.content[0].type === "text"
      ? visionResponse.content[0].text.trim()
      : "Joya artesanal";

  // Step 2: Generate embedding from the description
  const queryEmbedding = await generateEmbedding(description);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // Step 3: Search with pgvector
  const results = await prisma.$queryRawUnsafe<
    { id: string; name: string; slug: string; price: number; similarity: number }[]
  >(
    `SELECT p."id", p."name", p."slug", p."price",
            1 - (p."embedding" <=> $1::vector) AS similarity
     FROM "products" p
     WHERE p."status" = 'APPROVED' AND p."embedding" IS NOT NULL
     ORDER BY p."embedding" <=> $1::vector
     LIMIT 12`,
    embeddingStr,
  );

  if (results.length === 0) {
    return { products: [], description };
  }

  // Fetch images and artisan info
  const productIds = results.map((r) => r.id);
  const fullProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      artisan: { select: { displayName: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });

  const productMap = new Map(fullProducts.map((p) => [p.id, p]));

  const products: ProductResult[] = [];
  for (const r of results) {
    const full = productMap.get(r.id);
    if (!full) continue;
    products.push({
      id: r.id,
      name: full.name,
      slug: full.slug,
      price: full.price,
      image: full.images[0]?.url ?? null,
      artisanName: full.artisan.displayName,
      similarity: r.similarity,
    });
  }

  return { products, description };
}
