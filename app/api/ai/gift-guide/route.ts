import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { semanticSearch } from "@/lib/ai/search";
import { prisma } from "@/lib/prisma";
import { CLAUDE_HAIKU } from "@/lib/ai/models";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export async function POST(req: NextRequest) {
  try {
    const { forWhom, occasion, style, budget } = await req.json();

    if (!forWhom || !occasion || !style || !budget) {
      return Response.json({ error: "All quiz fields are required" }, { status: 400 });
    }

    // Build search query from quiz answers
    const searchQuery = `joya ${style} para ${forWhom}, ocasión ${occasion}, presupuesto ${budget}`;

    // Determine max price from budget
    const budgetMap: Record<string, number | undefined> = {
      "hasta-30000": 30000,
      "30000-60000": 60000,
      "60000-100000": 100000,
      "mas-100000": undefined,
      "sin-limite": undefined,
    };
    const maxPrice = budgetMap[budget];

    const productSelect = {
      id: true,
      name: true,
      slug: true,
      price: true,
      description: true,
      materials: { select: { name: true } },
      artisan: { select: { displayName: true } },
      images: {
        where: { status: "APPROVED" as const },
        orderBy: { position: "asc" as const },
        take: 1,
        select: { url: true },
      },
    };

    // Semantic search is best-effort: it requires OPENAI_API_KEY + pgvector
    // embeddings. If it fails (missing key, quota, timeout), fall back to a
    // plain catalog query instead of failing the whole quiz with a 500.
    let products: Awaited<ReturnType<typeof prisma.product.findMany<{ select: typeof productSelect }>>> = [];
    try {
      const results = await semanticSearch(
        searchQuery,
        maxPrice ? { maxPrice } : undefined,
        12,
      );
      if (results.length > 0) {
        const productIds = results.map((r) => r.id);
        const rows = await prisma.product.findMany({
          where: { id: { in: productIds }, status: "APPROVED", artisan: { status: "APPROVED" } },
          select: productSelect,
        });
        // Preserve semantic ordering
        const byId = new Map(rows.map((r) => [r.id, r]));
        products = productIds
          .map((id) => byId.get(id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));
      }
    } catch (e) {
      console.error("[gift-guide] semantic search failed, using fallback:", e);
    }

    if (products.length === 0) {
      // Fallback: popular approved pieces within budget.
      products = await prisma.product.findMany({
        where: {
          status: "APPROVED",
          artisan: { status: "APPROVED" },
          ...(maxPrice ? { price: { lte: maxPrice } } : {}),
        },
        orderBy: [{ favoriteCount: "desc" }, { publishedAt: "desc" }],
        take: 12,
        select: productSelect,
      });
    }

    if (products.length === 0) {
      return Response.json({
        products: [],
        giftNote: "No encontramos productos que coincidan exactamente con tu búsqueda. Te invitamos a explorar nuestra colección completa.",
      });
    }

    // Generate personalized reasons and gift note with Claude Haiku
    const productList = products
      .map(
        (p) =>
          `- ${p.name}: $${p.price.toLocaleString("es-CL")}, materiales: ${p.materials.map((m) => m.name).join(", ")}, por ${p.artisan.displayName}. ${p.description.substring(0, 100)}`,
      )
      .join("\n");

    // The AI copy is also best-effort: if Anthropic is unavailable (missing
    // key, quota, timeout), still return the products with default copy.
    let parsed: { reasons?: Record<string, string>; giftNote?: string } = {
      reasons: {},
      giftNote: "Un regalo hecho a mano, con amor y dedicación.",
    };
    try {
      const response = await getAnthropic().messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 1024,
        system: `Eres una asistente de regalos de Casa Orfebre, marketplace de joyería artesanal chilena. Español chileno, cálida y breve.`,
        messages: [
          {
            role: "user",
            content: `El comprador busca un regalo con estas preferencias:
- Para quién: ${forWhom}
- Ocasión: ${occasion}
- Estilo: ${style}
- Presupuesto: ${budget}

Productos disponibles:
${productList}

Responde en formato JSON exacto (sin markdown, sin backticks):
{
  "reasons": { "product_id": "razón personalizada de 1 oración" },
  "giftNote": "nota de regalo emotiva de 3-4 oraciones para acompañar el regalo"
}

Usa los nombres exactos de los productos como keys en "reasons". La nota de regalo debe ser emotiva, personal y mencionar la ocasión.`,
          },
        ],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "{}";
      const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("[gift-guide] AI copy generation failed, using defaults:", e);
    }

    const productsWithReasons = products.slice(0, 8).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images[0]?.url ?? null,
      artisanName: p.artisan.displayName,
      materials: p.materials.map((m) => m.name),
      reason: parsed.reasons?.[p.name] ?? "Pieza artesanal única, ideal para regalar.",
    }));

    return Response.json({
      products: productsWithReasons,
      giftNote: parsed.giftNote ?? "Un regalo hecho a mano, con amor y dedicación.",
    });
  } catch (e) {
    console.error("Gift guide error:", e);
    return Response.json({ error: "Error generating recommendations" }, { status: 500 });
  }
}
