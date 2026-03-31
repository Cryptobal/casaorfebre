/**
 * Seed de datos de prueba para E2E tests de Mercado Pago
 *
 * Ejecutar con: npx tsx tests/e2e/seed-test-data.ts
 *
 * Crea:
 * 1. Usuario admin (carlos.irigoyen@gmail.com)
 * 2. Usuario artesano (carlos.irigoyen@me.com) con perfil aprobado
 * 3. Usuario comprador (carlos.irigoyen@gard.cl) con password para login
 * 4. Producto de prueba ($50.000 CLP, stock 5)
 *
 * IMPORTANTE: No borra datos existentes, usa upsert.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TEST_PASSWORD = 'TestE2E2024!';

async function seed() {
  console.log('🌱 Seeding test data for MP E2E tests...\n');

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  // 1. Usuario Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'carlos.irigoyen@gmail.com' },
    update: { role: 'ADMIN', hashedPassword },
    create: {
      email: 'carlos.irigoyen@gmail.com',
      name: 'Carlos Admin',
      role: 'ADMIN',
      hashedPassword,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Admin:', adminUser.email);

  // 2. Usuario Artesano + Perfil Artisan
  const artisanUser = await prisma.user.upsert({
    where: { email: 'carlos.irigoyen@me.com' },
    update: { role: 'ARTISAN', hashedPassword },
    create: {
      email: 'carlos.irigoyen@me.com',
      name: 'Artesano Test',
      role: 'ARTISAN',
      hashedPassword,
      emailVerified: new Date(),
    },
  });

  const artisan = await prisma.artisan.upsert({
    where: { userId: artisanUser.id },
    update: {
      status: 'APPROVED',
      commissionRate: 0.18,
    },
    create: {
      userId: artisanUser.id,
      displayName: 'Orfebrería Test',
      slug: 'orfebreria-test',
      bio: 'Artesano de prueba para E2E testing de Mercado Pago.',
      location: 'Santiago, Chile',
      specialty: 'Anillos',
      materials: ['Plata 950', 'Oro 18k'],
      status: 'APPROVED',
      commissionRate: 0.18,
      approvedAt: new Date(),
    },
  });
  console.log('✅ Artesano:', artisanUser.email, '| Status:', artisan.status);

  // 3. Usuario Comprador
  const buyerUser = await prisma.user.upsert({
    where: { email: 'carlos.irigoyen@gard.cl' },
    update: { role: 'BUYER', hashedPassword, emailVerified: new Date() },
    create: {
      email: 'carlos.irigoyen@gard.cl',
      name: 'Comprador Test',
      role: 'BUYER',
      hashedPassword,
      emailVerified: new Date(),
      shippingName: 'Comprador Test',
      shippingAddress: 'Av. Providencia 1234, Depto 5B',
      shippingCity: 'Providencia',
      shippingRegion: 'Región Metropolitana',
      shippingPostalCode: '7500000',
      shippingPhone: '+56912345678',
    },
  });
  console.log('✅ Comprador:', buyerUser.email);

  // 4. Producto de prueba
  const product = await prisma.product.upsert({
    where: { slug: 'anillo-prueba-e2e' },
    update: {
      price: 50000,
      stock: 5,
      status: 'APPROVED',
    },
    create: {
      name: 'Anillo de Prueba E2E',
      slug: 'anillo-prueba-e2e',
      description: 'Producto de prueba para testing E2E de Mercado Pago. No es un producto real.',
      price: 50000,
      stock: 5,
      status: 'APPROVED',
      materials: {
        connectOrCreate: [
          { where: { name: "Plata 950" }, create: { name: "Plata 950", position: 0 } },
        ],
      },
      productionType: "LIMITED" as const,
      categories: { connect: [{ slug: "anillo" }] },
      artisanId: artisan.id,
      publishedAt: new Date(),
    },
  });

  // Crear imagen de producto (requerida para mostrar en catálogo)
  await prisma.productImage.upsert({
    where: { id: `img-e2e-${product.id}` },
    update: {},
    create: {
      id: `img-e2e-${product.id}`,
      productId: product.id,
      url: '/placeholder-ring.jpg',
      altText: 'Anillo de prueba E2E',
      position: 0,
      status: 'APPROVED',
    },
  });

  console.log('✅ Producto:', product.name, '| Precio: $' + product.price, '| Stock:', product.stock);

  console.log('\n🎉 Seed completado. Datos listos para E2E testing.');
  console.log('\n📋 Resumen:');
  console.log('   Admin:     carlos.irigoyen@gmail.com');
  console.log('   Artesano:  carlos.irigoyen@me.com (APPROVED, 18% comisión)');
  console.log('   Comprador: carlos.irigoyen@gard.cl');
  console.log('   Producto:  Anillo de Prueba E2E ($50.000 CLP, stock 5)');
  console.log(`   Password:  ${TEST_PASSWORD} (para todos los usuarios)`);
  console.log('\n⚠️  IMPORTANTE: Aún debes conectar MP OAuth del artesano (Test 1).');

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('❌ Error en seed:', e);
  prisma.$disconnect();
  process.exit(1);
});
