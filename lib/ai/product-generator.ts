import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface ProductListing {
  title: string;
  description: string;
  suggestedCategory: string;
  suggestedMaterials: string[];
  suggestedTechnique: string;
  suggestedStyle: string;
  altTexts: string[];
}

const SYSTEM_PROMPT = `Eres el asistente de publicación de Casa Orfebre, un marketplace curado de joyería artesanal chilena.

Analiza las fotos de esta pieza de joyería artesanal y genera un listado completo para publicar.

Responde SOLO en JSON con esta estructura exacta:
{
  "title": "Título evocador de máx 80 caracteres. NO incluir el nombre del orfebre.",
  "description": "Descripción emotiva de 150-300 palabras que cuente la historia de la pieza. Menciona materiales, técnica, inspiración. Tono: sofisticado pero cálido, nunca genérico. Español chileno formal.",
  "suggestedCategory": "Una de: anillo, collar, aros, pulsera, broche, colgante, cadena, tobillera, piercing, diadema-tiara, gemelos, set",
  "suggestedMaterials": ["Array de materiales identificados visualmente. Usa nombres del catálogo: Plata 925, Plata 950, Oro 18k, Oro 14k, Cobre, Bronce, Alpaca, Acero, Cuero, Hilo, Piedras naturales, Madera, Resina, Cerámica, Textil, Vidrio"],
  "suggestedTechnique": "Técnica principal: fundición, filigrana, engaste, repujado, tejido, forja, esmaltado, cincelado, calado, granulado, soldadura, oxidado, martillado, grabado",
  "suggestedStyle": "Estilo: minimalista, bohemio, étnico, clásico, contemporáneo, orgánico",
  "altTexts": ["Alt text descriptivo en español para cada imagen analizada, máx 125 chars cada uno"]
}

No incluyas nada fuera del JSON. No uses bloques de código markdown alrededor del JSON.`;

export async function analyzeAndGenerateListing(params: {
  imageUrls: string[];
  artisanName: string;
  extraContext?: string;
}): Promise<ProductListing> {
  const { imageUrls, artisanName, extraContext } = params;

  // Limit to 4 images max
  const urls = imageUrls.slice(0, 4);

  // Build image content blocks — fetch and convert to base64 since R2 URLs may not be directly accessible to Anthropic
  const imageBlocks: Anthropic.Messages.ImageBlockParam[] = await Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const contentType = response.headers.get("content-type") || "image/jpeg";
      const mediaType = contentType as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType,
          data: base64,
        },
      };
    })
  );

  let userText = `Esta pieza fue creada por ${artisanName}. Analiza estas ${urls.length} foto(s) y genera un listado completo para el marketplace.`;
  if (extraContext) {
    userText += `\n\nNotas del orfebre: ${extraContext}`;
  }

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks,
          { type: "text", text: userText },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON — handle potential markdown code block wrapping
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned) as ProductListing;

  return parsed;
}
