import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface ProductListing {
  // Básicos
  title: string;
  description: string;
  story: string;

  // Clasificación
  suggestedCategory: string;
  suggestedMaterials: string[];
  suggestedTechnique: string;
  suggestedSpecialties: string[];
  suggestedOccasions: string[];
  suggestedAudiencia: string;
  suggestedStyle: string;

  // Producción y stock
  suggestedProductionType: string;
  suggestedStock: number;
  suggestedElaborationDays: number;
  suggestedCantidadEdicion: number | null;
  isCustomizable: boolean;
  detallePersonalizacion: string | null;

  // Precio
  suggestedPrice: number;

  // Dimensiones
  suggestedDimensions: string | null;
  suggestedWeight: number | null;
  suggestedDiametroMm: number | null;

  // Anillos
  suggestedTallaUnica: string | null;

  // Collares/colgantes
  suggestedTieneCadena: boolean | null;
  suggestedLargoCadenaCm: number | null;

  // Aros
  suggestedEarringWidth: number | null;
  suggestedEarringDrop: number | null;

  // Piedras
  suggestedStones: Array<{
    type: string;
    color: string;
    quantity: number;
    cut: string;
  }> | null;

  // Cuidados, empaque, garantía
  suggestedCuidados: string;
  suggestedEmpaque: string;
  suggestedGarantia: string;

  // Alt texts
  altTexts: string[];
}

const SYSTEM_PROMPT = `Eres el asistente de publicación de Casa Orfebre, un marketplace curado de joyería artesanal chilena.

Analiza las fotos y la descripción del orfebre para generar un listado COMPLETO con todos los campos necesarios.

IMPORTANTE sobre precios: Estima un precio en pesos chilenos (CLP) basándote en:
- Plata 925/950: piezas simples $25.000-$60.000, complejas $60.000-$150.000
- Oro: $150.000-$500.000+
- Cobre/Bronce: $15.000-$45.000
- Con piedras naturales: agregar $10.000-$50.000 al rango base
- Pieza única: +20-30% sobre producción artesanal
- El precio es una SUGERENCIA — el orfebre lo ajustará

IMPORTANTE sobre dimensiones: Estima dimensiones aproximadas basándote en las proporciones visibles en las fotos. Si no puedes estimar con confianza, usa null.

IMPORTANTE sobre cuidados/empaque/garantía: Genera texto apropiado para joyería artesanal chilena según el material detectado.

Responde SOLO en JSON con esta estructura exacta:
{
  "title": "Título evocador máx 80 chars, sin nombre del orfebre",
  "description": "Descripción emotiva 150-300 palabras. Tono Casa Orfebre: sofisticado, cálido, español chileno formal.",
  "story": "Historia corta de la pieza: inspiración, proceso, significado. 50-100 palabras.",
  "suggestedCategory": "anillo|collar|aros|pulsera|broche|colgante|cadena|tobillera|piercing|diadema-tiara|gemelos|set",
  "suggestedMaterials": ["Plata 925", "..."],
  "suggestedTechnique": "fundición|filigrana|engaste|repujado|tejido|forja|esmaltado|cincelado|calado|granulado|martillado|grabado|soldadura|oxidado",
  "suggestedSpecialties": ["Joyería contemporánea", "..."],
  "suggestedOccasions": ["Regalo", "Día a día", "Matrimonio", "Aniversario", "Graduación"],
  "suggestedAudiencia": "MUJER|HOMBRE|UNISEX|SIN_ESPECIFICAR",
  "suggestedStyle": "minimalista|bohemio|étnico|clásico|contemporáneo|orgánico",
  "suggestedProductionType": "UNIQUE|MADE_TO_ORDER|LIMITED",
  "suggestedStock": 1,
  "suggestedElaborationDays": 7,
  "suggestedCantidadEdicion": null,
  "isCustomizable": false,
  "detallePersonalizacion": null,
  "suggestedPrice": 45000,
  "suggestedDimensions": "3.5 x 2.0 cm",
  "suggestedWeight": 12,
  "suggestedDiametroMm": null,
  "suggestedTallaUnica": null,
  "suggestedTieneCadena": null,
  "suggestedLargoCadenaCm": null,
  "suggestedEarringWidth": null,
  "suggestedEarringDrop": null,
  "suggestedStones": null,
  "suggestedCuidados": "Guardar en lugar seco. Evitar contacto con perfumes y productos químicos. Limpiar con paño suave.",
  "suggestedEmpaque": "Caja artesanal de cartón kraft con interior de tela. Incluye tarjeta del orfebre.",
  "suggestedGarantia": "Garantía de 6 meses por defectos de fabricación. No cubre desgaste normal ni golpes.",
  "altTexts": ["Alt text descriptivo por cada imagen, máx 125 chars"]
}

No incluyas nada fuera del JSON. No uses bloques de código markdown.`;

export async function analyzeAndGenerateListing(params: {
  imageUrls: string[];
  artisanName: string;
  extraContext?: string;
}): Promise<ProductListing> {
  const { imageUrls, artisanName, extraContext } = params;

  const urls = imageUrls.slice(0, 4);

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

  let userText = `Esta pieza fue creada por ${artisanName}. Analiza estas ${urls.length} foto(s) y genera un listado COMPLETO para el marketplace.`;
  if (extraContext) {
    userText += `\n\nDescripción del orfebre: ${extraContext}`;
  }

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
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
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned) as ProductListing;
}
