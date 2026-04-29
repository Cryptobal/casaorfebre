import { CITIES } from "@/lib/data/cities";
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const now = new Date();

  const core: Entry[] = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/coleccion`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/orfebres`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/lo-nuevo`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/seleccion-del-curador`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/joyerias`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const categories: Entry[] = [
    "cadenas-de-plata", "aros-de-plata", "anillos-de-plata",
    "pulseras-de-plata", "collares-de-plata", "colgantes-dijes-plata",
  ].map((cat) => ({
    url: `${baseUrl}/coleccion/${cat}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const hubs: Entry[] = ["joyas-hombre", "joyas-mujer", "anillos", "aros", "cobre", "oro", "piedras-naturales", "plata-925"].map((slug) => ({
    url: `${baseUrl}/coleccion/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const occasions: Entry[] = [
    "anillos-de-compromiso-plata", "anillos-matrimonio-plata",
    "joyas-para-parejas", "joyas-dia-de-la-madre", "alianzas-de-boda",
  ].map((occ) => ({
    url: `${baseUrl}/ocasion/${occ}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const guides: Entry[] = ["plata-925-950", "oro-18k-bano-oro", "cuarzo-rosa-joyeria", "tobilleras-plata"].map((g) => ({
    url: `${baseUrl}/guia/${g}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const landings: Entry[] = [
    { url: `${baseUrl}/para-compradores`, priority: 0.7 },
    { url: `${baseUrl}/para-orfebres`, priority: 0.7 },
    { url: `${baseUrl}/pioneros`, priority: 0.6 },
    { url: `${baseUrl}/nosotros`, priority: 0.6 },
    { url: `${baseUrl}/contacto`, priority: 0.5 },
    { url: `${baseUrl}/garantia`, priority: 0.5 },
    { url: `${baseUrl}/preguntas-frecuentes`, priority: 0.5 },
    { url: `${baseUrl}/gift-cards`, priority: 0.6 },
    { url: `${baseUrl}/postular`, priority: 0.5 },
    { url: `${baseUrl}/terminos`, priority: 0.3 },
    { url: `${baseUrl}/privacidad`, priority: 0.3 },
    { url: `${baseUrl}/politica-devoluciones`, priority: 0.3 },
  ].map((p) => ({
    ...p,
    lastModified: now,
    changeFrequency: "monthly" as const,
  }));

  const cityPages: Entry[] = CITIES.map((city) => ({
    url: `${baseUrl}/joyerias/${city.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const giftRanges: Entry[] = ["regalos-bajo-30000", "regalos-bajo-50000", "regalos-bajo-100000"].map((s) => ({
    url: `${baseUrl}/${s}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const xml = buildXml([...core, ...categories, ...hubs, ...occasions, ...guides, ...landings, ...cityPages, ...giftRanges]);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
