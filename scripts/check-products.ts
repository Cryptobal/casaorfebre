import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    select: { name: true, status: true, images: { select: { status: true } }, price: true }
  });

  console.log('--- TODOS LOS PRODUCTOS ---');
  products.forEach((p: any) => {
    const imgStatuses = p.images.map((i: any) => i.status).join(',') || 'sin imgs';
    console.log(String(p.status).padEnd(12), '| precio:', p.price, '| imgs:', imgStatuses, '|', p.name);
  });
  console.log('\nTOTAL:', products.length);

  const approved = products.filter((p: any) => p.status === 'APPROVED');
  const withApprovedImg = products.filter((p: any) => (p.images as any[]).some((i: any) => i.status === 'APPROVED'));
  const withPrice = products.filter((p: any) => p.price > 0);

  console.log('\nStatus APPROVED:', approved.length);
  console.log('Con imagen APPROVED:', withApprovedImg.length);
  console.log('Con precio > 0:', withPrice.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
