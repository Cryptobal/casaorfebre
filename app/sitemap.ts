import { prisma } from "@/lib/prisma";
import { getAllPosts } from "@/lib/blog";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/coleccion`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/orfebres`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/lo-nuevo`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/seleccion-del-curador`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/tesoros-de-chile`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/nosotros`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/garantia`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/preguntas-frecuentes`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/terminos`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/privacidad`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/postular`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  // Category SEO pages
  const categoryPages = ["aros", "collares", "anillos", "pulseras", "colgantes"].map((cat) => ({
    url: `${baseUrl}/coleccion/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Material SEO landing pages
  const materialPages = ["plata-925", "oro", "cobre", "piedras-naturales", "lapislazuli"].map((mat) => ({
    url: `${baseUrl}/coleccion/${mat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Occasion SEO pages
  const occasionPages = [
    "compromiso", "matrimonio", "regalos",
    "graduacion", "dia-de-la-madre", "aniversario", "autorregalo",
  ].map((occ) => ({
    url: `${baseUrl}/coleccion/${occ}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Budget SEO pages
  const budgetPages = ["regalos-bajo-30000", "regalos-bajo-50000", "regalos-bajo-100000"].map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog posts
  const blogPosts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

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

  return [...staticPages, ...categoryPages, ...materialPages, ...occasionPages, ...budgetPages, ...blogPosts, ...productPages, ...artisanPages];
}
