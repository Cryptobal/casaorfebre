import { prisma } from "@/lib/prisma";
import { getShippingZones, getShippingSettings } from "@/lib/queries/shipping";
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

const AUDIENCE_GENDER: Record<string, string> = {
  MUJER: "female",
  HOMBRE: "male",
  UNISEX: "unisex",
  NINOS: "unisex",
};

// Parses "2 a 5 días hábiles" / "3-5 días" / "5 días" → {min, max}
function parseTransitDays(estimated: string): { min: number; max: number } {
  const numbers = (estimated.match(/\d+/g) || []).map(Number);
  if (numbers.length === 0) return { min: 2, max: 7 };
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  const [products, shippingZones, shippingSettings] = await Promise.all([
    prisma.product.findMany({
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
    }),
    getShippingZones(),
    getShippingSettings(),
  ]);

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
      .replace(/[\u0080-\uFFFF]/g, (c) => `&#${c.charCodeAt(0)};`);

  const absUrl = (u: string) => (u.startsWith("http") ? u : `${baseUrl}${u}`);

  // Google sólo acepta <g:region> para AU, US y JP. Para Chile usamos un único
  // bloque a nivel país con la tarifa más alta de las zonas (conservador) para
  // evitar penalizaciones por subestimar el costo real de envío en checkout.
  type ZoneEntry = { service: string; price: number; transit: { min: number; max: number } };
  const zoneEntries: ZoneEntry[] = shippingZones.map((zone) => ({
    service: zone.name,
    price: zone.price,
    transit: parseTransitDays(zone.estimatedDays),
  }));

  const buildShippingBlocks = (productPrice: number) => {
    const qualifiesForFree =
      shippingSettings.freeShippingEnabled &&
      productPrice >= shippingSettings.freeShippingThreshold;

    if (qualifiesForFree || zoneEntries.length === 0) {
      return `      <g:shipping>
        <g:country>CL</g:country>
        <g:service>${escapeXml("Envío estándar")}</g:service>
        <g:price>0 CLP</g:price>
        <g:min_handling_time>1</g:min_handling_time>
        <g:max_handling_time>3</g:max_handling_time>
        <g:min_transit_time>2</g:min_transit_time>
        <g:max_transit_time>7</g:max_transit_time>
      </g:shipping>`;
    }

    const worstCase = zoneEntries.reduce((acc, e) => (e.price > acc.price ? e : acc), zoneEntries[0]);
    const minTransit = Math.min(...zoneEntries.map((e) => e.transit.min));
    const maxTransit = Math.max(...zoneEntries.map((e) => e.transit.max));

    return `      <g:shipping>
        <g:country>CL</g:country>
        <g:service>${escapeXml(worstCase.service)}</g:service>
        <g:price>${worstCase.price} CLP</g:price>
        <g:min_handling_time>1</g:min_handling_time>
        <g:max_handling_time>3</g:max_handling_time>
        <g:min_transit_time>${minTransit}</g:min_transit_time>
        <g:max_transit_time>${maxTransit}</g:max_transit_time>
      </g:shipping>`;
  };

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

      // Sale price logic: when compareAtPrice exists and is higher than price,
      // use compareAtPrice as the regular price and `price` as the sale price.
      const hasSale =
        typeof product.compareAtPrice === "number" &&
        product.compareAtPrice > product.price;
      const regularPrice = hasSale ? product.compareAtPrice! : product.price;
      const salePriceXml = hasSale
        ? `\n      <g:sale_price>${product.price} CLP</g:sale_price>`
        : "";

      // Materials joined for <g:material> (max 3 to keep within ~200 chars)
      const materialsXml = product.materials.length
        ? `\n      <g:material>${escapeXml(product.materials.slice(0, 3).map((m) => m.name).join(" / "))}</g:material>`
        : "";

      // Gender + age group from audiencia
      const gender = AUDIENCE_GENDER[product.audiencia];
      const genderXml = gender ? `\n      <g:gender>${gender}</g:gender>` : "";
      const ageGroup = product.audiencia === "NINOS" ? "kids" : "adult";
      const ageGroupXml = `\n      <g:age_group>${ageGroup}</g:age_group>`;

      // Sizes: emit one <g:size> per talla (Google reads multiple)
      const tallasList = product.tallas?.length
        ? product.tallas
        : product.tallaUnica
          ? [product.tallaUnica]
          : [];
      const sizesXml = tallasList.length
        ? "\n" +
          tallasList
            .slice(0, 10)
            .map((t) => `      <g:size>${escapeXml(t)}</g:size>`)
            .join("\n")
        : "";

      // Return policy (item-level): 14-day free returns by mail when allowed.
      // MADE_TO_ORDER + non-returnable items declare 0 days = no returns.
      const allowsReturns =
        product.isReturnable && product.productionType !== "MADE_TO_ORDER";
      const returnPolicyXml = allowsReturns
        ? `\n      <g:return_policy_days>14</g:return_policy_days>`
        : `\n      <g:return_policy_days>0</g:return_policy_days>`;

      // MPN/SKU based on stable slug — lets us drop identifier_exists=false
      const mpn = product.slug.toUpperCase().slice(0, 70);

      const shippingBlocks = buildShippingBlocks(product.price);

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name.trim())}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${baseUrl}/coleccion/${escapeXml(product.slug)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
${additionalImages}${additionalImages ? "\n" : ""}      <g:price>${regularPrice} CLP</g:price>${salePriceXml}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(product.artisan?.displayName || "Casa Orfebre")}</g:brand>
      <g:mpn>${escapeXml(mpn)}</g:mpn>
      <g:identifier_exists>false</g:identifier_exists>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>${materialsXml}${genderXml}${ageGroupXml}${sizesXml}${returnPolicyXml}
${shippingBlocks}
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
