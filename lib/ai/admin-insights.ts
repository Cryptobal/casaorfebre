import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface MarketplaceStats {
  salesThisWeek: number;
  salesLastWeek: number;
  newBuyers: number;
  pendingModeration: number;
  inactiveArtisans: number;
  unansweredQuestions: number;
  topCategories: string[];
  totalArtisans: number;
  totalProducts: number;
}

export async function generateAdminInsights(stats: MarketplaceStats): Promise<string[]> {
  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Eres el analista de datos de Casa Orfebre marketplace. Generas insights accionables para el equipo admin. Español chileno, tuteas, tono profesional.
Responde SOLO con un JSON array de strings, cada uno un insight de 1-2 oraciones. Sin markdown.`,
    messages: [
      {
        role: "user",
        content: `Genera 3-5 insights accionables para el equipo admin de Casa Orfebre:

Datos del marketplace:
- Ventas esta semana: ${stats.salesThisWeek}
- Ventas semana pasada: ${stats.salesLastWeek}
- Nuevos compradores (últimos 7 días): ${stats.newBuyers}
- Productos pendientes de moderación: ${stats.pendingModeration}
- Orfebres inactivos (sin publicar en 30 días): ${stats.inactiveArtisans}
- Preguntas sin responder: ${stats.unansweredQuestions}
- Categorías más populares: ${stats.topCategories.join(", ")}
- Total orfebres aprobados: ${stats.totalArtisans}
- Total productos aprobados: ${stats.totalProducts}

Genera insights que sean específicos a estos datos, no genéricos.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "[]";

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.slice(0, 5);
  } catch {
    // Try to extract insights from non-JSON response
    return [text.trim()];
  }

  return ["Revisa las métricas del marketplace regularmente para identificar tendencias."];
}
