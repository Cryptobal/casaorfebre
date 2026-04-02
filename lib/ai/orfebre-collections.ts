import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface CollectionSuggestion {
  name: string;
  description: string;
  productIds: string[];
}

export async function suggestArtisanCollections(artisanId: string): Promise<CollectionSuggestion[]> {
  const products = await prisma.product.findMany({
    where: { artisanId, status: { in: ["APPROVED", "DRAFT", "PAUSED"] } },
    include: {
      categories: { select: { name: true } },
      materials: { select: { name: true } },
      occasions: { select: { name: true } },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  if (products.length < 3) {
    return [];
  }

  const existingCollections = await prisma.collection.findMany({
    where: { artisanId },
    select: { name: true },
  });

  const productContext = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    categories: p.categories.map((c) => c.name),
    materials: p.materials.map((m) => m.name),
    occasions: p.occasions.map((o) => o.name),
  }));

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Eres un curador de joyería artesanal. Analizas el catálogo de un orfebre y sugieres colecciones temáticas.
Responde SOLO con un JSON array. Sin markdown, sin code fences.
Cada elemento: { "name": "Nombre de la colección", "description": "Descripción corta", "productIds": ["id1", "id2", ...] }
Sugiere 2-4 colecciones. Cada colección debe tener al menos 2 productos.
Los nombres deben ser evocadores y elegantes (ej: "Línea Mar", "Raíces de Plata", "Esencia Minimalista").
Agrupa por material, estilo, ocasión o rango de precio.
Español neutro, tono profesional.`,
    messages: [
      {
        role: "user",
        content: `Productos del orfebre:\n${JSON.stringify(productContext, null, 2)}\n\nColecciones existentes (no repetir): ${existingCollections.map((c) => c.name).join(", ") || "ninguna"}`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "[]";
  const text = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      const validProductIds = new Set(products.map((p) => p.id));
      return parsed
        .filter((s: CollectionSuggestion) => s.name && s.productIds?.length >= 2)
        .map((s: CollectionSuggestion) => ({
          ...s,
          productIds: s.productIds.filter((id) => validProductIds.has(id)),
        }))
        .filter((s: CollectionSuggestion) => s.productIds.length >= 2)
        .slice(0, 4);
    }
  } catch {
    return [];
  }

  return [];
}
