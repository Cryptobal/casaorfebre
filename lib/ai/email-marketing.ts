import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export type EmailTrigger =
  | "WISHLIST_REMINDER"
  | "ABANDONED_BROWSE"
  | "POST_PURCHASE_CROSS_SELL"
  | "NEW_FROM_FOLLOWED_ARTISAN"
  | "PRICE_DROP"
  | "BACK_IN_STOCK";

interface ProductSummary {
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  artisanName: string;
}

const TRIGGER_DESCRIPTIONS: Record<EmailTrigger, string> = {
  WISHLIST_REMINDER:
    "Recordatorio de wishlist — el comprador guardó productos y no los ha comprado. Menciona urgencia si el stock es bajo.",
  ABANDONED_BROWSE:
    "Productos que el comprador visitó pero no compró. Tono suave y no insistente.",
  POST_PURCHASE_CROSS_SELL:
    "El comprador compró algo hace 30 días. Sugiere nuevos productos del mismo orfebre.",
  NEW_FROM_FOLLOWED_ARTISAN:
    "Un orfebre que el comprador sigue publicó algo nuevo. Entusiasmo genuino.",
  PRICE_DROP:
    "Un producto que le gustó al comprador ahora tiene mejor precio.",
  BACK_IN_STOCK:
    "Un producto que estaba agotado volvió a estar disponible.",
};

export async function generateEmailCopy(params: {
  trigger: EmailTrigger;
  buyerName: string;
  products: ProductSummary[];
  artisanName?: string;
}): Promise<{ subject: string; previewText: string; bodyHtml: string }> {
  const { trigger, buyerName, products, artisanName } = params;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl").replace(/\/$/, "");

  const productList = products
    .map(
      (p) =>
        `- ${p.name} ($${p.price.toLocaleString("es-CL")}) por ${p.artisanName} → ${appUrl}/coleccion/${p.slug}`,
    )
    .join("\n");

  const response = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 768,
    system: `Eres la redactora de emails de Casa Orfebre, marketplace de joyería artesanal chilena.
Escribe emails breves, cálidos, elegantes. Español chileno, tutea al comprador.
NUNCA uses emojis en el subject. Puedes usar 1-2 emojis discretos en el body.
El email DEBE incluir un link de desuscripción al final.
Responde en JSON exacto (sin markdown, sin backticks):
{"subject": "...", "previewText": "...", "bodyHtml": "HTML del contenido del email (solo el contenido, sin head/body/wrapper)"}
El bodyHtml debe usar estilos inline. Usa <a> tags para links a productos. Incluye botón CTA principal.`,
    messages: [
      {
        role: "user",
        content: `Trigger: ${trigger}
Descripción del trigger: ${TRIGGER_DESCRIPTIONS[trigger]}
Nombre del comprador: ${buyerName}
${artisanName ? `Orfebre mencionado: ${artisanName}` : ""}

Productos:
${productList}

URL base: ${appUrl}
Link de desuscripción: ${appUrl}/preferencias-email

Genera el email:`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const parsed = JSON.parse(text);
    return {
      subject: parsed.subject || "Novedades de Casa Orfebre",
      previewText: parsed.previewText || "Descubre lo nuevo en joyería artesanal",
      bodyHtml: parsed.bodyHtml || `<p>Hola ${buyerName}, visita Casa Orfebre para ver las novedades.</p>`,
    };
  } catch {
    return {
      subject: "Novedades de Casa Orfebre",
      previewText: "Descubre lo nuevo en joyería artesanal",
      bodyHtml: `<p>Hola ${buyerName}, visita <a href="${appUrl}" style="color:#8B7355;">Casa Orfebre</a> para ver las novedades.</p>`,
    };
  }
}
