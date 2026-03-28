import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), "env.local") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const R2 = "https://assets.casaorfebre.cl";
const ADMIN_EMAIL = "carlos.irigoyen@gmail.com";

function readingTime(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

const posts = [
  {
    slug: "regalos-joyeria-artesanal-dia-madre-2026",
    title: "10 Regalos de Joyería Artesanal para el Día de la Madre 2026",
    excerpt: "¿Buscas un regalo único para mamá? Descubre 10 joyas artesanales chilenas hechas a mano, desde $28.000. Con certificado de autenticidad y envío a todo Chile.",
    category: "GUIAS" as const,
    tags: ["día de la madre", "regalos", "joyería artesanal", "regalo mujer"],
    publishedAt: "2026-03-30",
    coverImage: `${R2}/blog/regalos-dia-madre-2026.jpg`,
    seoTitle: "10 Regalos de Joyería Artesanal para el Día de la Madre 2026 | Casa Orfebre",
    seoDescription: "¿Buscas un regalo único para mamá? Descubre 10 joyas artesanales chilenas hechas a mano, desde $28.000. Con certificado de autenticidad y envío a todo Chile.",
    featured: false,
  },
  {
    slug: "tendencias-joyeria-artesanal-2026-chile",
    title: "Tendencias en Joyería Artesanal 2026: Lo que Viene para Chile",
    excerpt: "Descubre las 6 tendencias que definen la joyería artesanal en Chile este 2026: texturas orgánicas, mezcla de metales, piedras chilenas y slow jewelry.",
    category: "TENDENCIAS" as const,
    tags: ["tendencias 2026", "joyería artesanal", "slow jewelry", "piedras chilenas"],
    publishedAt: "2026-04-06",
    coverImage: `${R2}/blog/tendencias-joyeria-2026.jpg`,
    seoTitle: "Tendencias en Joyería Artesanal 2026: Lo que Viene para Chile | Casa Orfebre",
    seoDescription: "Descubre las 6 tendencias que definen la joyería artesanal en Chile este 2026: texturas orgánicas, mezcla de metales, piedras chilenas y slow jewelry.",
    featured: false,
  },
  {
    slug: "plata-950-vs-925-diferencias-guia-completa",
    title: "Plata 950 vs Plata 925: Todo lo que Necesitas Saber Antes de Comprar",
    excerpt: "¿Plata 950 o 925? Te explicamos las diferencias de pureza, brillo, durabilidad y precio para que elijas la mejor plata para tu próxima joya artesanal.",
    category: "GUIAS" as const,
    tags: ["plata 950", "plata 925", "sterling silver", "materiales", "guía de compra"],
    publishedAt: "2026-04-13",
    coverImage: `${R2}/blog/plata-950-vs-925.jpg`,
    seoTitle: "Plata 950 vs 925: Diferencias, Cuál es Mejor y Cómo Elegir | Casa Orfebre",
    seoDescription: "¿Plata 950 o 925? Te explicamos las diferencias de pureza, brillo, durabilidad y precio para que elijas la mejor plata para tu próxima joya artesanal.",
    featured: false,
  },
  {
    slug: "como-reconocer-joyas-plata-autenticas-guia",
    title: "Cómo Reconocer Joyas de Plata Auténticas: Guía Antifraude 2026",
    excerpt: "Aprende 7 métodos para verificar si tu plata es real o falsa. Descubre las estafas más comunes en joyería online en Chile y cómo protegerte.",
    category: "GUIAS" as const,
    tags: ["plata auténtica", "guía de compra", "fraude joyería", "punzón plata"],
    publishedAt: "2026-04-20",
    coverImage: `${R2}/blog/reconocer-plata-autentica.jpg`,
    seoTitle: "Cómo Reconocer Joyas de Plata Auténticas: Guía Antifraude | Casa Orfebre",
    seoDescription: "Aprende 7 métodos para verificar si tu plata es real o falsa. Descubre las estafas más comunes en joyería online en Chile y cómo protegerte.",
    featured: false,
  },
  {
    slug: "taller-orfebre-como-nace-joya-artesanal-paso-a-paso",
    title: "El Taller del Orfebre: Así Nace una Joya Artesanal Paso a Paso",
    excerpt: "Entra al taller de un orfebre chileno y descubre el proceso completo de creación de una joya artesanal: del boceto al pulido final, paso a paso.",
    category: "ORFEBRES" as const,
    tags: ["orfebrería", "proceso artesanal", "taller", "técnicas joyería"],
    publishedAt: "2026-04-27",
    coverImage: `${R2}/blog/taller-orfebre.jpg`,
    seoTitle: "El Taller del Orfebre: Así Nace una Joya Artesanal Paso a Paso | Casa Orfebre",
    seoDescription: "Entra al taller de un orfebre chileno y descubre el proceso completo de creación de una joya artesanal: del boceto al pulido final, paso a paso.",
    featured: false,
  },
  {
    slug: "joyeria-cobre-chileno-metal-identidad",
    title: "Joyería de Cobre Chileno: El Metal que Nos Define",
    excerpt: "Chile produce el 27% del cobre mundial. Descubre por qué este metal noble está conquistando la joyería artesanal chilena y cómo cuidar tus joyas de cobre.",
    category: "MATERIALES" as const,
    tags: ["cobre", "materiales", "joyería chilena", "artesanía"],
    publishedAt: "2026-05-04",
    coverImage: `${R2}/blog/joyeria-cobre-chileno.jpg`,
    seoTitle: "Joyería de Cobre Chileno: El Metal que Nos Define | Casa Orfebre",
    seoDescription: "Chile produce el 27% del cobre mundial. Descubre por qué este metal noble está conquistando la joyería artesanal chilena y cómo cuidar tus joyas de cobre.",
    featured: false,
  },
  {
    slug: "plateria-mapuche-contemporanea-tradicion-joyeria-chilena",
    title: "Platería Mapuche Contemporánea: Tradición Viva en la Joyería Chilena",
    excerpt: "Conoce la historia del rütrafe, el significado del trapelakucha y los chaway, y cómo la platería mapuche renace en la orfebrería chilena contemporánea.",
    category: "CULTURA" as const,
    tags: ["platería mapuche", "cultura", "tradición", "plata", "patrimonio chileno"],
    publishedAt: "2026-05-11",
    coverImage: `${R2}/blog/plateria-mapuche.jpg`,
    seoTitle: "Platería Mapuche Contemporánea: Tradición Viva en la Joyería Chilena | Casa Orfebre",
    seoDescription: "Conoce la historia del rütrafe, el significado del trapelakucha y los chaway, y cómo la platería mapuche renace en la orfebrería chilena contemporánea.",
    featured: false,
  },
  {
    slug: "anillos-matrimonio-artesanales-chile-guia",
    title: "Anillos de Matrimonio Artesanales en Chile: Guía para Elegir el Tuyo",
    excerpt: "Descubre por qué las parejas chilenas eligen argollas artesanales hechas a mano. Guía de materiales, tallas, precios y cómo encargar las tuyas.",
    category: "GUIAS" as const,
    tags: ["anillos matrimonio", "argollas artesanales", "bodas", "plata 950", "oro"],
    publishedAt: "2026-05-18",
    coverImage: `${R2}/blog/anillos-matrimonio-artesanales.jpg`,
    seoTitle: "Anillos de Matrimonio Artesanales en Chile: Guía Completa | Casa Orfebre",
    seoDescription: "Descubre por qué las parejas chilenas eligen argollas artesanales hechas a mano. Guía de materiales, tallas, precios y cómo encargar las tuyas.",
    featured: false,
  },
  {
    slug: "emprender-orfebre-chile-2026-guia-completa",
    title: "Emprender como Orfebre en Chile 2026: Todo lo que Necesitas Saber",
    excerpt: "¿Quieres vivir de la orfebrería? Guía completa para emprender como joyero artesanal en Chile: formación, taller, formalización, pricing y canales de venta.",
    category: "ORFEBRES" as const,
    tags: ["emprender", "orfebre", "joyería artesanal", "negocio", "Chile"],
    publishedAt: "2026-05-25",
    coverImage: `${R2}/blog/emprender-orfebre-chile.jpg`,
    seoTitle: "Emprender como Orfebre en Chile 2026: Guía Completa | Casa Orfebre",
    seoDescription: "¿Quieres vivir de la orfebrería? Guía completa para emprender como joyero artesanal en Chile: formación, taller, formalización, pricing y canales de venta.",
    featured: false,
  },
  {
    slug: "joyas-identidad-chilena-desierto-atacama-bosques-patagonia",
    title: "Joyas con Identidad Chilena: Del Desierto de Atacama a los Bosques de la Patagonia",
    excerpt: "Un viaje por Chile a través de sus joyas: piedras del desierto, plata mapuche, cobre del centro y ágatas patagónicas. La geografía hecha joyería.",
    category: "CULTURA" as const,
    tags: ["identidad chilena", "joyas chilenas", "piedras naturales", "geografía", "orfebrería"],
    publishedAt: "2026-06-01",
    coverImage: `${R2}/blog/joyas-identidad-chilena.jpg`,
    seoTitle: "Joyas con Identidad Chilena: Del Desierto de Atacama a la Patagonia | Casa Orfebre",
    seoDescription: "Un viaje por Chile a través de sus joyas: piedras del desierto, plata mapuche, cobre del centro y ágatas patagónicas. La geografía hecha joyería.",
    featured: false,
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    console.error("❌ No se encontró el usuario admin:", ADMIN_EMAIL);
    process.exit(1);
  }

  const contentDir = path.join(__dirname, "blog-content");
  let count = 0;

  for (const meta of posts) {
    const mdFile = path.join(contentDir, `${meta.slug}.md`);
    let content: string;
    if (fs.existsSync(mdFile)) {
      content = fs.readFileSync(mdFile, "utf-8");
    } else {
      console.warn(`⚠️  Archivo no encontrado: ${mdFile}, usando excerpt`);
      content = meta.excerpt;
    }

    await prisma.blogPost.upsert({
      where: { slug: meta.slug },
      update: {
        title: meta.title,
        excerpt: meta.excerpt,
        content,
        coverImage: meta.coverImage,
        category: meta.category,
        tags: meta.tags,
        seoTitle: meta.seoTitle,
        seoDescription: meta.seoDescription,
        readingTime: readingTime(content),
        status: "PUBLISHED",
        publishedAt: new Date(meta.publishedAt + "T12:00:00"),
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
        readingTime: readingTime(content),
        featured: meta.featured || false,
      },
    });
    count++;
    console.log(`  ✓ ${meta.title}`);
  }

  console.log(`\n✅ ${count} nuevos artículos de blog creados`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
