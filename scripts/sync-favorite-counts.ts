import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  let updated = 0;

  for (const product of products) {
    const count = await prisma.favorite.count({
      where: { productId: product.id },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { favoriteCount: count },
    });

    if (count > 0) {
      console.log(`  ${product.name}: ${count} favoritos`);
      updated++;
    }
  }

  console.log(`\nSincronizados ${updated} productos con favoritos (de ${products.length} totales).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
