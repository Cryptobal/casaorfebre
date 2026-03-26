import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/coleccion`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/orfebres`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/garantia`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/terminos`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/privacidad`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/postular`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  // Dynamic: products
  const products = await prisma.product.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });
  const productPages = products.map((p) => ({
    url: `${baseUrl}/coleccion/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic: artisans
  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });
  const artisanPages = artisans.map((a) => ({
    url: `${baseUrl}/orfebres/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...artisanPages];
}
