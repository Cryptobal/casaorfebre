import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import type { BlogCategory } from "@prisma/client";

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

interface GenerateParams {
  topic: string;
  keywords: string[];
  targetCategory: BlogCategory;
  includeProductLinks: boolean;
}

interface GeneratedArticle {
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
}

const SYSTEM_PROMPT = `Eres el editor de contenido de Casa Orfebre, un marketplace curado de joyería artesanal chilena. Escribes artículos para el blog de la marca.

VOZ DE MARCA:
- Sofisticada pero accesible. Nunca condescendiente.
- Experta en joyería artesanal, orfebrería y materiales nobles.
- Celebras el trabajo manual, la identidad chilena y la conexión emocional con las joyas.
- Usas español chileno formal: "ustedes" (nunca "vosotros"), tono cálido pero profesional.

FORMATO Y ESTRUCTURA:
- Largo: 1200-1800 palabras.
- Markdown limpio: sin frontmatter, sin HTML, sin bloques de código.
- H1 no incluir (será el título del artículo, que va aparte).
- Usa H2 (##) descriptivos que incluyan keywords naturalmente.
- Párrafos cortos (3-4 oraciones máximo).
- Incluye listas donde ayuden a la legibilidad.

SEO:
- Meta description: 150-160 caracteres exactos, con keyword principal.
- Meta title: máximo 60 caracteres, con keyword principal al inicio.
- Keywords integradas naturalmente en H2s y primeros párrafos.

RESPUESTA:
Responde SIEMPRE en JSON válido con esta estructura exacta:
{
  "title": "Título del artículo (H1, máx 80 chars)",
  "content": "Contenido completo en Markdown...",
  "excerpt": "Resumen de 1-2 oraciones para cards (máx 200 chars)",
  "metaTitle": "SEO title (máx 60 chars)",
  "metaDescription": "Meta description (150-160 chars exactos)",
  "tags": ["tag1", "tag2", "tag3"]
}

No incluyas nada fuera del JSON. No uses bloques de código markdown alrededor del JSON.`;

export async function generateBlogArticle(params: GenerateParams): Promise<GeneratedArticle> {
  let productContext = "";

  if (params.includeProductLinks) {
    const categoryMap: Record<string, string[]> = {
      GUIAS: [],
      TENDENCIAS: [],
      ORFEBRES: [],
      CUIDADOS: [],
      MATERIALES: [],
      CULTURA: [],
    };

    // Fetch recent approved products
    const products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      select: {
        name: true,
        slug: true,
        categories: { select: { name: true } },
        materials: { select: { name: true } },
        artisan: { select: { displayName: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 8,
    });

    if (products.length > 0) {
      const productList = products
        .map((p) => `- ${p.name} por ${p.artisan.displayName} (${p.materials.map((m) => m.name).join(", ")}): [${p.name}](/coleccion/${p.slug})`)
        .join("\n");

      productContext = `\n\nPRODUCTOS DISPONIBLES PARA MENCIONAR NATURALMENTE:
${productList}

Incluye 2-3 menciones naturales a estos productos usando los links markdown proporcionados. No fuerces las menciones — solo donde encaje orgánicamente con el contenido.`;
    }
  }

  const userPrompt = `Escribe un artículo sobre: ${params.topic}

Keywords objetivo: ${params.keywords.join(", ")}
Categoría: ${params.targetCategory}
Sugiere 3-5 tags relevantes en español.${productContext}`;

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: SYSTEM_PROMPT,
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON — handle potential markdown code block wrapping
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned) as GeneratedArticle;

  return {
    title: parsed.title,
    content: parsed.content,
    excerpt: parsed.excerpt,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
    tags: parsed.tags,
  };
}

export async function suggestBlogTopics(existingTitles: string[], targetKeyword?: string): Promise<string[]> {
  const titleList = existingTitles.length > 0
    ? existingTitles.map((t) => `- ${t}`).join("\n")
    : "- (ninguno aún)";

  const keywordInstruction = targetKeyword
    ? `KEYWORD OBJETIVO (OBLIGATORIO): El artículo DEBE estar optimizado para posicionar
       la búsqueda "${targetKeyword}" en Google Chile. El título debe incluir esta keyword
       o una variación semánticamente equivalente.`
    : "";

  const count = targetKeyword ? "1 idea" : "5 ideas";

  const message = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Sugiere ${count} de artículo para el blog de Casa Orfebre (marketplace curado de joyería artesanal chilena con orfebres de todo Chile).

${keywordInstruction}

Los temas pueden cubrir: técnicas de orfebrería, materiales (plata, oro, cobre, bronce, piedras chilenas), ocasiones para regalar, tendencias, cuidado de joyas, cultura artesanal chilena, guías de compra, historia de la orfebrería en Chile.

ARTÍCULOS QUE YA EXISTEN (NO repetir ni temas similares):
${titleList}

Responde SOLO con un JSON array de ${targetKeyword ? "1 string" : "5 strings"}. Sin nada fuera del JSON.
Ejemplo: ["Título atractivo en español"]`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    return JSON.parse(text.trim());
  } catch {
    return [];
  }
}

// ─── Genera el pool de keywords dinámicamente desde la DB ──────────────────
export async function generateDynamicKeywordPool(): Promise<string[]> {
  const [materials, categories, occasions] = await Promise.all([
    prisma.material.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { position: "asc" } }),
    prisma.category.findMany({ where: { isActive: true }, select: { name: true, slug: true }, orderBy: { position: "asc" } }),
    prisma.occasion.findMany({ where: { isActive: true }, select: { name: true, slug: true } }),
  ]);

  const materialNames = materials.map((m) => m.name.toLowerCase());
  const categoryNames = categories.map((c) => c.name.toLowerCase());
  const occasionNames = occasions.map((o) => o.name.toLowerCase());

  const audiences = ["hombre", "mujer", "pareja", "unisex"];

  const cities = [
    "chile", "santiago", "valparaíso", "concepción", "viña del mar",
    "la serena", "antofagasta", "temuco", "rancagua", "puerto montt",
  ];

  const keywords: Set<string> = new Set();

  // ── Materiales × Categorías ──────────────────────────────────────────────
  for (const mat of materialNames) {
    for (const cat of categoryNames) {
      keywords.add(`${cat} de ${mat} chile`);
      keywords.add(`${cat} de ${mat} artesanales`);
      keywords.add(`${cat} de ${mat} hechos a mano`);
    }

    keywords.add(`joyería de ${mat} chile`);
    keywords.add(`joyería artesanal de ${mat}`);
    keywords.add(`joyería de ${mat} hecha a mano`);
    keywords.add(`${mat} artesanal chileno`);
    keywords.add(`cómo cuidar joyas de ${mat}`);
    keywords.add(`joyería fina de ${mat} chile`);
    keywords.add(`comprar joyería de ${mat} chile`);

    for (const aud of audiences) {
      keywords.add(`joyería de ${mat} para ${aud}`);
      keywords.add(`${mat} para ${aud} chile`);
    }

    for (const city of cities.slice(0, 4)) {
      keywords.add(`joyería de ${mat} en ${city}`);
      keywords.add(`orfebres de ${mat} ${city}`);
    }
  }

  // ── Categorías × Audiencias ──────────────────────────────────────────────
  for (const cat of categoryNames) {
    for (const aud of audiences) {
      keywords.add(`${cat} para ${aud} chile`);
      keywords.add(`${cat} artesanales para ${aud}`);
    }
    keywords.add(`${cat} artesanales chile`);
    keywords.add(`${cat} únicos chile`);
    keywords.add(`${cat} de autor chile`);
    keywords.add(`${cat} hechos a mano chile`);
  }

  // ── Ocasiones × Materiales ───────────────────────────────────────────────
  for (const occ of occasionNames) {
    for (const mat of materialNames) {
      keywords.add(`${categoryNames[0] || "joyas"} de ${mat} para ${occ}`);
      keywords.add(`regalo de ${mat} para ${occ}`);
    }
    keywords.add(`joyería artesanal para ${occ}`);
    keywords.add(`regalo joyería para ${occ} chile`);
    keywords.add(`joyas únicas para ${occ}`);
  }

  // ── Keywords de marca y cultura ──────────────────────────────────────────
  const brandKeywords = [
    "orfebres chilenos",
    "orfebrería chilena",
    "joyería artesanal chile",
    "marketplace joyería chile",
    "joyería independiente chile",
    "joyería de autor chile",
    "joyería hecha a mano chile",
    "artesanos joyería chile",
    "joyería sustentable chile",
    "joyería minimalista chile",
    "joyería bohemia chile",
    "joyería étnica chilena",
    "dónde comprar joyas artesanales chile",
    "joyas únicas chile",
    "regalos de joyería chile",
    "joyería con significado chile",
    "técnicas de orfebrería",
    "orfebrería tradicional chilena",
    "piedras chilenas lapislázuli",
    "joyas con piedras chilenas",
    "lapislázuli joyería chile",
  ];
  brandKeywords.forEach((kw) => keywords.add(kw));

  // ── SEO local × ciudades ─────────────────────────────────────────────────
  for (const city of cities) {
    keywords.add(`joyería artesanal ${city}`);
    keywords.add(`orfebres ${city}`);
    keywords.add(`joyería hecha a mano ${city}`);
  }

  const pool = Array.from(keywords);
  const seed = new Date().getMonth() * 31 + new Date().getDate();
  return pool.sort((a, b) => ((a.charCodeAt(0) * seed) % 97) - ((b.charCodeAt(0) * seed) % 97));
}

// ─── Selecciona y rota keyword desde el pool dinámico ─────────────────────
export async function selectAndRotateKeyword(): Promise<{ keyword: string; poolSize: number }> {
  const pool = await generateDynamicKeywordPool();

  let currentIndex = 0;
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "BLOG_KEYWORD_INDEX" },
    });
    if (setting) currentIndex = parseInt(setting.value, 10) || 0;
  } catch {
    currentIndex = 0;
  }

  const safeIndex = currentIndex % pool.length;
  let selectedIndex = safeIndex;

  const recentTags = await prisma.blogPost.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
    select: { tags: true },
  });
  const recentKeywords = new Set(recentTags.flatMap((p) => p.tags));

  for (let i = 0; i < pool.length; i++) {
    const idx = (safeIndex + i) % pool.length;
    const candidateTag = pool[idx].toLowerCase().replace(/\s+/g, "-");
    if (!recentKeywords.has(candidateTag)) {
      selectedIndex = idx;
      break;
    }
  }

  const keyword = pool[selectedIndex];
  const nextIndex = (selectedIndex + 1) % pool.length;

  await prisma.systemSetting.upsert({
    where: { key: "BLOG_KEYWORD_INDEX" },
    update: { value: nextIndex.toString() },
    create: { key: "BLOG_KEYWORD_INDEX", value: nextIndex.toString() },
  });

  console.log(`[BLOG-KEYWORDS] Pool: ${pool.length} keywords | Seleccionada: "${keyword}" | Próximo índice: ${nextIndex}`);

  return { keyword, poolSize: pool.length };
}
