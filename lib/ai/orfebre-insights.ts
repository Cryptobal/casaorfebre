import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface ArtisanStats {
  artisanName: string;
  totalProducts: number;
  monthlyViews: number;
  monthlySales: number;
  monthlyRevenue: number;
  avgResponseTimeHours: number;
  topProducts: { name: string; views: number; favorites: number; sales: number }[];
  bottomProducts: { name: string; views: number; favorites: number }[];
  favoriteCount: number;
  questionsAnswered: number;
  questionsUnanswered: number;
  platformAvgViews: number;
  platformAvgSales: number;
}

export async function generateWeeklyInsights(stats: ArtisanStats): Promise<string[]> {
  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: `Eres un analista de datos de Casa Orfebre, marketplace de joyería artesanal chilena.
Generas insights accionables y concretos para orfebres.
Español chileno, tuteas, tono profesional pero cercano.
Responde SOLO con un JSON array de strings, cada uno un insight de 1-2 oraciones. Sin markdown.`,
    messages: [
      {
        role: "user",
        content: `Genera 3-5 insights accionables para ${stats.artisanName}:

Datos del orfebre:
- Productos publicados: ${stats.totalProducts}
- Visitas este mes: ${stats.monthlyViews}
- Ventas este mes: ${stats.monthlySales}
- Ingresos este mes: $${stats.monthlyRevenue.toLocaleString("es-CL")}
- Favoritos totales: ${stats.favoriteCount}
- Preguntas respondidas: ${stats.questionsAnswered}, sin responder: ${stats.questionsUnanswered}
- Tiempo promedio de respuesta: ${stats.avgResponseTimeHours.toFixed(1)} horas

Top productos: ${stats.topProducts.map((p) => `${p.name} (${p.views} visitas, ${p.favorites} favs, ${p.sales} ventas)`).join("; ")}
Productos con menor rendimiento: ${stats.bottomProducts.map((p) => `${p.name} (${p.views} visitas, ${p.favorites} favs)`).join("; ")}

Promedios de la plataforma:
- Visitas promedio por orfebre: ${stats.platformAvgViews}
- Ventas promedio por orfebre: ${stats.platformAvgSales}

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

  return ["Visita tus estadísticas regularmente para identificar tendencias."];
}
