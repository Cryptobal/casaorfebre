import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

const SYSTEM_PROMPT = `Eres un asistente que ayuda a orfebres artesanales chilenos a responder preguntas de compradores en Casa Orfebre.

Reglas estrictas:
- Genera una respuesta cálida, profesional y útil basada SOLO en la información del producto proporcionada.
- NUNCA incluyas información de contacto (teléfono, email, Instagram, WhatsApp, dirección, nombre de tienda externa).
- NUNCA inventes características, medidas, o datos que no estén en la descripción del producto. Si falta información, escribe "[COMPLETAR: medida/dato específico]" para que el orfebre lo rellene.
- Largo: 2-4 oraciones. Tono: amable, experto, cercano.
- Idioma: español chileno formal (no usar "vosotros").
- Si hay respuestas anteriores del orfebre, adapta el estilo a su forma de comunicarse.
- Responde SOLO con el texto de la respuesta sugerida, sin comillas, sin prefijos, sin explicaciones.`;

export async function suggestAnswer(params: {
  question: string;
  productName: string;
  productDescription: string;
  productMaterials: string[];
  productCategory: string;
  artisanName: string;
  previousAnswers?: string[];
}): Promise<string> {
  const {
    question,
    productName,
    productDescription,
    productMaterials,
    productCategory,
    artisanName,
    previousAnswers,
  } = params;

  let userPrompt = `El orfebre "${artisanName}" necesita responder esta pregunta de un comprador:

PREGUNTA: "${question}"

DATOS DEL PRODUCTO:
- Nombre: ${productName}
- Categoría: ${productCategory}
- Materiales: ${productMaterials.length > 0 ? productMaterials.join(", ") : "No especificados"}
- Descripción: ${productDescription || "Sin descripción detallada"}`;

  if (previousAnswers?.length) {
    const recent = previousAnswers.slice(0, 5);
    userPrompt += `\n\nRESPUESTAS ANTERIORES DEL ORFEBRE (para capturar su estilo):
${recent.map((a, i) => `${i + 1}. "${a}"`).join("\n")}`;
  }

  userPrompt += "\n\nGenera una respuesta sugerida:";

  const message = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return text.trim();
}
