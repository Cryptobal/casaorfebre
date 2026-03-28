import { config } from "dotenv";
import path from "path";

// Load env.local (project root) before instantiating PrismaClient
config({ path: path.resolve(process.cwd(), "env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** URLs absolutas R2 en prod/preview; sin R2_PUBLIC_URL se usan rutas `/blog/...` para desarrollo local. */
const R2_BLOG_BASE = process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/blog` : "/blog";

const ADMIN_EMAIL = "carlos.irigoyen@gmail.com";

function calculateReadingTime(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

/**
 * Convert a blog TSX component to Markdown by stripping JSX tags
 * and converting HTML elements to their Markdown equivalents.
 */
function tsxToMarkdown(tsx: string): string {
  let md = tsx;

  // Remove import lines and component wrapper
  md = md.replace(/^import .*;\n/gm, "");
  md = md.replace(/export function PostContent\(\) \{/, "");
  md = md.replace(/\s*return \(\s*<div>/, "");
  md = md.replace(/<\/div>\s*\);\s*\}\s*$/, "");

  // Remove JSX comments: {/* ... */}
  md = md.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  // Remove entire CTA section at the end (div with mt-16, may have nested divs)
  md = md.replace(/<div className="mt-16[\s\S]*$/g, "");

  // Convert headings
  md = md.replace(/<h2[^>]*>\s*/g, "\n## ");
  md = md.replace(/\s*<\/h2>/g, "\n");
  md = md.replace(/<h3[^>]*>\s*/g, "\n### ");
  md = md.replace(/\s*<\/h3>/g, "\n");

  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>\s*/g, "\n> ");
  md = md.replace(/\s*<\/blockquote>/g, "\n");

  // Convert list items and lists
  md = md.replace(/<ul[^>]*>\s*/g, "\n");
  md = md.replace(/\s*<\/ul>/g, "\n");
  md = md.replace(/<li[^>]*>\s*/g, "- ");
  md = md.replace(/\s*<\/li>/g, "\n");

  // Convert strong/bold
  md = md.replace(/<strong[^>]*>/g, "**");
  md = md.replace(/<\/strong>/g, "**");

  // Convert em/italic
  md = md.replace(/<em>/g, "*");
  md = md.replace(/<\/em>/g, "*");

  // Convert Link components
  md = md.replace(/<Link\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/Link>/g, "[$2]($1)");

  // Convert paragraphs
  md = md.replace(/<p[^>]*>\s*/g, "\n");
  md = md.replace(/\s*<\/p>/g, "\n");

  // HTML entities
  md = md.replace(/&ldquo;/g, '"');
  md = md.replace(/&rdquo;/g, '"');
  md = md.replace(/&lsquo;/g, "'");
  md = md.replace(/&rsquo;/g, "'");
  md = md.replace(/&mdash;/g, "—");
  md = md.replace(/&nbsp;/g, " ");
  md = md.replace(/&middot;/g, "·");
  md = md.replace(/&rarr;/g, "→");

  // Remove remaining JSX artifacts
  md = md.replace(/\{" "\}/g, " ");
  md = md.replace(/<span[^>]*>/g, "");
  md = md.replace(/<\/span>/g, "");
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, "[$2]($1)");
  md = md.replace(/<br\s*\/?>/g, "\n");
  md = md.replace(/<\/?div[^>]*>/g, "");

  // Clean up excessive whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

// Metadata for all 9 articles (from lib/blog.ts)
const articlesMetadata = [
  {
    slug: "joyeria-de-autor-chile-renacimiento-orfebreria-artesanal",
    title: "Joyería de Autor en Chile: El Renacimiento de la Orfebrería Artesanal",
    excerpt: "Descubre cómo el movimiento de joyería de autor está transformando la escena artesanal chilena, recuperando técnicas ancestrales y creando piezas únicas con identidad.",
    category: "CULTURA" as const,
    tags: ["joyería de autor", "orfebrería chilena", "artesanía", "plata"],
    publishedAt: "2026-03-26",
    coverImage: `${R2_BLOG_BASE}/joyeria-autor-chile.jpg`,
    seoTitle: "Joyería de Autor en Chile: El Renacimiento de la Orfebrería Artesanal | Casa Orfebre",
    seoDescription: "Explora el movimiento de joyería de autor en Chile. Historia, técnicas, materiales nobles y el rol de los orfebres independientes en la escena artesanal contemporánea.",
    featured: true,
  },
  {
    slug: "guia-elegir-cuidar-joyas-artesanales-plata",
    title: "Guía Completa: Cómo Elegir y Cuidar Joyas Artesanales de Plata",
    excerpt: "Todo lo que necesitas saber sobre plata 950 vs 925, cómo reconocer autenticidad, cuidados esenciales y por qué la plata artesanal envejece de forma única.",
    category: "GUIAS" as const,
    tags: ["plata", "cuidado de joyas", "plata 950", "guía"],
    publishedAt: "2026-03-26",
    coverImage: `${R2_BLOG_BASE}/guia-plata-artesanal.jpg`,
    seoTitle: "Cómo Elegir y Cuidar Joyas de Plata Artesanal | Guía Completa | Casa Orfebre",
    seoDescription: "Guía definitiva para elegir y cuidar joyas artesanales de plata. Diferencias entre plata 950 y 925, limpieza, almacenamiento y autenticidad.",
    featured: false,
  },
  {
    slug: "anillo-compromiso-artesanal-hecho-a-mano-chile",
    title: "Anillos de Compromiso Artesanales: Por Qué Elegir una Pieza Hecha a Mano",
    excerpt: "Descubre por qué cada vez más parejas en Chile eligen anillos de compromiso hechos a mano por orfebres locales en vez de joyerías industriales.",
    category: "GUIAS" as const,
    tags: ["anillos de compromiso", "hecho a mano", "matrimonio", "oro 18k"],
    publishedAt: "2026-04-02",
    coverImage: `${R2_BLOG_BASE}/anillo-compromiso-artesanal.jpg`,
    seoTitle: "Anillo de Compromiso Hecho a Mano en Chile | Guía para Elegir | Casa Orfebre",
    seoDescription: "Guía para elegir un anillo de compromiso artesanal hecho a mano en Chile. Materiales, estilos, presupuestos y cómo trabajar con un orfebre para crear tu pieza única.",
    featured: false,
  },
  {
    slug: "joyeria-sustentable-slow-fashion-chile",
    title: "Joyería Sustentable y Slow Fashion: El Futuro de las Joyas en Chile",
    excerpt: "La joyería artesanal es inherentemente sustentable. Conoce cómo el movimiento slow fashion está transformando la forma en que compramos y valoramos las joyas.",
    category: "CULTURA" as const,
    tags: ["joyería sustentable", "slow fashion", "consumo consciente"],
    publishedAt: "2026-04-09",
    coverImage: `${R2_BLOG_BASE}/joyeria-sustentable-chile.jpg`,
    seoTitle: "Joyería Sustentable Chile: Slow Fashion y Joyas con Historia | Casa Orfebre",
    seoDescription: "Descubre la joyería sustentable en Chile. Cómo el slow fashion y el consumo consciente están impulsando la joyería artesanal hecha a mano por orfebres locales.",
    featured: false,
  },
  {
    slug: "lapislazuli-piedra-nacional-chile-joyas",
    title: "Lapislázuli: La Piedra Nacional de Chile y su Magia en la Joyería",
    excerpt: "El lapislázuli chileno es una de las gemas más especiales del mundo. Conoce su historia, dónde se extrae y por qué es la piedra favorita de los orfebres nacionales.",
    category: "MATERIALES" as const,
    tags: ["lapislázuli", "piedras naturales", "piedras chilenas", "gemas"],
    publishedAt: "2026-04-16",
    coverImage: `${R2_BLOG_BASE}/lapislazuli-chile.jpg`,
    seoTitle: "Lapislázuli Chileno: Historia, Propiedades y Joyería Artesanal | Casa Orfebre",
    seoDescription: "Todo sobre el lapislázuli chileno: origen, extracción en la Cordillera de los Andes, propiedades y cómo los orfebres lo transforman en joyas únicas.",
    featured: false,
  },
  {
    slug: "guia-regalar-joyeria-artesanal-mujer-chile",
    title: "Guía para Regalar Joyería Artesanal: Ideas para Cada Ocasión",
    excerpt: "¿Buscas un regalo significativo? Te ayudamos a elegir la joya artesanal perfecta según la ocasión, el estilo y el presupuesto.",
    category: "GUIAS" as const,
    tags: ["regalo joyería", "joyería para regalar", "ideas regalo mujer"],
    publishedAt: "2026-04-23",
    coverImage: `${R2_BLOG_BASE}/regalar-joyeria-artesanal.jpg`,
    seoTitle: "Regalo Joyería Artesanal Mujer Chile: Guía por Ocasión | Casa Orfebre",
    seoDescription: "Ideas para regalar joyería artesanal en Chile. Guía por ocasión: aniversario, cumpleaños, día de la madre. Cómo elegir la pieza perfecta hecha a mano.",
    featured: false,
  },
  {
    slug: "joyas-con-significado-simbolismo-joyeria-artesanal",
    title: "Joyas con Significado: El Simbolismo Detrás de la Joyería Artesanal",
    excerpt: "Cada pieza artesanal cuenta una historia. Explora los símbolos, materiales y formas que los orfebres chilenos usan para crear joyas cargadas de significado.",
    category: "CULTURA" as const,
    tags: ["joyas con significado", "joyas con historia", "joyas con piedras", "joyería artesanal", "simbolismo"],
    publishedAt: "2026-04-30",
    coverImage: `${R2_BLOG_BASE}/joyas-significado.jpg`,
    seoTitle: "Joyas con Significado y Historia | Simbolismo en Joyería Artesanal | Casa Orfebre",
    seoDescription: "Descubre el significado detrás de las joyas artesanales. Símbolos en piedras naturales, formas orgánicas y la historia que cada orfebre chileno plasma en sus creaciones.",
    featured: false,
  },
  {
    slug: "como-vender-joyeria-artesanal-online-chile",
    title: "Cómo Vender Joyería Artesanal Online en Chile: Guía para Orfebres",
    excerpt: "Si eres orfebre y quieres llevar tus piezas a más personas, esta guía te enseña cómo vender joyería artesanal en internet de forma profesional.",
    category: "ORFEBRES" as const,
    tags: ["vender joyas online", "plataforma para orfebres", "emprendimiento"],
    publishedAt: "2026-05-07",
    coverImage: `${R2_BLOG_BASE}/vender-joyeria-online.jpg`,
    seoTitle: "Vender Joyería Artesanal Online Chile: Guía Completa para Orfebres | Casa Orfebre",
    seoDescription: "Guía paso a paso para vender joyería artesanal online en Chile. Fotografía de producto, precios, plataformas, envíos y cómo construir tu marca como orfebre.",
    featured: false,
  },
  {
    slug: "piedras-naturales-chilenas-joyeria-cuarzo-turquesa",
    title: "Piedras Naturales Chilenas en la Joyería: Cuarzo, Turquesa y Más",
    excerpt: "Chile posee una riqueza mineral extraordinaria. Conoce las piedras naturales que nuestros orfebres engastan en sus creaciones y sus propiedades únicas.",
    category: "MATERIALES" as const,
    tags: ["piedras naturales", "cuarzo", "turquesa", "piedras chilenas"],
    publishedAt: "2026-05-14",
    coverImage: `${R2_BLOG_BASE}/piedras-naturales-chile.jpg`,
    seoTitle: "Piedras Naturales Chilenas para Joyería: Cuarzo, Turquesa, Ágata | Casa Orfebre",
    seoDescription: "Guía de piedras naturales chilenas usadas en joyería artesanal. Cuarzo, turquesa, ágata, amatista: propiedades, significado y cómo se engastan a mano.",
    featured: false,
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    console.error("❌ No se encontró el usuario admin:", ADMIN_EMAIL);
    process.exit(1);
  }

  const blogDir = path.join(__dirname, "..", "content", "blog");
  let count = 0;

  for (const meta of articlesMetadata) {
    const filePath = path.join(blogDir, `${meta.slug}.tsx`);

    let content: string;
    if (fs.existsSync(filePath)) {
      const tsx = fs.readFileSync(filePath, "utf-8");
      content = tsxToMarkdown(tsx);
    } else {
      console.warn(`⚠️  Archivo no encontrado: ${filePath}, usando excerpt como contenido`);
      content = meta.excerpt;
    }

    await prisma.blogPost.upsert({
      where: { slug: meta.slug },
      update: {
        content,
        readingTime: calculateReadingTime(content),
        coverImage: meta.coverImage,
      },
      create: {
        slug: meta.slug,
        title: meta.title,
        excerpt: meta.excerpt,
        content,
        coverImage: meta.coverImage,
        category: meta.category,
        tags: meta.tags,
        authorId: admin.id,
        status: "PUBLISHED",
        publishedAt: new Date(meta.publishedAt + "T12:00:00"),
        seoTitle: meta.seoTitle,
        seoDescription: meta.seoDescription,
        readingTime: calculateReadingTime(content),
        featured: meta.featured || false,
      },
    });
    count++;
    console.log(`  ✓ ${meta.title}`);
  }

  console.log(`\n✅ ${count} artículos migrados al nuevo sistema de blog`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
