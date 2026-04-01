import Anthropic from "@anthropic-ai/sdk";
import { semanticSearch } from "@/lib/ai/search";
import { prisma } from "@/lib/prisma";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

const SYSTEM_PROMPT = `Eres la asistente de compras de Casa Orfebre, un marketplace de joyería artesanal chilena.

Tu personalidad:
- Cálida, experta en joyería, atenta, nunca insistente
- Tuteas al comprador ("¿buscas algo especial?" no "¿busca usted?")
- Español chileno natural pero elegante
- Breve: respuestas de 2-4 oraciones máximo
- Si no puedes ayudar con algo, sugiere contactar por WhatsApp al +56 9 6878 0089

Tu objetivo:
- Entender qué busca el comprador (regalo, para sí mismo, ocasión)
- Hacer máximo 1-2 preguntas para afinar (presupuesto, estilo, material)
- Recomendar productos REALES del catálogo (NUNCA inventar productos)
- Dar el link directo al producto cuando recomiendes

Reglas estrictas:
- NUNCA compartas información de contacto de los orfebres
- NUNCA inventes productos que no existen
- Si el comprador pide algo que no hay en el catálogo, dilo honestamente
- No proceses pagos ni des información sobre pedidos existentes

Cuando recibas CONTEXTO DE PRODUCTOS, elige los más relevantes para recomendar. Incluye el nombre exacto y slug para que el frontend muestre las tarjetas. Responde en formato:

Si recomiendas productos, incluye al final de tu respuesta una línea especial:
[PRODUCTS: slug1, slug2, slug3]

Si no recomiendas productos, no incluyas esa línea.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SessionContext {
  viewingProductId?: string;
  viewingCategory?: string;
}

interface ChatResponse {
  reply: string;
  productSlugs?: string[];
  action: "show_products" | "navigate" | "none";
}

interface ProductContext {
  name: string;
  slug: string;
  price: number;
  materials: string[];
  artisanName: string;
  description: string;
}

function detectSearchIntent(message: string): boolean {
  const searchKeywords = [
    "busco", "quiero", "necesito", "regalo", "regalar",
    "anillo", "collar", "aros", "pulsera", "broche", "colgante",
    "plata", "oro", "cobre", "bronce",
    "recomendar", "recomendación", "sugerencia", "sugiere",
    "algo para", "algo de", "algo en",
    "económico", "barato", "presupuesto",
    "elegante", "minimalista", "bohemio", "llamativo",
    "cumpleaños", "aniversario", "navidad", "madre",
    "joya", "joyas", "joyería", "pieza", "piezas",
    "tienes", "tienen", "hay", "mostrar", "ver",
  ];
  const lower = message.toLowerCase();
  return searchKeywords.some((kw) => lower.includes(kw));
}

export async function chat(params: {
  messages: ChatMessage[];
  sessionContext?: SessionContext;
}): Promise<ChatResponse> {
  const { messages, sessionContext } = params;
  const lastUserMessage = messages[messages.length - 1]?.content ?? "";

  let productContext: ProductContext[] = [];

  // Search for products if the user seems to be looking for something
  if (detectSearchIntent(lastUserMessage)) {
    try {
      const results = await semanticSearch(lastUserMessage, undefined, 8);

      if (results.length > 0) {
        const productIds = results.map((r) => r.id);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            name: true,
            slug: true,
            price: true,
            description: true,
            materials: { select: { name: true } },
            artisan: { select: { displayName: true } },
          },
        });

        productContext = products.map((p) => ({
          name: p.name,
          slug: p.slug,
          price: p.price,
          materials: p.materials.map((m) => m.name),
          artisanName: p.artisan.displayName,
          description: p.description.substring(0, 150),
        }));
      }
    } catch (e) {
      console.error("Error searching products for chat:", e);
    }
  }

  // If viewing a specific product, add its context
  if (sessionContext?.viewingProductId && productContext.length === 0) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: sessionContext.viewingProductId },
        select: {
          name: true,
          slug: true,
          price: true,
          description: true,
          materials: { select: { name: true } },
          artisan: { select: { displayName: true } },
        },
      });
      if (product) {
        productContext = [{
          name: product.name,
          slug: product.slug,
          price: product.price,
          materials: product.materials.map((m) => m.name),
          artisanName: product.artisan.displayName,
          description: product.description.substring(0, 150),
        }];
      }
    } catch (e) {
      console.error("Error fetching product context:", e);
    }
  }

  // Build the user message with product context
  let augmentedUserMessage = lastUserMessage;
  if (productContext.length > 0) {
    const contextStr = productContext
      .map(
        (p) =>
          `- ${p.name} (slug: ${p.slug}) — $${p.price.toLocaleString("es-CL")} — Materiales: ${p.materials.join(", ")} — Por: ${p.artisanName} — ${p.description}`,
      )
      .join("\n");
    augmentedUserMessage = `${lastUserMessage}\n\nCONTEXTO DE PRODUCTOS DISPONIBLES:\n${contextStr}`;
  }

  const anthropicMessages = messages.slice(0, -1).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  anthropicMessages.push({ role: "user", content: augmentedUserMessage });

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: anthropicMessages,
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Parse product slugs from response
  const productMatch = text.match(/\[PRODUCTS:\s*([^\]]+)\]/);
  let productSlugs: string[] | undefined;
  let cleanReply = text;

  if (productMatch) {
    productSlugs = productMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
    cleanReply = text.replace(/\[PRODUCTS:[^\]]+\]/, "").trim();
  }

  return {
    reply: cleanReply,
    productSlugs,
    action: productSlugs && productSlugs.length > 0 ? "show_products" : "none",
  };
}
