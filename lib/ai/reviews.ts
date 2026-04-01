import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

interface ReviewInput {
  rating: number;
  comment: string;
}

export async function generateReviewHighlights(reviews: ReviewInput[]): Promise<string[]> {
  if (reviews.length < 5) return [];

  const reviewText = reviews
    .map((r, i) => `Reseña ${i + 1} (${r.rating}/5): ${r.comment}`)
    .join("\n");

  const message = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{
      role: "user",
      content: `Analiza estas reseñas de un producto de joyería artesanal y extrae 3-5 tags cortos (máximo 4 palabras cada uno) que resuman los sentimientos positivos recurrentes.

Reglas:
- Tags en español, primera letra mayúscula de cada tag
- Ejemplos válidos: "Envío rápido", "Excelente terminación", "Tal cual la foto", "Ideal para regalo", "Calidad premium"
- Si todas las reseñas son negativas, responde con un array vacío
- NO generar tags negativos bajo ninguna circunstancia

Reseñas:
${reviewText}

Responde SOLO con un JSON array de strings. Sin explicación, sin markdown.`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as string[];
    // Validate: only keep short strings
    return parsed
      .filter((t): t is string => typeof t === "string" && t.length <= 30)
      .slice(0, 5);
  } catch {
    return [];
  }
}
