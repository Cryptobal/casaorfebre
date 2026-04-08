import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateBlogArticle,
  suggestBlogTopics,
  selectAndRotateKeyword,
} from "@/lib/ai/blog-generator";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Verifica que no hayamos publicado un artículo en las últimas 20 horas
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
    const todayPost = await prisma.blogPost.count({
      where: {
        createdAt: { gte: twentyHoursAgo },
        tags: { has: "auto-generado" },
      },
    });
    if (todayPost > 0) {
      return NextResponse.json({ message: "Artículo de hoy ya generado", skipped: true });
    }

    // 2. Títulos recientes para evitar repetición
    const existingPosts = await prisma.blogPost.findMany({
      select: { title: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    const existingTitles = existingPosts.map((p) => p.title);

    // 3. Selecciona keyword del pool dinámico (lee materiales/categorías reales de la DB)
    const { keyword, poolSize } = await selectAndRotateKeyword();

    // 4. Genera el título del artículo orientado a la keyword
    const topics = await suggestBlogTopics(existingTitles, keyword);
    const topic = topics[0];
    if (!topic) {
      return NextResponse.json({ message: "No se generó tema", skipped: true });
    }

    // 5. Categoría automática por keyword y tema
    const categoryMap: Record<string, string> = {
      cuidado: "CUIDADOS", limpiar: "CUIDADOS", oxidar: "CUIDADOS", mantener: "CUIDADOS",
      tendencia: "TENDENCIAS", moda: "TENDENCIAS", estilo: "TENDENCIAS",
      plata: "MATERIALES", oro: "MATERIALES", cobre: "MATERIALES",
      bronce: "MATERIALES", piedra: "MATERIALES", lapislázuli: "MATERIALES",
      material: "MATERIALES", metal: "MATERIALES",
      orfebre: "ORFEBRES", artesano: "ORFEBRES",
      chile: "CULTURA", chilena: "CULTURA", tradición: "CULTURA",
      guía: "GUIAS", comprar: "GUIAS", regalo: "GUIAS",
      dónde: "GUIAS", cómo: "GUIAS", elegir: "GUIAS",
    };
    let targetCategory: any = "GUIAS";
    const combined = `${topic} ${keyword}`.toLowerCase();
    for (const [kw, cat] of Object.entries(categoryMap)) {
      if (combined.includes(kw)) { targetCategory = cat; break; }
    }

    // 6. Genera el artículo completo
    const article = await generateBlogArticle({
      topic,
      keywords: [keyword],
      targetCategory,
      includeProductLinks: true,
    });

    // 7. Admin como autor
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (!adminUser) {
      return NextResponse.json({ error: "No admin user" }, { status: 500 });
    }

    // 8. Crea y PUBLICA el post directamente
    const slug = `${slugify(article.title)}-${Date.now().toString(36)}`;
    const now = new Date();

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: targetCategory,
        tags: [
          ...article.tags,
          "auto-generado",
          keyword.toLowerCase().replace(/\s+/g, "-"),
        ],
        authorId: adminUser.id,
        status: "PUBLISHED",
        publishedAt: now,
        seoTitle: article.metaTitle,
        seoDescription: article.metaDescription,
        readingTime: Math.ceil(article.content.split(/\s+/).length / 200),
      },
    });

    // 9. Registra URL para que el cron GSC la indexe
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
    const newPostUrl = `${appUrl}/blog/${slug}`;
    await prisma.systemSetting.upsert({
      where: { key: "LAST_BLOG_URL_GENERATED" },
      update: { value: newPostUrl },
      create: { key: "LAST_BLOG_URL_GENERATED", value: newPostUrl },
    });

    console.log(`[CRON] PUBLICADO: "${post.title}" | keyword: "${keyword}" | pool: ${poolSize} keywords`);

    return NextResponse.json({
      message: "Artículo publicado",
      postId: post.id,
      title: post.title,
      slug: post.slug,
      keyword,
      poolSize,
      category: targetCategory,
      url: newPostUrl,
    });

  } catch (error) {
    console.error("[CRON] blog-auto-generate error:", error);
    return NextResponse.json({ error: "Error generando blog post" }, { status: 500 });
  }
}
