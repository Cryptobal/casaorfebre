import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { getResend, FROM_EMAIL } from "@/lib/resend";

export const runtime = "nodejs";
export const maxDuration = 120;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
const CAMILA_EMAIL = "camilatorrespuga@gmail.com";
const CARLOS_EMAIL = "carlos.irigoyen@gmail.com";

async function generateCaption(product: {
  name: string;
  description: string;
  materials: { name: string }[];
  categories: { name: string }[];
  artisan: { displayName: string; region: string | null };
  productionType: string;
  technique: string | null;
  slug: string;
}): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const materialsList = product.materials.map((m) => m.name).join(", ");
  const categoriesList = product.categories.map((c) => c.name).join(", ");
  const region = product.artisan.region || "Chile";

  const typeLabel: Record<string, string> = {
    UNIQUE: "pieza única",
    MADE_TO_ORDER: "elaborada bajo pedido",
    LIMITED: "edición limitada",
  };

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Escribe un caption de Instagram para Casa Orfebre (@casaorfebre), galería editorial de joyería artesanal chilena.

Pieza: ${product.name}
Categoría: ${categoriesList}
Material: ${materialsList || "plata artesanal"}
Técnica: ${product.technique || "orfebrería artesanal"}
Orfebre: ${product.artisan.displayName}, ${region}
Tipo: ${typeLabel[product.productionType] ?? "pieza artesanal"}
Descripción: ${product.description?.slice(0, 180) ?? ""}

Estructura EXACTA:
— Línea 1: frase evocadora sobre la pieza (no empezar con el nombre)
— Línea 2-3: 2 líneas sobre el proceso artesanal y el orfebre
— Línea 4: materiales y técnica, una línea
— Línea vacía
— 12 hashtags en línea: mezcla español + inglés, nicho + masivo
  Siempre incluir: #JoyeríaChilena #OrfebreChileno #HechoAMano #CasaOrfebre
— Línea vacía
— → Pieza disponible en el link de la bio

Tono: galería de arte, nunca tienda online. Sin emojis excesivos. Máximo 2 emojis sutiles.
Responde solo con el caption, sin explicaciones.`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  return text;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Productos publicados en los últimos 7 días
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      publishedAt: { gte: sevenDaysAgo },
      images: { some: { status: "APPROVED" } },
    },
    include: {
      materials: { select: { name: true } },
      categories: { select: { name: true } },
      artisan: { select: { displayName: true, region: true } },
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 7,
  });

  if (products.length === 0) {
    return NextResponse.json({
      message: "Sin productos nuevos esta semana",
      skipped: true,
    });
  }

  const captions: { name: string; url: string; imageUrl: string; caption: string }[] = [];
  let errors = 0;

  for (const product of products) {
    try {
      const caption = await generateCaption({
        name: product.name,
        description: product.description ?? "",
        materials: product.materials,
        categories: product.categories,
        artisan: product.artisan,
        productionType: product.productionType,
        technique: product.technique,
        slug: product.slug,
      });

      captions.push({
        name: product.name,
        url: `${BASE_URL}/coleccion/${product.slug}`,
        imageUrl: product.images[0]?.url ?? "",
        caption,
      });

      await new Promise((r) => setTimeout(r, 700));
    } catch (err) {
      console.error(`[CRON] social-captions error for ${product.name}:`, err);
      errors++;
    }
  }

  if (captions.length === 0) {
    return NextResponse.json({ error: "No se generaron captions", errors });
  }

  // ── Email a Camila con todos los captions listos para copiar ─────────────
  const captionBlocks = captions
    .map(
      (c, i) => `
    <div style="background:#fff;border:1px solid #e8e5df;border-radius:8px;padding:20px;margin-bottom:16px">
      <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:12px">
        ${c.imageUrl ? `<img src="${c.imageUrl}" alt="${c.name}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;flex-shrink:0">` : ""}
        <div>
          <p style="font-size:14px;font-weight:500;margin:0 0 4px">${i + 1}. ${c.name}</p>
          <a href="${c.url}" style="font-size:12px;color:#8B7355">${c.url}</a>
        </div>
      </div>
      <div style="background:#FAFAF8;border-radius:6px;padding:12px;border-left:3px solid #8B7355">
        <pre style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.6;margin:0;white-space:pre-wrap;color:#1a1a18">${c.caption}</pre>
      </div>
      <p style="font-size:11px;color:#9e9a90;margin:8px 0 0">Selecciona el texto y copia — listo para pegar en Instagram</p>
    </div>`,
    )
    .join("");

  const now = new Date().toLocaleDateString("es-CL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;color:#1a1a18;background:#FAFAF8;margin:0;padding:24px">
  <div style="max-width:620px;margin:0 auto">
    <div style="border-bottom:2px solid #8B7355;padding-bottom:12px;margin-bottom:24px">
      <h1 style="font-size:20px;font-weight:400;margin:0">Captions de Instagram — semana del ${now}</h1>
      <p style="color:#8B7355;font-size:13px;margin:4px 0 0">${captions.length} piezas nuevas esta semana</p>
    </div>
    <p style="font-size:14px;color:#6b6860;margin:0 0 20px">
      Hola Camila — aquí están los captions para los productos publicados esta semana.
      Cada uno está listo para copiar y pegar directamente en Instagram.
    </p>
    ${captionBlocks}
    <p style="font-size:12px;color:#9e9a90;margin-top:24px;border-top:1px solid #e8e5df;padding-top:12px">
      Generado automáticamente por Casa Orfebre · casaorfebre.cl
    </p>
  </div>
</body>
</html>`;

  const resend = getResend();
  await resend.emails.send({
    from: FROM_EMAIL,
    to: [CAMILA_EMAIL, CARLOS_EMAIL],
    subject: `${captions.length} captions Instagram listos — semana del ${new Date().toLocaleDateString("es-CL")}`,
    html,
  });

  console.log(`[CRON] social-captions: ${captions.length} captions enviados a Camila`);

  return NextResponse.json({
    generated: captions.length,
    errors,
    sentTo: [CAMILA_EMAIL, CARLOS_EMAIL],
  });
}
