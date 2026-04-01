import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface ProductSummary {
  id: string;
  name: string;
  category: string;
  materials: string[];
  price: number;
  artisanName: string;
}

export interface CollectionSuggestion {
  name: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  productIds: string[];
}

const SUGGEST_SYSTEM_PROMPT = `Eres el curador de Casa Orfebre, un marketplace de joyería artesanal chilena.

Analiza el catálogo de productos y sugiere 5 colecciones temáticas atractivas para compradores.

Reglas:
- Cada colección agrupa mínimo 4 productos con una conexión clara
- Nombres evocadores en español (ej: "Raíces de Cobre", "Minimalismo en Plata", "Piedras del Desierto")
- NO repetir colecciones que ya existen
- Incluir variedad: al menos una por estilo, una por material, una por ocasión
- Descripción SEO de 100-150 palabras por colección
- El slug debe ser kebab-case sin tildes ni caracteres especiales

Responde SOLO en JSON:
[
  {
    "name": "Nombre evocador",
    "slug": "nombre-en-kebab-case",
    "description": "Descripción SEO 100-150 palabras",
    "metaTitle": "Título para meta tag, máx 60 chars",
    "metaDescription": "Meta description, 150-160 chars",
    "productIds": ["id1", "id2", "id3", "id4"]
  }
]

No incluyas nada fuera del JSON. No uses bloques de código markdown alrededor del JSON.`;

export async function suggestCollections(params: {
  products: ProductSummary[];
  existingCollections: string[];
}): Promise<CollectionSuggestion[]> {
  const { products, existingCollections } = params;

  const productList = products
    .map((p) => `- ID: ${p.id} | ${p.name} | ${p.category} | ${p.materials.join(", ")} | $${p.price} | por ${p.artisanName}`)
    .join("\n");

  const existingList = existingCollections.length > 0
    ? existingCollections.join(", ")
    : "(ninguna aún)";

  const userPrompt = `CATÁLOGO DE PRODUCTOS (${products.length} piezas):
${productList}

COLECCIONES QUE YA EXISTEN (NO repetir):
${existingList}

Sugiere 5 colecciones temáticas:`;

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SUGGEST_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned) as CollectionSuggestion[];
}

export async function refreshCollectionProducts(
  collection: { name: string; description: string },
  allProducts: ProductSummary[]
): Promise<string[]> {
  const productList = allProducts
    .map((p) => `${p.id}: ${p.name} (${p.category}, ${p.materials.join(", ")})`)
    .join("\n");

  const message = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `De estos productos, ¿cuáles encajan en la colección "${collection.name}" descrita como "${collection.description}"?

PRODUCTOS:
${productList}

Retorna SOLO un JSON array de IDs. Ejemplo: ["id1", "id2", "id3"]
No incluyas nada fuera del JSON.`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned) as string[];
}
