import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishProductToPinterest } from "@/lib/actions/pinterest-publish";
import {
  pinterestClient,
  getPublishedBlogPins,
  markBlogPinPublished,
} from "@/lib/pinterest";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 120;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

// ── Genera descripción del pin con Claude ─────────────────────────────────
async function generatePinDescription(product: {
  name: string;
  description: string;
  materials: { name: string }[];
  categories: { name: string }[];
  artisan: { displayName: string; region: string | null };
  productionType: string;
  technique: string | null;
}): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const materialsList = product.materials.map((m) => m.name).join(", ");
  const categoriesList = product.categories.map((c) => c.name).join(", ");
  const region = product.artisan.region || "Chile";
  const typeLabel =
    product.productionType === "UNIQUE"
      ? "pieza única"
      : product.productionType === "MADE_TO_ORDER"
        ? "pieza personalizada bajo pedido"
        : "edición limitada";

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Escribe una descripción para Pinterest de esta joya artesanal chilena.
Tono: editorial de galería, evocador, nunca comercial ni de catálogo masivo.

Datos de la pieza:
- Nombre: ${product.name}
- Categoría: ${categoriesList}
- Material: ${materialsList}
- Técnica: ${product.technique || "orfebrería artesanal"}
- Orfebre: ${product.artisan.displayName}, ${region}, Chile
- Tipo: ${typeLabel}
- Descripción original: ${product.description.slice(0, 200)}

Estructura (exactamente):
1. Una frase poética de apertura sobre la pieza (máx 80 chars)
2. Dos líneas sobre el proceso artesanal y el orfebre (máx 120 chars total)
3. Línea de materiales y técnica (máx 60 chars)
4. 12 hashtags: mezcla español/inglés, nicho + masivo
   Incluir siempre: #JoyeríaChilena #OrfebreChileno #HechoAMano
5. CTA final: "Pieza disponible en casaorfebre.cl"

Máximo 480 caracteres total (sin contar hashtags separados).
Responde solo con el texto del pin, sin explicaciones.`,
        },
      ],
    });

    const text =
      msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    return text.slice(0, 500);
  } catch (err) {
    console.error("[Pinterest] Error generando descripción con Claude:", err);
    // Fallback al template existente
    const materialsText = materialsList ? `${materialsList}. ` : "";
    return `${product.name} — Pieza artesanal de ${product.artisan.displayName}, ${region}. ${materialsText}${typeLabel}. ✨ Disponible en casaorfebre.cl #JoyeríaChilena #OrfebreChileno #HechoAMano`.slice(0, 500);
  }
}

// ── Selecciona el producto del día por rotación ───────────────────────────
async function selectDailyProduct(): Promise<string | null> {
  // Obtiene todos los productos aprobados con imagen
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      images: { some: { status: "APPROVED" } },
    },
    select: { id: true },
    orderBy: { publishedAt: "asc" },
  });

  if (products.length === 0) return null;

  // Lee el índice rotativo desde SystemSetting
  let currentIndex = 0;
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "PINTEREST_ROTATION_INDEX" },
    });
    if (setting) currentIndex = parseInt(setting.value, 10) || 0;
  } catch {
    currentIndex = 0;
  }

  const safeIndex = currentIndex % products.length;
  const selected = products[safeIndex];

  // Avanza el índice para mañana
  const nextIndex = (safeIndex + 1) % products.length;
  await prisma.systemSetting.upsert({
    where: { key: "PINTEREST_ROTATION_INDEX" },
    update: { value: nextIndex.toString() },
    create: { key: "PINTEREST_ROTATION_INDEX", value: nextIndex.toString() },
  });

  console.log(
    `[Pinterest] Rotación diaria: producto ${safeIndex + 1}/${products.length}`,
  );
  return selected.id;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    return NextResponse.json({ message: "Pinterest no configurado" });
  }

  let published = 0;
  let errors = 0;
  const results: { name: string; type: string; status: string }[] = [];

  // ── 1. Productos NUEVOS (últimas 48h, primera vez en Pinterest) ───────────
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const newProducts = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      pinterestPinId: null,
      publishedAt: { gte: cutoff },
      images: { some: { status: "APPROVED" } },
    },
    select: { id: true, name: true },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  for (const product of newProducts) {
    const result = await publishProductToPinterest(product.id);
    if (result.success) {
      published++;
      results.push({ name: product.name, type: "product-new", status: "published" });
    } else {
      errors++;
      results.push({ name: product.name, type: "product-new", status: result.error || "error" });
    }
  }

  // ── 2. Pin diario de rotación (catálogo completo con descripción IA) ──────
  const dailyProductId = await selectDailyProduct();

  if (dailyProductId) {
    const product = await prisma.product.findUnique({
      where: { id: dailyProductId },
      include: {
        images: {
          where: { status: "APPROVED" },
          orderBy: { position: "asc" },
          take: 1,
        },
        categories: { select: { name: true, slug: true } },
        materials: { select: { name: true } },
        artisan: { select: { displayName: true, region: true } },
      },
    });

    if (product && product.images.length > 0) {
      // Determina el board según la categoría
      const CATEGORY_BOARD_MAP: Record<string, string | undefined> = {
        anillo: process.env.PINTEREST_BOARD_ANILLOS,
        anillos: process.env.PINTEREST_BOARD_ANILLOS,
        aro: process.env.PINTEREST_BOARD_AROS,
        aros: process.env.PINTEREST_BOARD_AROS,
        collar: process.env.PINTEREST_BOARD_COLLARES,
        collares: process.env.PINTEREST_BOARD_COLLARES,
        pulsera: process.env.PINTEREST_BOARD_PULSERAS,
        pulseras: process.env.PINTEREST_BOARD_PULSERAS,
        colgante: process.env.PINTEREST_BOARD_COLGANTES,
        colgantes: process.env.PINTEREST_BOARD_COLGANTES,
        dije: process.env.PINTEREST_BOARD_COLGANTES,
        cadena: process.env.PINTEREST_BOARD_COLLARES,
      };

      let boardId = process.env.PINTEREST_BOARD_ID || "";
      for (const cat of product.categories) {
        const slug = cat.slug.toLowerCase();
        const name = cat.name.toLowerCase();
        const board = CATEGORY_BOARD_MAP[slug] || CATEGORY_BOARD_MAP[name];
        if (board) { boardId = board; break; }
      }

      if (boardId) {
        const description = await generatePinDescription({
          name: product.name,
          description: product.description || "",
          materials: product.materials,
          categories: product.categories,
          artisan: product.artisan,
          productionType: product.productionType,
          technique: product.technique,
        });

        const pinResult = await pinterestClient.createPin({
          title: product.name,
          description,
          link: `${BASE_URL}/coleccion/${product.slug}`,
          board_id: boardId,
          media_source: {
            source_type: "image_url",
            url: product.images[0].url,
          },
        });

        if (pinResult) {
          published++;
          results.push({
            name: product.name,
            type: "product-daily-rotation",
            status: "published",
          });
          console.log(`[Pinterest] Pin diario publicado: ${product.name}`);
        } else {
          errors++;
          results.push({
            name: product.name,
            type: "product-daily-rotation",
            status: "error-creating-pin",
          });
        }
      } else {
        results.push({
          name: product.name,
          type: "product-daily-rotation",
          status: "skipped-no-board",
        });
      }
    }
  }

  // ── 3. Blog posts sin pin (hasta 2 por ejecución) ─────────────────────────
  const blogBoardId = process.env.PINTEREST_BOARD_BLOG;
  if (blogBoardId) {
    const publishedBlogPins = getPublishedBlogPins();
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true, excerpt: true, coverImage: true },
      orderBy: { publishedAt: "desc" },
    });

    const unpublished = blogPosts.filter((p) => !publishedBlogPins[p.slug]);

    for (const post of unpublished.slice(0, 2)) {
      const imageUrl = post.coverImage?.startsWith("http")
        ? post.coverImage
        : post.coverImage
          ? `${BASE_URL}${post.coverImage}`
          : `${BASE_URL}/casaorfebre-og-image.png`;

      const description =
        `${post.title} — ${post.excerpt.slice(0, 250)}. Lee el artículo completo en casaorfebre.cl/blog`.slice(0, 500);

      const result = await pinterestClient.createPin({
        title: post.title,
        description,
        link: `${BASE_URL}/blog/${post.slug}`,
        board_id: blogBoardId,
        media_source: { source_type: "image_url", url: imageUrl },
      });

      if (result) {
        markBlogPinPublished(post.slug, result.id);
        published++;
        results.push({ name: post.title, type: "blog", status: "published" });
      } else {
        errors++;
        results.push({ name: post.title, type: "blog", status: "error" });
      }
    }
  }

  return NextResponse.json({
    published,
    errors,
    results,
    dailyRotation: !!dailyProductId,
  });
}
