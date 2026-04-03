import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBlogArticle } from "@/lib/ai/blog-generator";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 120;

// Comunas y ciudades más allá de las 16 páginas estáticas existentes
// Foco en comunas con actividad artesanal o búsqueda local relevante
const CITY_TARGETS: { name: string; slug: string; angle: string }[] = [
  { name: "Providencia",    slug: "providencia",     angle: "joyería de autor en Providencia" },
  { name: "Ñuñoa",          slug: "nunoa",            angle: "orfebres artesanales en Ñuñoa" },
  { name: "Las Condes",     slug: "las-condes",       angle: "joyería artesanal en Las Condes" },
  { name: "Maipú",          slug: "maipu",            angle: "joyería hecha a mano en Maipú" },
  { name: "La Florida",     slug: "la-florida",       angle: "joyas artesanales en La Florida" },
  { name: "San Miguel",     slug: "san-miguel",       angle: "joyería artesanal en San Miguel" },
  { name: "Barrio Italia",  slug: "barrio-italia",    angle: "orfebres en Barrio Italia Santiago" },
  { name: "Lastarria",      slug: "lastarria",        angle: "joyería de diseño en Lastarria" },
  { name: "Punta Arenas",   slug: "punta-arenas",     angle: "joyería artesanal en Punta Arenas" },
  { name: "Arica",          slug: "arica",            angle: "joyería artesanal en Arica" },
  { name: "Copiapó",        slug: "copiapo",          angle: "joyería de cobre en Copiapó" },
  { name: "Calama",         slug: "calama",           angle: "joyería artesanal en Calama" },
  { name: "Ovalle",         slug: "ovalle",           angle: "orfebres en Ovalle Chile" },
  { name: "Quillota",       slug: "quillota",         angle: "joyería artesanal en Quillota" },
  { name: "San Antonio",    slug: "san-antonio",      angle: "joyería artesanal en San Antonio" },
  { name: "Melipilla",      slug: "melipilla",        angle: "orfebres artesanales en Melipilla" },
  { name: "Linares",        slug: "linares",          angle: "joyería hecha a mano en Linares" },
  { name: "San Fernando",   slug: "san-fernando",     angle: "joyería artesanal en San Fernando" },
  { name: "Angol",          slug: "angol",            angle: "joyería artesanal en Angol" },
  { name: "Victoria",       slug: "victoria",         angle: "orfebres en Victoria Araucanía" },
  { name: "Villarrica",     slug: "villarrica",       angle: "joyería artesanal en Villarrica" },
  { name: "Pucón",          slug: "pucon",            angle: "joyas artesanales en Pucón" },
  { name: "Castro",         slug: "castro",           angle: "joyería artesanal en Chiloé" },
  { name: "Puerto Varas",   slug: "puerto-varas",     angle: "joyería de autor en Puerto Varas" },
  { name: "Coyhaique",      slug: "coyhaique",        angle: "joyería artesanal en Coyhaique" },
  { name: "Puerto Natales", slug: "puerto-natales",   angle: "artesanía y joyería en Puerto Natales" },
  { name: "Atacama",        slug: "atacama",          angle: "joyería de cobre y lapislázuli en Atacama" },
  { name: "Limache",        slug: "limache",          angle: "joyería artesanal en Limache" },
  { name: "Quilpué",        slug: "quilpue",          angle: "orfebres artesanales en Quilpué" },
  { name: "San Bernardo",   slug: "san-bernardo",     angle: "joyería hecha a mano en San Bernardo" },
];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verifica que no hayamos generado un post de ciudad esta semana
  const oneWeekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const recentCityPost = await prisma.blogPost.count({
    where: {
      createdAt: { gte: oneWeekAgo },
      tags: { has: "ciudad-seo" },
    },
  });

  if (recentCityPost > 0) {
    return NextResponse.json({ message: "Post de ciudad ya generado esta semana", skipped: true });
  }

  // Selecciona la próxima ciudad por rotación
  let currentIndex = 0;
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "CITY_BLOG_ROTATION_INDEX" },
    });
    if (setting) currentIndex = parseInt(setting.value, 10) || 0;
  } catch {
    currentIndex = 0;
  }

  const safeIndex = currentIndex % CITY_TARGETS.length;
  const city = CITY_TARGETS[safeIndex];
  const nextIndex = (safeIndex + 1) % CITY_TARGETS.length;

  await prisma.systemSetting.upsert({
    where: { key: "CITY_BLOG_ROTATION_INDEX" },
    update: { value: nextIndex.toString() },
    create: { key: "CITY_BLOG_ROTATION_INDEX", value: nextIndex.toString() },
  });

  // Verifica que no exista ya un post sobre esta ciudad
  const existingCityPost = await prisma.blogPost.findFirst({
    where: { tags: { has: `ciudad-${city.slug}` } },
    select: { id: true },
  });

  if (existingCityPost) {
    console.log(`[CRON] blog-city-pages: ${city.name} ya tiene post, saltando`);
    return NextResponse.json({
      message: `${city.name} ya tiene post de ciudad`,
      skipped: true,
      nextCity: CITY_TARGETS[nextIndex].name,
    });
  }

  // Obtiene títulos existentes para evitar repetición
  const existingPosts = await prisma.blogPost.findMany({
    select: { title: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const existingTitles = existingPosts.map((p) => p.title);

  const topic = `${city.angle}: dónde encontrar joyas artesanales únicas y orfebres verificados`;

  // Genera el artículo completo
  const article = await generateBlogArticle({
    topic,
    keywords: [city.angle, `joyería artesanal ${city.name}`, `orfebres ${city.name}`],
    targetCategory: "GUIAS",
    includeProductLinks: true,
  });

  // Admin como autor
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (!adminUser) {
    return NextResponse.json({ error: "No admin user" }, { status: 500 });
  }

  const slug = `joyeria-artesanal-${city.slug}-${Date.now().toString(36)}`;
  const now = new Date();

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: "GUIAS",
      tags: [
        "ciudad-seo",
        `ciudad-${city.slug}`,
        city.name.toLowerCase(),
        "auto-generado",
        "joyería artesanal",
      ],
      authorId: adminUser.id,
      status: "PUBLISHED",
      publishedAt: now,
      seoTitle: article.metaTitle,
      seoDescription: article.metaDescription,
      readingTime: Math.ceil(article.content.split(/\s+/).length / 200),
    },
  });

  // Registra URL para GSC
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const newPostUrl = `${appUrl}/blog/${slug}`;
  await prisma.systemSetting.upsert({
    where: { key: "LAST_BLOG_URL_GENERATED" },
    update: { value: newPostUrl },
    create: { key: "LAST_BLOG_URL_GENERATED", value: newPostUrl },
  });

  console.log(`[CRON] blog-city-pages: "${post.title}" para ${city.name} | ${safeIndex + 1}/${CITY_TARGETS.length}`);

  return NextResponse.json({
    message: "Post de ciudad publicado",
    city: city.name,
    postId: post.id,
    title: post.title,
    slug: post.slug,
    url: newPostUrl,
    progress: `${safeIndex + 1}/${CITY_TARGETS.length} ciudades`,
  });
}
