import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Replicar EXACTAMENTE la query del feed
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      images: { some: { status: "APPROVED" } },
    },
    include: {
      artisan: { select: { displayName: true } },
      categories: { select: { slug: true, name: true } },
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
      },
    },
  });

  console.log('Productos devueltos por query del feed:', products.length);
  products.forEach((p: any) => {
    console.log('\n---', p.name);
    console.log('  status:', p.status);
    console.log('  price:', p.price);
    console.log('  images tras filtro:', p.images.length);
    console.log('  categories:', JSON.stringify(p.categories));
  });

  // Filtro JS aplicado después
  const validProducts = products.filter((p: any) => p.images.length > 0 && p.price > 0);
  console.log('\n\nvalidProducts (tras filtro JS):', validProducts.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
