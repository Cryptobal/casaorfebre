import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { materialCost, laborCost, totalCost, materials, hours } = body;

  // Find similar products by materials
  const similarProducts = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      materials: {
        some: {
          name: { in: materials },
        },
      },
    },
    select: {
      name: true,
      price: true,
      materials: { select: { name: true } },
    },
    orderBy: { price: "asc" },
    take: 20,
  });

  const priceRange = similarProducts.length > 0
    ? {
        min: Math.min(...similarProducts.map(p => p.price)),
        max: Math.max(...similarProducts.map(p => p.price)),
        median: similarProducts[Math.floor(similarProducts.length / 2)]?.price ?? 0,
        count: similarProducts.length,
      }
    : null;

  // Use Claude to generate suggestion
  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Eres un asesor de precios de Casa Orfebre, marketplace de joyería artesanal chilena. Ayudas a orfebres a poner precios competitivos y rentables. Responde en JSON: {"suggestedMin": number, "suggestedMax": number, "reasoning": "string corto en español", "tips": ["tip1", "tip2"]}. No incluyas nada fuera del JSON.`,
    messages: [{
      role: "user",
      content: `Un orfebre necesita precio para una pieza con:
- Materiales: ${materials.join(", ")}
- Costo materiales: $${materialCost.toLocaleString("es-CL")} CLP
- Horas de trabajo: ${hours}h
- Costo total (con mano de obra + overhead): $${totalCost.toLocaleString("es-CL")} CLP

${priceRange ? `Productos similares en el marketplace (${priceRange.count} piezas):
- Rango: $${priceRange.min.toLocaleString("es-CL")} — $${priceRange.max.toLocaleString("es-CL")}
- Mediana: $${priceRange.median.toLocaleString("es-CL")}` : "No hay productos similares en el marketplace aún."}

Sugiere un rango de precio de venta competitivo que asegure al menos 40% de margen después de la comisión del marketplace (18%).`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const suggestion = JSON.parse(text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim());
    return NextResponse.json({ suggestion, marketData: priceRange });
  } catch {
    return NextResponse.json({ suggestion: null, marketData: priceRange });
  }
}
