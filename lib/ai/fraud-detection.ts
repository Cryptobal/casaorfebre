import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface FraudAnalysis {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
  score: number; // 0-100, higher = more suspicious
}

interface ArtisanHistory {
  totalProducts: number;
  avgPrice: number;
  joinedAt: Date;
}

export async function analyzeProductAuthenticity(params: {
  imageUrls: string[];
  description: string;
  price: number;
  artisanHistory: ArtisanHistory;
}): Promise<FraudAnalysis> {
  const { imageUrls, description, price, artisanHistory } = params;

  // Build content blocks with images for vision analysis
  const content: Anthropic.ContentBlockParam[] = [];

  // Add up to 4 images
  for (const url of imageUrls.slice(0, 4)) {
    content.push({
      type: "image",
      source: { type: "url", url },
    });
  }

  const daysSinceJoin = Math.floor(
    (Date.now() - artisanHistory.joinedAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  content.push({
    type: "text",
    text: `Analiza si este producto de joyería parece genuinamente artesanal o podría ser un producto industrial/revendido.

DATOS DEL PRODUCTO:
- Descripción: ${description}
- Precio: $${price.toLocaleString("es-CL")} CLP

HISTORIAL DEL ORFEBRE:
- Productos publicados: ${artisanHistory.totalProducts}
- Precio promedio de sus productos: $${artisanHistory.avgPrice.toLocaleString("es-CL")} CLP
- Días en la plataforma: ${daysSinceJoin}

CRITERIOS DE EVALUACIÓN:
1. ¿Las fotos parecen de estudio profesional genérico (tipo marketplace masivo/stock)?
2. ¿La pieza tiene uniformidad industrial perfecta (sin marcas artesanales, bordes perfectos de molde)?
3. ¿El precio es sospechosamente bajo para los materiales declarados?
4. ¿La descripción parece copiada/genérica?
5. ¿El orfebre publicó muchos productos rápidamente (patrón de revendedor)?

Responde en JSON exacto (sin markdown):
{"riskLevel": "LOW" | "MEDIUM" | "HIGH", "reasons": ["razón 1", "razón 2"], "score": 0-100}

Score: 0-30 = bajo riesgo, 31-60 = medio, 61-100 = alto.
Si no puedes determinar con certeza, asigna riesgo bajo (preferimos falsos negativos a falsos positivos).`,
  });

  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    const parsed = JSON.parse(text);
    return {
      riskLevel: parsed.riskLevel || "LOW",
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      score: typeof parsed.score === "number" ? parsed.score : 0,
    };
  } catch (e) {
    console.error("Fraud detection parse error:", e);
    // Default to low risk on error
    return { riskLevel: "LOW", reasons: ["Análisis no disponible"], score: 0 };
  }
}
