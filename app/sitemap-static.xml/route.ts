import { NextResponse } from "next/server";

type Entry = {
  url: string;
  lastModified: Date;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
};

function buildXml(entries: Entry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${e.url}</loc><lastmod>${e.lastModified.toISOString()}</lastmod><changefreq>${e.changeFrequency}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "[REDACTED]";
  const now = new Date();

  const core: Entry[] = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/terminos`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacidad`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  return new NextResponse(buildXml(core), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
