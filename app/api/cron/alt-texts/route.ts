import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Imágenes sin alt text de productos aprobados
  const images = await prisma.productImage.findMany({
    where: {
      OR: [{ altText: null }, { altText: "" }],
      status: "APPROVED",
      product: { status: "APPROVED" },
    },
    select: {
      id: true,
      url: true,
      product: {
        select: {
          id: true,
          name: true,
          technique: true,
          productionType: true,
          materials: { select: { name: true } },
          categories: { select: { name: true } },
          artisan: { select: { displayName: true, region: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  if (images.length === 0) {
    return NextResponse.json({
      message: "Todas las imágenes tienen alt text",
      skipped: true,
    });
  }

  const MAX_PER_RUN = 10;
  const batch = images.slice(0, MAX_PER_RUN);
  let updated = 0;
  let errors = 0;
  const results: { productName: string; altText: string; status: string }[] = [];

  for (const image of batch) {
    const { product } = image;
    const materialsList = product.materials.map((m) => m.name).join(", ") || "plata";
    const categoriesList = product.categories.map((c) => c.name).join(", ");
    const region = product.artisan.region || "Chile";

    const typeLabel: Record<string, string> = {
      UNIQUE: "pieza única",
      MADE_TO_ORDER: "bajo pedido",
      LIMITED: "edición limitada",
    };

    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 80,
        messages: [
          {
            role: "user",
            content: `Escribe un alt text SEO para imagen de joyería artesanal chilena.
Máximo 115 caracteres. En español.
No empieces con: "Imagen de", "Foto de", "Fotografía de".
Incluye: tipo de joya + material + adjetivo artesanal + origen chileno.

Datos:
- Joya: ${product.name}
- Categoría: ${categoriesList}
- Material: ${materialsList}
- Técnica: ${product.technique || "orfebrería artesanal"}
- Orfebre: ${product.artisan.displayName}, ${region}
- Tipo: ${typeLabel[product.productionType] ?? "artesanal"}

Responde solo con el alt text, sin comillas.`,
          },
        ],
      });

      const altText =
        msg.content[0].type === "text"
          ? msg.content[0].text.trim().slice(0, 125)
          : "";

      if (altText.length >= 20) {
        await prisma.productImage.update({
          where: { id: image.id },
          data: { altText },
        });

        updated++;
        results.push({ productName: product.name, altText, status: "updated" });
      } else {
        errors++;
        results.push({ productName: product.name, altText: "", status: "too-short" });
      }
    } catch (err) {
      console.error(`[CRON] alt-texts error for ${product.name}:`, err);
      errors++;
      results.push({ productName: product.name, altText: "", status: "error" });
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(
    `[CRON] alt-texts: ${updated} actualizados | ${errors} errores | ${images.length - batch.length} pendientes`,
  );

  return NextResponse.json({
    updated,
    errors,
    pending: images.length - batch.length,
    results,
  });
}
