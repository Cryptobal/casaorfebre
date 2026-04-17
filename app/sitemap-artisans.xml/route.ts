import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true, region: true, location: true },
  });

  const now = new Date().toISOString();

  const lines: string[] = [];

  for (const a of artisans) {
    lines.push(
      `  <url><loc>${baseUrl}/orfebres/${a.slug}</loc><lastmod>${a.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    );
  }

  const regions = [...new Set(artisans.map((a) => a.region).filter(Boolean))];
  for (const region of regions) {
    lines.push(
      `  <url><loc>${baseUrl}/orfebres/region/${slugify(region!)}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
    );
  }

  const cities = [...new Set(artisans.map((a) => a.location).filter(Boolean).map((l) => slugify(l)))];
  for (const city of cities) {
    lines.push(
      `  <url><loc>${baseUrl}/joyeria-artesanal/${city}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
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
