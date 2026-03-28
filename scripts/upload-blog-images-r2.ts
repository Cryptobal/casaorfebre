/**
 * Sube las imágenes de portada del blog a Cloudflare R2 y actualiza `coverImage` en la DB.
 * Uso: npx tsx scripts/upload-blog-images-r2.ts
 */
import { readFileSync, existsSync } from "fs";
import { config } from "dotenv";
import path from "path";

config({ path: ".env.local" });
config({ path: ".env" });

const BLOG_IMAGE_MAP = [
  { slug: "joyeria-de-autor-chile-renacimiento-orfebreria-artesanal", file: "joyeria-autor-chile.jpg" },
  { slug: "piedras-naturales-chilenas-joyeria-cuarzo-turquesa", file: "piedras-naturales-chile.jpg" },
  { slug: "como-vender-joyeria-artesanal-online-chile", file: "vender-joyeria-online.jpg" },
  { slug: "joyas-con-significado-simbolismo-joyeria-artesanal", file: "joyas-significado.jpg" },
  { slug: "guia-regalar-joyeria-artesanal-mujer-chile", file: "regalar-joyeria-artesanal.jpg" },
  { slug: "lapislazuli-piedra-nacional-chile-joyas", file: "lapislazuli-chile.jpg" },
  { slug: "joyeria-sustentable-slow-fashion-chile", file: "joyeria-sustentable-chile.jpg" },
  { slug: "anillo-compromiso-artesanal-hecho-a-mano-chile", file: "anillo-compromiso-artesanal.jpg" },
  { slug: "guia-elegir-cuidar-joyas-artesanales-plata", file: "guia-plata-artesanal.jpg" },
];

async function main() {
  const { uploadToR2 } = await import("../lib/r2");
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL no está definido");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const blogDir = path.join(process.cwd(), "public", "blog");

  try {
    for (const { slug, file } of BLOG_IMAGE_MAP) {
      const filePath = path.join(blogDir, file);
      if (!existsSync(filePath)) {
        console.error(`❌ No existe el archivo: ${filePath}`);
        process.exit(1);
      }

      const key = `blog/${file}`;
      const buf = readFileSync(filePath);
      const url = await uploadToR2(buf, key, "image/jpeg");
      console.log(`  ✅ R2: ${key} → ${url}`);

      await prisma.blogPost.update({
        where: { slug },
        data: { coverImage: url },
      });
      console.log(`  ✅ DB: ${slug} → coverImage actualizado`);
    }

    console.log("\n✅ Todas las imágenes subidas a R2 y DB actualizada");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
