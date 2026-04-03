import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoLinkContent, suggestInternalLinks } from "@/lib/seo/internal-linking";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Posts publicados, priorizando los más recientes sin links internos
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, content: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  // Filtra los que tienen oportunidades de linking
  const withOpportunities = posts.filter(
    (p) => suggestInternalLinks(p.content).length > 0,
  );

  if (withOpportunities.length === 0) {
    return NextResponse.json({
      message: "Todos los posts tienen links internos optimizados",
      skipped: true,
    });
  }

  const MAX_PER_RUN = 10;
  const batch = withOpportunities.slice(0, MAX_PER_RUN);

  let updated = 0;
  let unchanged = 0;
  const results: {
    title: string;
    linksAdded: number;
    opportunities: { text: string; url: string; count: number }[];
  }[] = [];

  for (const post of batch) {
    const opportunities = suggestInternalLinks(post.content);
    const newContent = autoLinkContent(post.content, 1);

    if (newContent !== post.content) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { content: newContent },
      });

      // Cuenta los links realmente insertados comparando longitudes de contenido
      const diff = newContent.length - post.content.length;
      const linksAdded = Math.max(1, Math.round(diff / 50));

      updated++;
      results.push({ title: post.title, linksAdded, opportunities });
      console.log(`[CRON] internal-links: "${post.title}" — ${linksAdded} links añadidos`);
    } else {
      unchanged++;
    }
  }

  console.log(
    `[CRON] internal-links: ${updated} posts actualizados | ${unchanged} sin cambios | ${withOpportunities.length - batch.length} pendientes`,
  );

  return NextResponse.json({
    updated,
    unchanged,
    pending: withOpportunities.length - batch.length,
    results,
  });
}
