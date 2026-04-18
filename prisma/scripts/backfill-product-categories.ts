/**
 * Backfill de categorías en productos existentes.
 *
 * Contexto
 * --------
 * Los productos se filtran por `categories` (many-to-many contra Category).
 * Si un producto no tiene ninguna Category conectada, no aparece en las
 * páginas de categoría (/coleccion?category=anillo, /coleccion/anillos, etc.).
 *
 * Este script infiere la categoría desde el nombre del producto (keywords
 * más frecuentes) y conecta la Category correspondiente si no está ya.
 *
 * Seguro / idempotente: sólo agrega Categories faltantes. Si el producto ya
 * tiene alguna Category conectada, NO se modifica.
 *
 * Uso
 * ---
 *   # Diagnóstico (no escribe nada):
 *   DRY_RUN=1 npx tsx prisma/scripts/backfill-product-categories.ts
 *
 *   # Aplicar cambios:
 *   npx tsx prisma/scripts/backfill-product-categories.ts
 */
import { prisma } from "../../lib/prisma";

const DRY_RUN = process.env.DRY_RUN === "1";

// Keyword → slug de Category (según seed-catalog.ts).
// Orden importa: primero las más específicas.
const NAME_TO_SLUG: { pattern: RegExp; slug: string }[] = [
  { pattern: /\btobillera/i, slug: "tobillera" },
  { pattern: /\bdiadema|\btiara/i, slug: "diadema-tiara" },
  { pattern: /\bgemelo/i, slug: "gemelos" },
  { pattern: /\bbroch/i, slug: "broche" },
  { pattern: /\bcadena/i, slug: "cadena" },
  { pattern: /\bcolgante|\bdije/i, slug: "colgante" },
  { pattern: /\bpulsera|\bbrazalete/i, slug: "pulsera" },
  { pattern: /\bcollar|\bgargantill/i, slug: "collar" },
  { pattern: /\baros?\b/i, slug: "aros" },
  { pattern: /\baretes?\b/i, slug: "aros" },
  { pattern: /\bpendiente/i, slug: "aros" },
  { pattern: /\banillo|\bsortija|\balian[zs]a|\bargoll/i, slug: "anillo" },
];

function inferSlug(name: string): string | null {
  for (const rule of NAME_TO_SLUG) {
    if (rule.pattern.test(name)) return rule.slug;
  }
  return null;
}

async function main() {
  // Mapa slug → id de Category
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, name: true },
  });
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  console.log(`Categorías disponibles en DB: ${categories.map((c) => c.slug).join(", ")}`);

  // Productos sin categorías
  const productsWithoutCategories = await prisma.product.findMany({
    where: { categories: { none: {} } },
    select: { id: true, name: true, slug: true, status: true },
  });

  console.log(
    `\nProductos sin categorías: ${productsWithoutCategories.length}`,
  );

  const toBackfill: { id: string; name: string; slug: string; categorySlug: string }[] = [];
  const unmatched: { id: string; name: string; slug: string }[] = [];

  for (const p of productsWithoutCategories) {
    const inferred = inferSlug(p.name);
    if (inferred && bySlug.has(inferred)) {
      toBackfill.push({ ...p, categorySlug: inferred });
    } else {
      unmatched.push(p);
    }
  }

  // Resumen por categoría
  const countsBySlug = toBackfill.reduce<Record<string, number>>((acc, p) => {
    acc[p.categorySlug] = (acc[p.categorySlug] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nInferencia por nombre:");
  for (const [slug, count] of Object.entries(countsBySlug)) {
    console.log(`  ${slug}: ${count}`);
  }

  if (unmatched.length > 0) {
    console.log(`\nNo se pudo inferir (${unmatched.length}):`);
    for (const p of unmatched.slice(0, 20)) {
      console.log(`  - ${p.name} (${p.slug})`);
    }
    if (unmatched.length > 20) {
      console.log(`  … y ${unmatched.length - 20} más`);
    }
  }

  if (DRY_RUN) {
    console.log("\n[DRY_RUN=1] Nada se escribió. Para aplicar:");
    console.log("  npx tsx prisma/scripts/backfill-product-categories.ts");
    return;
  }

  if (toBackfill.length === 0) {
    console.log("\nNada que hacer. ✓");
    return;
  }

  console.log(`\nAplicando ${toBackfill.length} conexiones…`);
  let done = 0;
  for (const p of toBackfill) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        categories: { connect: [{ slug: p.categorySlug }] },
      },
    });
    done++;
    if (done % 25 === 0) console.log(`  ${done}/${toBackfill.length}`);
  }
  console.log(`  ${done}/${toBackfill.length} ✓`);
  console.log("\nListo. Refrescá /coleccion/anillos y compañía.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
