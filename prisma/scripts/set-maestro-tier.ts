/**
 * Marca a orfebres específicos como MAESTRO.
 * Uso: npx tsx prisma/scripts/set-maestro-tier.ts
 */
import { prisma } from "../../lib/prisma";

const MAESTRO_SLUGS_OR_NAMES = [
  "camila-torres-puga",
  "pamela-rodriguez-zbinden",
  "Camila Torres Puga",
  "Pamela Rodríguez Zbinden",
];

async function main() {
  const result = await prisma.artisan.updateMany({
    where: {
      OR: [
        { slug: { in: MAESTRO_SLUGS_OR_NAMES } },
        { displayName: { in: MAESTRO_SLUGS_OR_NAMES } },
      ],
    },
    data: { tier: "MAESTRO" },
  });
  console.log(`Marcadas ${result.count} orfebres como MAESTRO.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
