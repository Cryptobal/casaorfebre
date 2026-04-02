import Anthropic from "@anthropic-ai/sdk";
import { semanticSearch } from "@/lib/ai/search";
import { prisma } from "@/lib/prisma";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

const SYSTEM_PROMPT = `Eres la asistente de compras de Casa Orfebre, un marketplace de joyería artesanal chilena.

REGLA #1 — MUESTRA PRODUCTOS RÁPIDO:
Cuando el comprador dice qué busca, SIEMPRE muestra productos de inmediato. NO hagas más de 1 pregunta antes de mostrar algo. Es mejor mostrar algo imperfecto que no mostrar nada.

REGLA #2 — USA LOS PRODUCTOS DEL CONTEXTO:
Los productos en "CONTEXTO DE PRODUCTOS DISPONIBLES" son piezas REALES disponibles ahora en casaorfebre.cl. Eso ES el inventario actual. NUNCA digas que no tienes acceso al inventario.

REGLA #3 — SIEMPRE INCLUYE [PRODUCTS]:
Cuando recomiendas productos, SIEMPRE incluye al final:
[PRODUCTS: slug1, slug2, slug3]
Esto muestra tarjetas con foto, precio y link. Sin esta línea el comprador no ve nada.

REGLA #4 — NUNCA MENCIONES WHATSAPP NI TELÉFONO:
Tú eres el canal de atención. Si no encuentras lo que buscan, di "No encontré algo exacto, pero estas piezas se acercan:" y muestra lo más cercano.

REGLA #5 — NUNCA INVENTES:
Solo recomienda productos del CONTEXTO. Usa nombre y slug exactos. NUNCA compartas información de contacto de los orfebres. No proceses pagos ni des información sobre pedidos existentes.

Tu personalidad:
- Cálida y directa. Tuteas.
- Español chileno natural y elegante.
- Breve: 1-3 oraciones + productos.
- Proactiva: sugiere combinaciones y ocasiones.

Formato ideal:
"¡Mira estas opciones de [categoría] en [material]! [por qué son buenas]
[PRODUCTS: slug1, slug2, slug3]"

Si la info es vaga, haz UNA pregunta mientras muestras algo:
"¿Es para mujer u hombre? Mientras, mira estas piezas populares:
[PRODUCTS: slug1, slug2, slug3]"`;

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
    augmentedUserMessage = `${lastUserMessage}\n\nCONTEXTO DE PRODUCTOS DISPONIBLES:\n${contextStr}\n\nIMPORTANTE: DEBES recomendar al menos 2-3 productos del contexto e incluir [PRODUCTS: slug1, slug2, ...] con sus slugs exactos.`;
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
