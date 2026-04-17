import { NextResponse } from "next/server";

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${baseUrl}/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-products.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-artisans.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-blog.xml</loc></sitemap>
  <sitemap><loc>${baseUrl}/sitemap-collections.xml</loc></sitemap>
</sitemapindex>`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
