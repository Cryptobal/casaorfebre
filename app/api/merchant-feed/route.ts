import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Revalidate every 6 hours
export const revalidate = 21600;

// Map category slugs to Google Product Categories
const GOOGLE_CATEGORIES: Record<string, string> = {
  anillo: "188 - Jewelry > Rings",
  aros: "189 - Jewelry > Earrings",
  collar: "191 - Jewelry > Necklaces",
  pulsera: "192 - Jewelry > Bracelets",
  colgante: "190 - Jewelry > Pendants",
  cadena: "191 - Jewelry > Necklaces",
  broche: "194 - Jewelry > Brooches & Pins",
};

const CATEGORY_LABELS: Record<string, string> = {
  anillo: "Anillos",
  aros: "Aros",
  collar: "Collares",
  pulsera: "Pulseras",
  colgante: "Colgantes",
  cadena: "Cadenas",
  broche: "Broches",
};

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      images: { some: { status: "APPROVED" } },
    },
    include: {
      artisan: { select: { displayName: true } },
      categories: { select: { slug: true, name: true } },
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
      },
    },
  });

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = products
    .map((product: any) => {
      const image = product.images[0]?.url;
      if (!image) return "";

      const categorySlug = product.categories[0]?.slug || "";
      const googleCategory = GOOGLE_CATEGORIES[categorySlug] || "188 - Jewelry";
      const categoryLabel = CATEGORY_LABELS[categorySlug] || "Joyería";
      const description = (product.description || "")
        .replace(/<[^>]*>/g, "")
        .slice(0, 5000);

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${baseUrl}/coleccion/${escapeXml(product.slug)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:price>${product.price} CLP</g:price>
      <g:availability>${product.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(product.artisan?.displayName || "Casa Orfebre")}</g:brand>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>Joyería Artesanal &gt; ${escapeXml(categoryLabel)}</g:product_type>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>CL</g:country>
        <g:service>Envío estándar</g:service>
        <g:price>0 CLP</g:price>
      </g:shipping>
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://schemas.google.com/g/2005">
  <channel>
    <title>Casa Orfebre — Joyería de Autor</title>
    <link>${baseUrl}</link>
    <description>Marketplace curado de joyería artesanal de plata</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
