import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import type { BlogCategory } from "@prisma/client";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

interface GenerateParams {
  topic: string;
  keywords: string[];
  targetCategory: BlogCategory;
  includeProductLinks: boolean;
}

interface GeneratedArticle {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
}

const SYSTEM_PROMPT = `Eres el editor de contenido de Casa Orfebre, un marketplace curado de joyería artesanal chilena. Escribes artículos para el blog de la marca.

VOZ DE MARCA:
- Sofisticada pero accesible. Nunca condescendiente.
- Experta en joyería artesanal, orfebrería y materiales nobles.
- Celebras el trabajo manual, la identidad chilena y la conexión emocional con las joyas.
- Usas español chileno formal: "ustedes" (nunca "vosotros"), tono cálido pero profesional.

FORMATO Y ESTRUCTURA:
- Largo: 1200-1800 palabras.
- Markdown limpio: sin frontmatter, sin HTML, sin bloques de código.
- H1 no incluir (será el título del artículo, que va aparte).
- Usa H2 (##) descriptivos que incluyan keywords naturalmente.
- Párrafos cortos (3-4 oraciones máximo).
- Incluye listas donde ayuden a la legibilidad.

SEO:
- Meta description: 150-160 caracteres exactos, con keyword principal.
- Meta title: máximo 60 caracteres, con keyword principal al inicio.
- Keywords integradas naturalmente en H2s y primeros párrafos.

RESPUESTA:
Responde SIEMPRE en JSON válido con esta estructura exacta:
{
  "title": "Título del artículo (H1, máx 80 chars)",
  "content": "Contenido completo en Markdown...",
  "excerpt": "Resumen de 1-2 oraciones para cards (máx 200 chars)",
  "metaTitle": "SEO title (máx 60 chars)",
  "metaDescription": "Meta description (150-160 chars exactos)",
  "tags": ["tag1", "tag2", "tag3"]
}

No incluyas nada fuera del JSON. No uses bloques de código markdown alrededor del JSON.`;

export async function generateBlogArticle(params: GenerateParams): Promise<GeneratedArticle> {
  let productContext = "";

  if (params.includeProductLinks) {
    const categoryMap: Record<string, string[]> = {
      GUIAS: [],
      TENDENCIAS: [],
      ORFEBRES: [],
      CUIDADOS: [],
      MATERIALES: [],
      CULTURA: [],
    };

    // Fetch recent approved products
    const products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      select: {
        name: true,
        slug: true,
        categories: { select: { name: true } },
        materials: { select: { name: true } },
        artisan: { select: { displayName: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 8,
    });

    if (products.length > 0) {
      const productList = products
        .map((p) => `- ${p.name} por ${p.artisan.displayName} (${p.materials.map((m) => m.name).join(", ")}): [${p.name}](/coleccion/${p.slug})`)
        .join("\n");

      productContext = `\n\nPRODUCTOS DISPONIBLES PARA MENCIONAR NATURALMENTE:
${productList}

Incluye 2-3 menciones naturales a estos productos usando los links markdown proporcionados. No fuerces las menciones — solo donde encaje orgánicamente con el contenido.`;
    }
  }

  const userPrompt = `Escribe un artículo sobre: ${params.topic}

Keywords objetivo: ${params.keywords.join(", ")}
Categoría: ${params.targetCategory}
Sugiere 3-5 tags relevantes en español.${productContext}`;

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: SYSTEM_PROMPT,
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON — handle potential markdown code block wrapping
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned) as GeneratedArticle;

  return {
    title: parsed.title,
    content: parsed.content,
    excerpt: parsed.excerpt,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    tags: parsed.tags,
  };
}

export async function suggestBlogTopics(existingTitles: string[]): Promise<string[]> {
  const titleList = existingTitles.length > 0
    ? existingTitles.map((t) => `- ${t}`).join("\n")
    : "- (ninguno aún)";

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Sugiere 5 ideas de artículos para el blog de Casa Orfebre (marketplace de joyería artesanal chilena).

Las ideas deben cubrir temas como: técnicas de orfebrería, materiales (plata 925/950, oro, cobre, piedras chilenas), ocasiones para regalar, tendencias de joyería, cuidado de joyas, cultura artesanal chilena, guías de compra.

ARTÍCULOS QUE YA EXISTEN (NO repetir ni temas similares):
${titleList}

Responde SOLO con un JSON array de 5 strings. Cada string es un título descriptivo y atractivo en español.
Ejemplo: ["Título 1", "Título 2", ...]
No incluyas nada fuera del JSON.`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned) as string[];
}
