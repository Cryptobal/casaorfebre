import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Aros", slug: "aros", position: 1 },
    { name: "Collar", slug: "collar", position: 2 },
    { name: "Anillo", slug: "anillo", position: 3 },
    { name: "Pulsera", slug: "pulsera", position: 4 },
    { name: "Broche", slug: "broche", position: 5 },
    { name: "Colgante", slug: "colgante", position: 6 },
    { name: "Otro", slug: "otro", position: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { position: cat.position },
      create: cat,
    });
  }

  console.log(`Seeded ${categories.length} categories`);

  const materials = [
    "Plata 950",
    "Plata 925",
    "Oro 18K",
    "Oro 14K",
    "Cobre",
    "Bronce",
    "Alpaca",
    "Cuarzo",
    "Lapislázuli",
    "Turquesa",
    "Ágata",
    "Amatista",
    "Ónix",
    "Perla",
    "Madreperla",
    "Resina",
    "Madera",
    "Cuero",
    "Hilo encerado",
  ];

  for (let i = 0; i < materials.length; i++) {
    const name = materials[i];
    await prisma.material.upsert({
      where: { name },
      update: { position: i + 1 },
      create: { name, position: i + 1 },
    });
  }

  console.log(`Seeded ${materials.length} materials`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
