/**
 * Script: Generate Pioneer Promo Codes
 *
 * Creates promotional codes for the PIONEROS_2026 campaign.
 * Each orfebre gets a unique code granting 3 months of Plan Maestro free.
 *
 * Usage:
 *   npx tsx prisma/scripts/generate-pioneer-codes.ts
 *
 * Output:
 *   - Codes created in DB
 *   - CSV file: prisma/scripts/pioneer-codes.csv
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "fs";
import { resolve } from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Apollo prospect list ──
const apolloOrfebres = [
  { name: "Jimmy Contreras", email: "", title: "Master Goldsmith" },
  { name: "Camila Francke Barria", email: "", title: "Effy Jeweler" },
  { name: "Elizabeth Noguera Saa", email: "", title: "Orfebre" },
  { name: "Francisca Domeyko", email: "", title: "Orfebre" },
  { name: "Patricio Vivanco", email: "", title: "Orfebre" },
  { name: "Trinidad Hidalgo Barros", email: "", title: "Orfebre" },
  { name: "Adolfo Esdras", email: "", title: "Artesano Orfebre" },
  { name: "Maira Barraza Lara", email: "", title: "Orfebre" },
  { name: "Daisy Di Genova", email: "", title: "Orfebre" },
  { name: "Fabian Fuentes", email: "", title: "Joyero" },
  { name: "Silvia Salgado Pasten", email: "", title: "Joyera" },
  { name: "Antonia Arriagada Monreal", email: "", title: "Licenciada en Artes Visuales, Orfebre" },
  { name: "Manuel Hormazabal", email: "", title: "Joyero" },
  // Add remaining orfebres here before running
];

function normalizeForCode(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function generateCode(name: string, existingCodes: Set<string>): string {
  const parts = name.trim().split(/\s+/);
  const firstName = normalizeForCode(parts[0]);
  let code = `PIONERO-${firstName}-2026`;

  if (existingCodes.has(code)) {
    // Add first letter of last name to disambiguate
    const lastInitial = parts.length > 1 ? normalizeForCode(parts[parts.length - 1]).charAt(0) : "X";
    code = `PIONERO-${firstName}-${lastInitial}-2026`;
  }

  // If still collides, add random suffix
  if (existingCodes.has(code)) {
    code = `PIONERO-${firstName}-${Math.random().toString(36).substring(2, 5).toUpperCase()}-2026`;
  }

  return code;
}

async function main() {
  console.log("Generating Pioneer codes...\n");

  const expiresAt = new Date("2026-06-30T23:59:59Z");
  const existingCodes = new Set<string>();
  const csvRows: string[] = ["nombre,email,titulo,codigo,url"];
  const baseUrl = "https://casaorfebre.cl";

  let created = 0;
  let skipped = 0;

  for (const orfebre of apolloOrfebres) {
    const code = generateCode(orfebre.name, existingCodes);
    existingCodes.add(code);

    // Check if code already exists in DB
    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      console.log(`  SKIP: ${code} (already exists)`);
      skipped++;
      csvRows.push(
        `"${orfebre.name}","${orfebre.email}","${orfebre.title}","${code}","${baseUrl}/postular?code=${code}"`
      );
      continue;
    }

    await prisma.promoCode.create({
      data: {
        code,
        type: "FREE_TRIAL",
        planName: "maestro",
        durationDays: 90,
        maxUses: 1,
        expiresAt,
        isActive: true,
        campaign: "PIONEROS_2026",
        metadata: {
          name: orfebre.name,
          email: orfebre.email,
          title: orfebre.title,
        },
      },
    });

    const url = `${baseUrl}/postular?code=${code}`;
    csvRows.push(
      `"${orfebre.name}","${orfebre.email}","${orfebre.title}","${code}","${url}"`
    );
    console.log(`  OK: ${code} → ${orfebre.name}`);
    created++;
  }

  // Write CSV
  const csvPath = resolve(__dirname, "pioneer-codes.csv");
  writeFileSync(csvPath, csvRows.join("\n"), "utf-8");

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  console.log(`CSV exported to: ${csvPath}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
