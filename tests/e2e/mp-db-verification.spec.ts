/**
 * Test de verificación de base de datos post-pago
 *
 * Verifica directamente en la DB que los datos se guardaron
 * correctamente después de un pago exitoso.
 *
 * Ejecutar DESPUÉS del test de pago exitoso (mp-payment-success).
 */
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

test.describe('MP DB Verification', () => {

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Orden pagada tiene datos correctos', async () => {
    // Buscar la orden más reciente del comprador de test
    const buyerUser = await prisma.user.findUnique({
      where: { email: 'carlos.irigoyen@gard.cl' },
    });

    expect(buyerUser).not.toBeNull();

    const order = await prisma.order.findFirst({
      where: {
        userId: buyerUser!.id,
        status: 'PAID',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true, artisan: true },
        },
      },
    });

    expect(order).not.toBeNull();
    console.log('📋 Orden encontrada:', order!.orderNumber);

    // Status
    expect(order!.status).toBe('PAID');
    console.log('  ✅ Status: PAID');

    // MP Payment ID
    expect(order!.mpPaymentId).not.toBeNull();
    expect(order!.mpPaymentId!.length).toBeGreaterThan(0);
    console.log('  ✅ mpPaymentId:', order!.mpPaymentId);

    // Shipping
    expect(order!.shippingName).toBeTruthy();
    expect(order!.shippingAddress).toBeTruthy();
    console.log('  ✅ Shipping:', order!.shippingName, '-', order!.shippingCity);

    // Items
    expect(order!.items.length).toBeGreaterThan(0);
    const item = order!.items[0];

    // Precio del producto
    expect(item.productPrice).toBe(50000);
    console.log('  ✅ productPrice: $' + item.productPrice);

    // Comisión (18% de $50.000 = $9.000)
    expect(item.commissionRate).toBe(0.18);
    console.log('  ✅ commissionRate:', item.commissionRate);

    expect(item.commissionAmount).toBe(9000);
    console.log('  ✅ commissionAmount: $' + item.commissionAmount);

    // Artisan payout ($50.000 - $9.000 = $41.000)
    expect(item.artisanPayout).toBe(41000);
    console.log('  ✅ artisanPayout: $' + item.artisanPayout);

    // mpTransactionId
    expect(item.mpTransactionId).not.toBeNull();
    console.log('  ✅ mpTransactionId:', item.mpTransactionId);

    // Total
    expect(order!.total).toBeGreaterThanOrEqual(50000);
    console.log('  ✅ Total: $' + order!.total);

    console.log('\n✅ Todas las verificaciones de DB pasaron');
  });

  test('Stock se decrementó correctamente', async () => {
    const product = await prisma.product.findUnique({
      where: { slug: 'anillo-prueba-e2e' },
    });

    expect(product).not.toBeNull();
    // El stock debería ser 4 (era 5, se vendió 1)
    expect(product!.stock).toBe(4);
    console.log('✅ Stock decrementado correctamente:', product!.stock);
  });

  test('Artesano tiene OAuth vinculado (skip si no conectado)', async () => {
    const artisan = await prisma.artisan.findFirst({
      where: {
        user: { email: 'carlos.irigoyen@me.com' },
      },
    });

    expect(artisan).not.toBeNull();

    if (!artisan!.mpAccessToken) {
      console.log('⏭️  Artesano sin OAuth (no conectado aún — normal en localhost)');
      return;
    }

    expect(artisan!.mpRefreshToken).not.toBeNull();
    expect(artisan!.mpUserId).not.toBeNull();
    expect(artisan!.mpOnboarded).toBe(true);

    console.log('✅ Artesano OAuth vinculado');
    console.log('  mpUserId:', artisan!.mpUserId);
    console.log('  mpOnboarded:', artisan!.mpOnboarded);

    if (artisan!.mpTokenExpiresAt) {
      const daysUntilExpiry = Math.round(
        (artisan!.mpTokenExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      console.log('  Token expira en:', daysUntilExpiry, 'días');
    }
  });
});
