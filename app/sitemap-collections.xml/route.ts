import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  const [curated, materials, dbCats] = await Promise.all([
    prisma.curatedCollection.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.material.findMany({ where: { isActive: true }, select: { name: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true } }),
  ]);

  const now = new Date().toISOString();
  const lines: string[] = [];

  for (const c of curated) {
    lines.push(
      `  <url><loc>${baseUrl}/colecciones/${c.slug}</loc><lastmod>${c.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    );
  }

  for (const m of materials) {
    lines.push(
      `  <url><loc>${baseUrl}/materiales/${slugify(m.name)}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    );
  }

  for (const c of dbCats) {
    lines.push(
      `  <url><loc>${baseUrl}/coleccion/categoria/${c.slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
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
