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
      materials: { select: { name: true } },
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 10,
      },
    },
  });

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      .replace(/[\u0080-\uFFFF]/g, (c) => `&#${c.charCodeAt(0)};`);

  const absUrl = (u: string) => (u.startsWith("http") ? u : `${baseUrl}${u}`);

  // Pinterest rechaza items sin descripción real o sin imagen.
  // Excluimos out_of_stock y slugs de borrador del feed.
  const validProducts = products.filter((p) => {
    if (p.images.length === 0 || p.price <= 0) return false;
    if (p.slug.startsWith("borrador-")) return false;
    const desc = (p.description || "").replace(/<[^>]*>/g, "").trim();
    if (desc.length < 10) return false;
    const isInStock =
      p.productionType === "UNIQUE" ||
      p.productionType === "MADE_TO_ORDER" ||
      p.stock > 0;
    return isInStock;
  });

  const items = validProducts
    .map((product) => {
      const image = absUrl(product.images[0].url);
      const additionalImages = product.images
        .slice(1, 10)
        .map((img) => `      <g:additional_image_link>${escapeXml(absUrl(img.url))}</g:additional_image_link>`)
        .join("\n");

      const categorySlug = product.categories[0]?.slug || "";
      const googleCategory =
        GOOGLE_CATEGORY[categorySlug] || DEFAULT_CATEGORY;

      // Taxonomía propia de Casa Orfebre: "Joyería Artesanal > {Categoría} > {Material}"
      const categoryName = product.categories[0]?.name || "Joyería";
      const materialName = product.materials[0]?.name;
      const productType = materialName
        ? `Joyería Artesanal > ${categoryName} > ${materialName}`
        : `Joyería Artesanal > ${categoryName}`;

      const description = (product.description || "")
        .replace(/<[^>]*>/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name.trim())}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${baseUrl}/coleccion/${escapeXml(product.slug)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
${additionalImages}${additionalImages ? "\n" : ""}      <g:price>${product.price.toFixed(2)} CLP</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(product.artisan?.displayName || "Casa Orfebre")}</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>CL</g:country>
        <g:service>${escapeXml("Envío estándar")}</g:service>
        <g:price>0.00 CLP</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml("Casa Orfebre — Joyería de Autor")}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml("Marketplace curado de joyería artesanal de plata")}</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(Buffer.from(xml, "utf-8"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
