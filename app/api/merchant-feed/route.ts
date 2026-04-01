import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Google Product Taxonomy (full text for Google + Pinterest compatibility)
const GOOGLE_CATEGORY: Record<string, string> = {
  anillo: "Apparel &amp; Accessories &gt; Jewelry &gt; Rings",
  aros: "Apparel &amp; Accessories &gt; Jewelry &gt; Earrings",
  collar: "Apparel &amp; Accessories &gt; Jewelry &gt; Necklaces",
  pulsera: "Apparel &amp; Accessories &gt; Jewelry &gt; Bracelets",
  colgante: "Apparel &amp; Accessories &gt; Jewelry &gt; Charms &amp; Pendants",
  cadena: "Apparel &amp; Accessories &gt; Jewelry &gt; Necklaces",
  broche: "Apparel &amp; Accessories &gt; Jewelry &gt; Brooches &amp; Lapel Pins",
};

const DEFAULT_CATEGORY = "Apparel &amp; Accessories &gt; Jewelry";

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

  const validProducts = products.filter(
    (p) => p.images.length > 0 && p.price > 0,
  );

  const items = validProducts
    .map((product) => {
      const imageUrl = product.images[0].url;
      const image = imageUrl.startsWith("http")
        ? imageUrl
        : `${baseUrl}${imageUrl}`;

      const categorySlug = product.categories[0]?.slug || "";
      const googleCategory =
        GOOGLE_CATEGORY[categorySlug] || DEFAULT_CATEGORY;

      const description = (product.description || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);

      // UNIQUE/MADE_TO_ORDER pieces are in_stock while APPROVED
      // (when sold, status changes to SOLD_OUT and they exit the feed)
      const availability =
        product.productionType === "UNIQUE" ||
        product.productionType === "MADE_TO_ORDER"
          ? "in_stock"
          : product.stock > 0
            ? "in_stock"
            : "out_of_stock";

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name.trim())}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${baseUrl}/coleccion/${escapeXml(product.slug)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:price>${product.price} CLP</g:price>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(product.artisan?.displayName || "Casa Orfebre")}</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>CL</g:country>
        <g:service>Envío estándar</g:service>
        <g:price>0 CLP</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Casa Orfebre — Joyería de Autor</title>
    <link>${baseUrl}</link>
    <description>Marketplace curado de joyería artesanal de plata</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
