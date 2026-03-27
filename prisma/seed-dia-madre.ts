import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.occasion.upsert({
    where: { slug: "dia-de-la-madre" },
    update: { name: "Día de la Madre" },
    create: { name: "Día de la Madre", slug: "dia-de-la-madre", position: 9 },
  });
  console.log("✅ Occasion 'Día de la Madre' seeded");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
