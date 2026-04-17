import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

const categoryLabels: Record<string, string> = {
  GUIAS: "Guías", TENDENCIAS: "Tendencias", ORFEBRES: "Orfebres",
  CUIDADOS: "Cuidados", MATERIALES: "Materiales", CULTURA: "Cultura",
};

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, category: true, tags: true },
  });

  const now = new Date().toISOString();
  const lines: string[] = [];

  for (const p of posts) {
    lines.push(
      `  <url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    );
  }

  const cats = [...new Set(posts.map((p) => p.category))];
  for (const cat of cats) {
    lines.push(
      `  <url><loc>${baseUrl}/blog/categoria/${slugify(categoryLabels[cat] || cat)}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
    );
  }

  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  for (const tag of tagSet) {
    lines.push(
      `  <url><loc>${baseUrl}/blog/tag/${slugify(tag)}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
