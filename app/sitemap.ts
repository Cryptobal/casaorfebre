import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/data/cities";
import { slugify } from "@/lib/utils";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  // Home page (priority 1.0, daily)
  const homePage = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
  ];

  // Collection landing page (priority 0.9, daily)
  const collectionPage = [
    { url: `${baseUrl}/coleccion`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
  ];

  // Category landing pages (priority 0.9, weekly)
  const categoryPages = [
    "cadenas-de-plata",
    "aros-de-plata",
    "anillos-de-plata",
    "pulseras-de-plata",
    "collares-de-plata",
    "colgantes-dijes-plata",
  ].map((cat) => ({
    url: `${baseUrl}/coleccion/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Hub pages (priority 0.9, weekly)
  const hubPages = ["joyas-hombre", "joyas-mujer"].map((hub) => ({
    url: `${baseUrl}/${hub}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Occasion pages (priority 0.8, weekly)
  const occasionPages = [
    "anillos-de-compromiso-plata",
    "anillos-matrimonio-plata",
    "joyas-para-parejas",
    "joyas-dia-de-la-madre",
  ].map((occ) => ({
    url: `${baseUrl}/${occ}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Guide pages (priority 0.8, monthly)
  const guidePages = ["plata-925-950", "galeria-santo-domingo"].map((guide) => ({
    url: `${baseUrl}/${guide}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Blog hub (priority 0.7, daily)
  const blogHub = [
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
  ];

  // Blog posts (priority 0.7, monthly) - from DB
  const dbBlogPosts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, category: true, tags: true },
  });
  const blogPosts = dbBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Blog category pages
  const categoryLabels: Record<string, string> = {
    GUIAS: "Guías", TENDENCIAS: "Tendencias", ORFEBRES: "Orfebres",
    CUIDADOS: "Cuidados", MATERIALES: "Materiales", CULTURA: "Cultura",
  };
  const blogCategories = [...new Set(dbBlogPosts.map((p) => p.category))];
  const blogCategoryPages = blogCategories.map((cat) => ({
    url: `${baseUrl}/blog/categoria/${slugify(categoryLabels[cat] || cat)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Blog tag pages
  const blogTagSet = new Set<string>();
  dbBlogPosts.forEach((p) => p.tags.forEach((t) => blogTagSet.add(t)));
  const blogTagPages = Array.from(blogTagSet).map((tag) => ({
    url: `${baseUrl}/blog/tag/${slugify(tag)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Joyerias page (priority 0.7, weekly)
  const joyeriasPage = [
    { url: `${baseUrl}/joyerias`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  // City pages (priority 0.7, monthly)
  const cityPages = CITIES.map((city) => ({
    url: `${baseUrl}/joyerias/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Orfebres hub (priority 0.7, weekly)
  const orfebresHub = [
    { url: `${baseUrl}/orfebres`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  // Artisans (priority 0.6, weekly)
  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true, region: true },
  });
  const artisanPages = artisans.map((a) => ({
    url: `${baseUrl}/orfebres/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Artisan region pages (priority 0.6, weekly)
  const artisanRegions = [...new Set(artisans.map((a) => a.region).filter(Boolean))];
  const artisanRegionPages = artisanRegions.map((region) => ({
    url: `${baseUrl}/orfebres/region/${slugify(region!)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Category landing pages (SEO) (priority 0.8, weekly)
  const dbCategories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  const categorySeoPages = dbCategories.map((c) => ({
    url: `${baseUrl}/coleccion/categoria/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Products (priority 0.8, weekly, with lastModified)
  const products = await prisma.product.findMany({
    where: { status: "APPROVED" },
    select: { slug: true, updatedAt: true },
  });
  const productPages = products.map((p: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/coleccion/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Landing pages (priority 0.9, monthly)
  const landingPages = [
    { url: `${baseUrl}/para-compradores`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/para-orfebres`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/pioneros`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
  ];

  // Material pages (priority 0.7, monthly)
  const dbMaterials = await prisma.material.findMany({
    where: { isActive: true },
    select: { name: true },
  });
  const materialPages = dbMaterials.map((m: { name: string }) => ({
    url: `${baseUrl}/materiales/${slugify(m.name)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Curated collections (priority 0.7, weekly)
  const curatedCollections = await prisma.curatedCollection.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  const curatedCollectionPages = curatedCollections.map((c: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/colecciones/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Other static pages (lower priority)
  const otherPages = [
    { url: `${baseUrl}/lo-nuevo`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/seleccion-del-curador`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/nosotros`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/postular`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/gift-cards`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/garantia`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/preguntas-frecuentes`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/terminos`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/privacidad`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  return [
    ...homePage,
    ...collectionPage,
    ...categoryPages,
    ...hubPages,
    ...occasionPages,
    ...guidePages,
    ...blogHub,
    ...blogPosts,
    ...blogCategoryPages,
    ...blogTagPages,
    ...joyeriasPage,
    ...cityPages,
    ...orfebresHub,
    ...artisanPages,
    ...artisanRegionPages,
    ...categorySeoPages,
    ...productPages,
    ...landingPages,
    ...materialPages,
    ...curatedCollectionPages,
    ...otherPages,
  ];
}
