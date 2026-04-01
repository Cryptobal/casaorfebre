import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface ApplicationReview {
  qualityScore: number; // 1-10
  originalityScore: number; // 1-10
  diversityScore: number; // 1-10
  overallRecommendation: "APPROVE" | "REVIEW" | "REJECT";
  summary: string;
  strengths: string[];
  concerns: string[];
}

export async function reviewApplication(params: {
  applicationData: {
    name: string;
    specialty: string;
    bio: string;
    categories: string[];
    materials: string[];
    experience?: string | null;
    yearsExperience?: number | null;
    awards: string[];
  };
  portfolioImageUrls: string[];
}): Promise<ApplicationReview> {
  const { applicationData, portfolioImageUrls } = params;

  const content: Anthropic.ContentBlockParam[] = [];

  // Add portfolio images (up to 6)
  for (const url of portfolioImageUrls.slice(0, 6)) {
    content.push({
      type: "image",
      source: { type: "url", url },
    });
  }

  content.push({
    type: "text",
    text: `Evalúa esta postulación de orfebre para Casa Orfebre, marketplace de joyería artesanal chilena.

DATOS DEL POSTULANTE:
- Nombre: ${applicationData.name}
- Especialidad: ${applicationData.specialty}
- Bio: ${applicationData.bio}
- Categorías: ${applicationData.categories.join(", ") || "No especificadas"}
- Materiales: ${applicationData.materials.join(", ") || "No especificados"}
- Experiencia: ${applicationData.experience || "No especificada"}
- Años de experiencia: ${applicationData.yearsExperience ?? "No especificados"}
- Premios: ${applicationData.awards.length > 0 ? applicationData.awards.join(", ") : "Ninguno"}
- Fotos de portfolio: ${portfolioImageUrls.length}

CRITERIOS DE EVALUACIÓN:
1. Calidad visual (iluminación, composición, enfoque de las fotos)
2. Originalidad de diseño (no genérico, tiene sello propio)
3. Diversidad de piezas (variedad de tipos, no solo un tipo de pieza)
4. Coherencia artesanal (parecen hechas a mano, no industriales)

Responde en JSON exacto (sin markdown, sin backticks):
{
  "qualityScore": 1-10,
  "originalityScore": 1-10,
  "diversityScore": 1-10,
  "overallRecommendation": "APPROVE" | "REVIEW" | "REJECT",
  "summary": "resumen ejecutivo de 2-3 oraciones",
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "concerns": ["preocupación 1"] (puede estar vacío)
}

Si las fotos no son claras o no hay suficiente información, asigna puntajes moderados y recomienda "REVIEW".
Preferimos ser inclusivos: solo recomienda "REJECT" si hay señales claras de producto industrial o fraude.`,
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
      qualityScore: Math.min(10, Math.max(1, parsed.qualityScore || 5)),
      originalityScore: Math.min(10, Math.max(1, parsed.originalityScore || 5)),
      diversityScore: Math.min(10, Math.max(1, parsed.diversityScore || 5)),
      overallRecommendation: ["APPROVE", "REVIEW", "REJECT"].includes(parsed.overallRecommendation)
        ? parsed.overallRecommendation
        : "REVIEW",
      summary: parsed.summary || "Análisis no disponible",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
    };
  } catch (e) {
    console.error("Application review error:", e);
    return {
      qualityScore: 5,
      originalityScore: 5,
      diversityScore: 5,
      overallRecommendation: "REVIEW",
      summary: "No se pudo completar el análisis automático. Se recomienda revisión manual.",
      strengths: [],
      concerns: ["Análisis automático falló — revisar manualmente"],
    };
  }
}
