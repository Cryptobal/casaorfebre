import { Prisma } from "@prisma/client";
import { semanticSearch } from "@/lib/ai/search";
import { prisma } from "@/lib/prisma";

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
Solo recomienda productos del CONTEXTO. Usa los slugs EXACTOS que aparecen entre paréntesis (slug: xxx) en el contexto. Si un slug no está en el contexto, NO lo incluyas. NUNCA compartas información de contacto de los orfebres. No proceses pagos ni des información sobre pedidos existentes.

REGLA #6 — NO USES MARKDOWN:
NUNCA uses **negritas**, *cursivas*, ni formato markdown. Escribe texto plano simple. Nombra los productos sin formato especial.

REGLA #7 — CANTIDAD Y PRECIO:
Recomienda máximo 3 productos por respuesta (salvo que pidan ver más). Menciona precios en formato chileno ($45.000). Entiende jerga local: "lucas" = miles de pesos ("30 lucas" = $30.000), "luca" = $1.000.

REGLA #8 — CONVERSACIÓN GUIADA:
Cierra cada respuesta con UNA micro-pregunta natural que avance la conversación (ocasión, estilo, presupuesto o para quién es). Nunca más de una pregunta.

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

interface ProductContext {
  name: string;
  slug: string;
  price: number;
  materials: string[];
  artisanName: string;
  description: string;
}

export interface ChatProductCard {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  artisanName: string;
}

export interface PreparedChat {
  system: string;
  anthropicMessages: { role: "user" | "assistant"; content: string }[];
}

/**
 * Precio máximo tolerante a chilenismos:
 *  - "30 lucas" / "30 luca" → 30.000
 *  - "50 mil"              → 50.000
 *  - "$45.000" / "45000"   → 45.000
 */
function parseMaxPriceCLP(text: string): number | undefined {
  const lower = text.toLowerCase();
  const lucas = lower.match(/(\d{1,3})\s*lucas?\b/);
  if (lucas) return parseInt(lucas[1], 10) * 1000;
  const mil = lower.match(/(\d{1,3})\s*mil\b/);
  if (mil) return parseInt(mil[1], 10) * 1000;
  const num = lower.match(/\$?\s?(\d{1,3}(?:[.,]\d{3})+|\d{4,7})/);
  if (num) return parseInt(num[1].replace(/[.,]/g, ""), 10);
  return undefined;
}

const productSelect = {
  name: true,
  slug: true,
  price: true,
  description: true,
  materials: { select: { name: true } },
  artisan: { select: { displayName: true } },
} as const;

function toProductContext(
  products: Array<{
    name: string;
    slug: string;
    price: number;
    description: string;
    materials: { name: string }[];
    artisan: { displayName: string };
  }>,
): ProductContext[] {
  return products.map((p) => ({
    name: p.name,
    slug: p.slug,
    price: p.price,
    materials: p.materials.map((m) => m.name),
    artisanName: p.artisan.displayName,
    description: p.description.substring(0, 150),
  }));
}

/**
 * Reúne el contexto de productos (retrieval SIEMPRE activo) y devuelve el
 * `system` + los mensajes listos para Anthropic con el último turno de usuario
 * aumentado con el catálogo disponible. El streaming lo hace el route.
 */
export async function prepareChat(params: {
  messages: ChatMessage[];
  sessionContext?: SessionContext;
}): Promise<PreparedChat> {
  const { messages, sessionContext } = params;

  const userMsgs = messages.filter((m) => m.role === "user").map((m) => m.content);
  const last = userMsgs[userMsgs.length - 1] ?? "";
  // Query de retrieval contextual: si el último mensaje es corto (p.ej. "¿y en
  // oro?"), hereda el mensaje anterior para no perder el contexto.
  const retrievalQuery =
    last.length < 25 && userMsgs.length >= 2
      ? `${userMsgs[userMsgs.length - 2]} ${last}`
      : last;

  let productContext: ProductContext[] = [];

  // Intento 1: búsqueda semántica (embeddings)
  try {
    const results = await semanticSearch(retrievalQuery, undefined, 8);
    if (results.length > 0) {
      const productIds = results.map((r) => r.id);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: productSelect,
      });
      productContext = toProductContext(products);
    }
  } catch (e) {
    console.error("Semantic search failed, falling back to SQL:", e);
  }

  // Intento 2: fallback a búsqueda SQL si semántica retorna 0
  if (productContext.length === 0) {
    try {
      const lower = retrievalQuery.toLowerCase();

      const categoryMatch = [
        "anillo", "collar", "aros", "pulsera", "broche", "colgante", "cadena", "tobillera",
      ].find((cat) => lower.includes(cat));

      const materialMatch = [
        "plata", "oro", "cobre", "bronce", "alpaca", "acero", "lapislazuli",
      ].find((mat) => lower.includes(mat));

      const maxPrice = parseMaxPriceCLP(retrievalQuery);

      const where: Prisma.ProductWhereInput = {
        status: "APPROVED",
        artisan: { status: "APPROVED" },
      };
      if (categoryMatch) {
        where.categories = { some: { slug: { contains: categoryMatch } } };
      }
      if (materialMatch) {
        where.materials = { some: { name: { contains: materialMatch, mode: "insensitive" } } };
      }
      if (maxPrice) {
        where.price = { lte: maxPrice };
      }

      const fallbackProducts = await prisma.product.findMany({
        where,
        select: productSelect,
        orderBy: { createdAt: "desc" },
        take: 8,
      });

      if (fallbackProducts.length > 0) {
        productContext = toProductContext(fallbackProducts);
      } else {
        // Sin resultados filtrados → mostrar los más recientes
        const recentProducts = await prisma.product.findMany({
          where: { status: "APPROVED", artisan: { status: "APPROVED" } },
          select: productSelect,
          orderBy: { createdAt: "desc" },
          take: 6,
        });
        productContext = toProductContext(recentProducts);
      }
    } catch (e) {
      console.error("Fallback SQL search also failed:", e);
    }
  }

  // Si está viendo un producto específico, súmalo como contexto.
  if (sessionContext?.viewingProductId && productContext.length === 0) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: sessionContext.viewingProductId },
        select: productSelect,
      });
      if (product) {
        productContext = toProductContext([product]);
      }
    } catch (e) {
      console.error("Error fetching product context:", e);
    }
  }

  // Construye el mensaje de usuario con el contexto de productos.
  let augmentedUserMessage = last;
  if (productContext.length > 0) {
    const contextStr = productContext
      .map(
        (p) =>
          `- ${p.name} (slug: ${p.slug}) — $${p.price.toLocaleString("es-CL")} — Materiales: ${p.materials.join(", ")} — Por: ${p.artisanName} — ${p.description}`,
      )
      .join("\n");
    augmentedUserMessage = `${last}\n\nCONTEXTO DE PRODUCTOS DISPONIBLES:\n${contextStr}\n\nIMPORTANTE: DEBES recomendar al menos 2-3 productos del contexto e incluir [PRODUCTS: slug1, slug2, ...] con sus slugs exactos.`;
  } else {
    augmentedUserMessage += "\n\nNo se encontraron productos en el catálogo para esta búsqueda. Responde de forma útil sugiriendo que exploren el catálogo completo en casaorfebre.cl/coleccion o que prueben con otro estilo/material. NUNCA digas que no tienes acceso al inventario.";
  }

  const history = messages
    .slice(0, -1)
    .map((m) => ({ role: m.role, content: m.content }));
  // Anthropic exige que el primer mensaje sea del usuario: descarta turnos
  // "assistant" iniciales (p.ej. la burbuja de bienvenida).
  while (history.length > 0 && history[0].role === "assistant") history.shift();
  history.push({ role: "user", content: augmentedUserMessage });

  return { system: SYSTEM_PROMPT, anthropicMessages: history };
}

/** Extrae `[PRODUCTS: a, b, c]` del texto y devuelve la respuesta limpia + slugs. */
export function parseProductSlugs(text: string): { cleanReply: string; slugs: string[] } {
  const productMatch = text.match(/\[PRODUCTS:\s*([^\]]+)\]/);
  if (!productMatch) return { cleanReply: text, slugs: [] };
  const slugs = productMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
  const cleanReply = text.replace(/\[PRODUCTS:[^\]]+\]/, "").trim();
  return { cleanReply, slugs };
}

/** Hidrata las tarjetas de producto (foto/precio/orfebre) preservando el orden de slugs. */
export async function fetchProductCards(slugs: string[]): Promise<ChatProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { slug: { in: slugs }, status: "APPROVED", artisan: { status: "APPROVED" } },
    select: {
      slug: true,
      name: true,
      price: true,
      artisan: { select: { displayName: true } },
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs
    .map((s) => bySlug.get(s))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({
      slug: r.slug,
      name: r.name,
      price: r.price,
      image: r.images[0]?.url ?? null,
      artisanName: r.artisan.displayName,
    }));
}
