import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Productos con descripción corta o vacía, priorizando los más recientes
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { description: "" },
        // Filtramos descripciones cortas en memoria (Prisma no tiene LENGTH en todos los adapters)
      ],
    },
    include: {
      materials: { select: { name: true } },
      categories: { select: { name: true } },
      artisan: { select: { displayName: true, region: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  // Filtra los que realmente tienen descripción corta (< 150 chars)
  const toEnrich = products.filter(
    (p) => !p.description || p.description.trim().length < 150,
  );

  if (toEnrich.length === 0) {
    return NextResponse.json({ message: "Todos los productos tienen descripción completa", skipped: true });
  }

  const MAX_PER_RUN = 8;
  const batch = toEnrich.slice(0, MAX_PER_RUN);

  let enriched = 0;
  let errors = 0;
  const results: { name: string; status: string; chars: number }[] = [];

  for (const product of batch) {
    const materialsList = product.materials.map((m) => m.name).join(", ") || "plata artesanal";
    const categoriesList = product.categories.map((c) => c.name).join(", ");
    const region = product.artisan.region || "Chile";

    const audienceLabel: Record<string, string> = {
      MUJER: "para mujer",
      HOMBRE: "para hombre",
      UNISEX: "unisex",
      NINOS: "para niños",
      SIN_ESPECIFICAR: "",
    };

    const typeLabel: Record<string, string> = {
      UNIQUE: "pieza única",
      MADE_TO_ORDER: "elaborada bajo pedido",
      LIMITED: "edición limitada",
    };

    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `Escribe una descripción SEO para esta joya artesanal chilena.
Entre 380 y 460 caracteres exactos. Un solo párrafo, sin bullet points.
Tono editorial de galería, nunca comercial masivo.

Datos:
- Nombre: ${product.name}
- Categoría: ${categoriesList} ${audienceLabel[product.audiencia ?? "SIN_ESPECIFICAR"] ?? ""}
- Material: ${materialsList}
- Técnica: ${product.technique || "orfebrería artesanal"}
- Orfebre: ${product.artisan.displayName}, ${region}
- Tipo: ${typeLabel[product.productionType] ?? "pieza artesanal"}

Incluye naturalmente keywords sobre ${categoriesList.toLowerCase()} artesanal chileno y ${materialsList.toLowerCase()}.
Menciona el carácter único y la procedencia artesanal. Termina con punto.
Responde solo con la descripción, sin comillas ni explicaciones.`,
          },
        ],
      });

      const newDescription =
        msg.content[0].type === "text" ? msg.content[0].text.trim() : "";

      if (newDescription.length >= 200) {
        await prisma.product.update({
          where: { id: product.id },
          data: { description: newDescription },
        });
        enriched++;
        results.push({
          name: product.name,
          status: "enriched",
          chars: newDescription.length,
        });
      } else {
        errors++;
        results.push({ name: product.name, status: "too-short", chars: newDescription.length });
      }
    } catch (err) {
      console.error(`[CRON] enrich-descriptions error for ${product.name}:`, err);
      errors++;
      results.push({ name: product.name, status: "error", chars: 0 });
    }

    // Pausa entre requests a la API
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`[CRON] enrich-descriptions: ${enriched} enriquecidos, ${errors} errores, ${toEnrich.length - batch.length} pendientes`);

  return NextResponse.json({
    enriched,
    errors,
    pending: toEnrich.length - batch.length,
    results,
  });
}
