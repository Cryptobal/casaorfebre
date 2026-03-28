/**
 * Sube las imágenes de los 10 nuevos blog posts a Cloudflare R2.
 * Uso: npx tsx scripts/upload-new-blog-images-r2.ts
 */
import { readFileSync, existsSync } from "fs";
import { config } from "dotenv";
import path from "path";

config({ path: ".env.local" });
config({ path: ".env" });

const SOURCE_DIR = "/Users/caco/Downloads/Fotos/converted";

const NEW_BLOG_IMAGES = [
  "tendencias-joyeria-2026.jpg",
  "tendencias-joyeria-2026-layering.jpg",
  "joyeria-cobre-chileno.jpg",
  "joyeria-cobre-chileno-proceso.jpg",
  "plata-950-vs-925.jpg",
  "regalos-dia-madre-2026.jpg",
  "regalos-dia-madre-2026-gift.jpg",
  "plateria-mapuche.jpg",
  "plateria-mapuche-contemporaneo.jpg",
  "reconocer-plata-autentica.jpg",
  "taller-orfebre.jpg",
  "taller-orfebre-soldadura.jpg",
  "taller-orfebre-pulido.jpg",
  "anillos-matrimonio-artesanales.jpg",
  "emprender-orfebre-chile.jpg",
  "joyas-identidad-chilena.jpg",
  "joyas-identidad-chilena-atacama.jpg",
  "joyas-identidad-chilena-patagonia.jpg",
];

async function main() {
  const { uploadToR2 } = await import("../lib/r2");

  for (const file of NEW_BLOG_IMAGES) {
    const filePath = path.join(SOURCE_DIR, file);
    if (!existsSync(filePath)) {
      console.error(`❌ No existe: ${filePath}`);
      process.exit(1);
    }

    const key = `blog/${file}`;
    const buf = readFileSync(filePath);
    const url = await uploadToR2(buf, key, "image/jpeg");
    console.log(`  ✅ ${key} → ${url}`);
  }

  console.log(`\n✅ ${NEW_BLOG_IMAGES.length} imágenes subidas a R2`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
