import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { getGoogleAccessToken } from "@/lib/seo/gsc-indexing";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 120;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
const GSC_API = "https://searchconsole.googleapis.com/webmasters/v3/sites";
const SITE_URL = "sc-domain:casaorfebre.cl";

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function fetchQuestionQueries(token: string): Promise<string[]> {
  const endDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const startDate = new Date(Date.now() - 33 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const encodedSite = encodeURIComponent(SITE_URL);
  const res = await fetch(
    `${GSC_API}/${encodedSite}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 500,
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: "query",
                operator: "includingRegex",
                expression: "^(cómo|qué|cuál|dónde|cuánto|por qué|cuándo|es|son|vale|sirve|hay|tiene|puedo|debería|diferencia)",
              },
            ],
          },
        ],
      }),
    },
  );

  if (!res.ok) return [];
  const data = await res.json();
  const rows = (data.rows ?? []) as GscRow[];

  return rows
    .filter((r) => r.impressions >= 5)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30)
    .map((r) => r.keys[0]);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Solo ejecuta una vez por mes
  const thirtyDaysAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const recentFaqPost = await prisma.blogPost.count({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      tags: { has: "faq-seo" },
    },
  });

  if (recentFaqPost > 0) {
    return NextResponse.json({ message: "FAQ del mes ya generado", skipped: true });
  }

  // Obtiene preguntas reales desde GSC
  const token = await getGoogleAccessToken();
  let questions: string[] = [];

  if (token) {
    questions = await fetchQuestionQueries(token);
  }

  // Fallback: preguntas base si GSC no devuelve resultados
  if (questions.length < 5) {
    questions = [
      "cómo cuidar joyas de plata",
      "qué es la plata 925",
      "diferencia entre plata 925 y 950",
      "cómo limpiar joyas de plata en casa",
      "qué significa joyería de autor",
      "cómo saber si una joya es de plata real",
      "cuánto vale una joya artesanal",
      "qué técnicas usan los orfebres chilenos",
      "cómo elegir una joya de plata como regalo",
      "es mejor la plata o el oro para joyas cotidianas",
      "cómo se hace una joya artesanal",
      "qué piedras chilenas se usan en joyería",
      "cuánto dura una joya de plata 925",
      "por qué se oscurece la plata",
      "cómo se diferencian los orfebres de los joyeros",
    ];
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Genera el artículo FAQ completo
  const questionList = questions.slice(0, 15).map((q, i) => `${i + 1}. ${q}`).join("\n");

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `Escribe un artículo de blog en formato FAQ para Casa Orfebre (marketplace de joyería artesanal chilena).

PREGUNTAS A RESPONDER (selecciona las 10 más relevantes y agrúpalas por tema):
${questionList}

INSTRUCCIONES:
- Artículo de 1,400-1,800 palabras en markdown limpio (sin frontmatter, sin HTML)
- Sin H1 (el título va aparte)
- Agrupa las preguntas en 3-4 secciones con H2 temáticos
- Cada pregunta como H3, respuesta en 2-4 párrafos de 60-100 chars
- Tono editorial experto, nunca comercial ni de FAQ genérico
- Al final agrega un bloque con esta estructura EXACTA (reemplaza con contenido real):

---JSONLD_START---
[
  {"question": "pregunta 1", "answer": "respuesta corta de máximo 200 chars"},
  {"question": "pregunta 2", "answer": "respuesta corta de máximo 200 chars"}
]
---JSONLD_END---

Responde en JSON con esta estructura:
{
  "title": "título del artículo (máx 75 chars, incluye 'preguntas frecuentes' o 'guía')",
  "content": "contenido completo en markdown incluyendo el bloque JSONLD",
  "excerpt": "resumen 1-2 oraciones (máx 180 chars)",
  "metaTitle": "title SEO (máx 60 chars)",
  "metaDescription": "meta description (150-160 chars exactos)"
}`,
      },
    ],
  });

  const rawText = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";

  let article: {
    title: string;
    content: string;
    excerpt: string;
    metaTitle: string;
    metaDescription: string;
  };

  try {
    const clean = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    article = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: "Error parseando respuesta de Claude" }, { status: 500 });
  }

  // Extrae el bloque JSON-LD del contenido
  const jsonldMatch = article.content.match(
    /---JSONLD_START---\s*([\s\S]*?)\s*---JSONLD_END---/,
  );

  let faqJsonLd = "";
  if (jsonldMatch) {
    try {
      const faqItems = JSON.parse(jsonldMatch[1]);
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item: { question: string; answer: string }) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      };
      faqJsonLd = `\n\n<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>`;
    } catch {
      // Si falla el parse del JSON-LD, continúa sin él
    }

    // Elimina el bloque JSONLD del contenido visible y añade el schema
    article.content = article.content
      .replace(/---JSONLD_START---[\s\S]*?---JSONLD_END---/, "")
      .trim() + faqJsonLd;
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (!adminUser) {
    return NextResponse.json({ error: "No admin user" }, { status: 500 });
  }

  const slug = `preguntas-frecuentes-joyeria-${Date.now().toString(36)}`;
  const now = new Date();

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: "GUIAS",
      tags: ["faq-seo", "preguntas-frecuentes", "guía-joyería", "auto-generado"],
      authorId: adminUser.id,
      status: "PUBLISHED",
      publishedAt: now,
      seoTitle: article.metaTitle,
      seoDescription: article.metaDescription,
      readingTime: Math.ceil(article.content.split(/\s+/).length / 200),
    },
  });

  // Registra para GSC indexing
  const newPostUrl = `${BASE_URL}/blog/${slug}`;
  await prisma.systemSetting.upsert({
    where: { key: "LAST_BLOG_URL_GENERATED" },
    update: { value: newPostUrl },
    create: { key: "LAST_BLOG_URL_GENERATED", value: newPostUrl },
  });

  console.log(`[CRON] blog-faq-generator: "${post.title}" con ${questions.length} preguntas de GSC`);

  return NextResponse.json({
    message: "FAQ blog post publicado",
    postId: post.id,
    title: post.title,
    slug: post.slug,
    url: newPostUrl,
    questionsFromGSC: token ? questions.length : 0,
    usedFallback: !token || questions.length < 5,
  });
}
