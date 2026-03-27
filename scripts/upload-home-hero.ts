/**
 * Sube la imagen hero de la home a R2 (Cloudflare).
 * Uso: npx tsx scripts/upload-home-hero.ts [ruta-al.jpg]
 */
import { readFileSync, existsSync } from "fs";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const DEFAULT_PATH =
  "/Users/caco/Library/CloudStorage/GoogleDrive-carlos.irigoyen@gmail.com/Mi unidad/Casa Orfebre/Imagenes/Orfebre.jpg";

const KEY = "site/home-hero-orfebre.jpg";

async function main() {
  const filePath = process.argv[2] || DEFAULT_PATH;
  if (!existsSync(filePath)) {
    console.error("No existe el archivo:", filePath);
    process.exit(1);
  }
  const { uploadToR2 } = await import("../lib/r2");
  const buf = readFileSync(filePath);
  const url = await uploadToR2(buf, KEY, "image/jpeg");
  console.log("OK:", url);
  console.log(`Añade a .env.local: NEXT_PUBLIC_HOME_HERO_IMAGE_URL=${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
