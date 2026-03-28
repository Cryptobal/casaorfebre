/**
 * Procesa PNG de Midjourney → JPG optimizado para el blog.
 * Resize 1400px ancho, JPEG progresivo mozjpeg, objetivo <120KB (ideal <80KB).
 */
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_DIR =
  process.env.BLOG_IMAGE_SOURCE_DIR ||
  "/Users/caco/Library/CloudStorage/GoogleDrive-carlos.irigoyen@gmail.com/Mi unidad/Casa Orfebre/Imagenes";

const MAX_WIDTH = 1400;
const MAX_BYTES = 120 * 1024;
const IDEAL_BYTES = 80 * 1024;
const MIN_QUALITY = 45;
const QUALITY_STEP = 5;

const IMAGE_MAP = [
  {
    source: "Manos artisanas moldeando plata.png",
    dest: "joyeria-autor-chile.jpg",
  },
  {
    source:
      "kco_alien_Flat_lay_arrangement_of_polished_natural_gemstones__66bcd735-f6f5-482a-8b9a-5fa7965e9cb9_0.png",
    dest: "piedras-naturales-chile.jpg",
  },
  {
    source:
      "kco_alien_Small_jewelry_pieces_elegantly_arranged_next_to_an__d2d0c608-5132-44b6-a5f3-d59bb86eae07_0.png",
    dest: "vender-joyeria-online.jpg",
  },
  {
    source:
      "kco_alien_Close-up_of_a_handcrafted_silver_pendant_with_spira_5fef9725-c26b-4b29-821b-2da3d605c911_1.png",
    dest: "joyas-significado.jpg",
  },
  {
    source: "Caja de regalo de joyería elegante.png",
    dest: "regalar-joyeria-artesanal.jpg",
  },
  {
    source:
      "kco_alien_Close-up_of_a_polished_lapis_lazuli_cabochon_with_g_2cc86528-1c9e-4b1d-a4b6-57ae8405ea28_2.png",
    dest: "lapislazuli-chile.jpg",
  },
  {
    source:
      "kco_alien_Silver_leaf-shaped_earrings_on_a_bed_of_fresh_moss__e7e6fac6-36e4-4fa4-89d0-cb70eb83c48a_3.png",
    dest: "joyeria-sustentable-chile.jpg",
  },
  {
    source:
      "kco_alien_Single_hammered_gold_engagement_ring_on_dark_stone__634ee212-2028-4abe-895c-13a2aad0d5e5_0.png",
    dest: "anillo-compromiso-artesanal.jpg",
  },
  {
    source:
      "kco_alien_Close-up_of_a_polished_sterling_silver_artisan_ring_0104e64e-a11e-40ba-adb5-c4a285fa5a47_3.png",
    dest: "guia-plata-artesanal.jpg",
  },
];

async function encodeJpeg(inputPath, width, quality) {
  const buf = await sharp(inputPath)
    .resize(width, null, { withoutEnlargement: true })
    .jpeg({
      quality,
      progressive: true,
      mozjpeg: true,
    })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, size: buf.length, width: meta.width, height: meta.height };
}

/**
 * Baja calidad hasta ≤ MAX_BYTES; si sigue grande, reduce ancho.
 */
async function processOne(inputPath, outputPath) {
  let width = MAX_WIDTH;
  let quality = 85;
  let best = await encodeJpeg(inputPath, width, quality);

  while (best.size > MAX_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    best = await encodeJpeg(inputPath, width, quality);
  }

  // Objetivo suave: bajar calidad mientras quepa en MAX_BYTES y siga por encima de IDEAL_BYTES
  while (
    best.size > IDEAL_BYTES &&
    best.size <= MAX_BYTES &&
    quality > MIN_QUALITY
  ) {
    const nextQ = quality - QUALITY_STEP;
    const trial = await encodeJpeg(inputPath, width, nextQ);
    if (trial.size > MAX_BYTES) break;
    quality = nextQ;
    best = trial;
  }

  while (best.size > MAX_BYTES && width > 960) {
    width -= 80;
    quality = Math.min(quality + 5, 85);
    best = await encodeJpeg(inputPath, width, quality);
    while (best.size > MAX_BYTES && quality > MIN_QUALITY) {
      quality -= QUALITY_STEP;
      best = await encodeJpeg(inputPath, width, quality);
    }
  }

  // Si aún pesa >80KB con calidad ya al mínimo, bajar ancho hasta acercarse al ideal
  while (best.size > IDEAL_BYTES && width > 1000) {
    width -= 80;
    quality = 75;
    let trial = await encodeJpeg(inputPath, width, quality);
    while (trial.size > MAX_BYTES && quality > MIN_QUALITY) {
      quality -= QUALITY_STEP;
      trial = await encodeJpeg(inputPath, width, quality);
    }
    while (
      trial.size > IDEAL_BYTES &&
      trial.size <= MAX_BYTES &&
      quality > MIN_QUALITY
    ) {
      const nextQ = quality - QUALITY_STEP;
      const t2 = await encodeJpeg(inputPath, width, nextQ);
      if (t2.size > MAX_BYTES) break;
      quality = nextQ;
      trial = t2;
    }
    if (trial.size < best.size) best = trial;
    else break;
  }

  await fs.writeFile(outputPath, best.buf);

  const idealNote =
    best.size <= IDEAL_BYTES ? " ✓" : best.size <= MAX_BYTES ? " (objetivo <80KB no alcanzado)" : " ⚠ >120KB";

  return {
    width: best.width,
    height: best.height,
    size: best.size,
    quality,
    idealNote,
  };
}

async function processImages() {
  const outputDir = path.resolve(__dirname, "..", "public", "blog");
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`\nProcesando ${IMAGE_MAP.length} imágenes...\n`);
  console.log(`Fuente: ${SOURCE_DIR}`);
  console.log(`Destino: ${outputDir}\n`);

  let totalSize = 0;
  let success = 0;

  for (const { source, dest } of IMAGE_MAP) {
    const inputPath = path.join(SOURCE_DIR, source);
    const outputPath = path.join(outputDir, dest);

    try {
      await fs.access(inputPath);
    } catch {
      console.error(`  ✗ ${dest}: no existe la fuente: ${source}`);
      continue;
    }

    try {
      const info = await processOne(inputPath, outputPath);
      totalSize += info.size;
      success++;
      const sizeKB = Math.round(info.size / 1024);
      console.log(
        `  ✓ ${dest} (${info.width}×${info.height}, ${sizeKB}KB, q≈${info.quality})${info.idealNote}`,
      );
    } catch (err) {
      console.error(`  ✗ ${dest}: ${err.message}`);
    }
  }

  console.log(`\n✅ ${success}/${IMAGE_MAP.length} procesadas`);
  console.log(`📦 Peso total: ${Math.round(totalSize / 1024)}KB\n`);
}

processImages().catch((e) => {
  console.error(e);
  process.exit(1);
});
