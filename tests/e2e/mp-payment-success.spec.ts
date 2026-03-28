/**
 * Test E2E: Pago exitoso con Mercado Pago Checkout Pro + Split
 *
 * Prerequisito:
 * - Seed ejecutado (npm run test:seed)
 * - Artesano con OAuth vinculado (Test 1 pasó)
 *
 * Flujo:
 * 1. Login como comprador
 * 2. Navegar al producto de prueba
 * 3. Agregar al carrito
 * 4. Ir a checkout, llenar datos de envío
 * 5. Pagar con MP (cuenta test comprador)
 * 6. Verificar página de éxito
 */
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loginAs, MP_BUYER, TEST_CARD, TEST_EMAILS } from './helpers';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

test.describe('MP Payment - Pago exitoso', () => {

  test('Compra completa con split de pagos', async ({ page }) => {
    // 1. Login como comprador
    await loginAs(page, TEST_EMAILS.buyer);

    // 2. Clear cart via DB (from previous test runs)
    const buyer = await prisma.user.findUnique({ where: { email: TEST_EMAILS.buyer } });
    if (buyer) {
      await prisma.cartItem.deleteMany({ where: { userId: buyer.id } });
      console.log('🧹 Cart cleared via DB');
    }

    // 3. Navigate to test product
    await page.goto('/coleccion/anillo-prueba-e2e');
    await page.waitForLoadState('networkidle');

    // 4. Verify product page loaded
    await expect(page.getByRole('heading', { name: /anillo.*prueba/i })).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-01-product.png' });

    // 5. Add to cart
    const addToCartButton = page.getByRole('button', { name: /añadir al carrito/i });
    await addToCartButton.click();
    // Wait for the cart to update (toast or redirect)
    await page.waitForTimeout(2_000);

    // 6. Go to cart
    await page.goto('/carrito');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-02-cart.png' });

    // 6. Ir al checkout
    const checkoutButton = page.getByRole('main').getByRole('link', { name: /ir al checkout/i }).first();
    await checkoutButton.click();

    await page.waitForURL(/checkout/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // 7. Llenar formulario de checkout
    // User may have pre-filled data from profile. Fill only if empty.
    const nameInput = page.locator('input[name="shippingName"]');
    if (await nameInput.inputValue() === '') {
      await nameInput.fill('Comprador Test');
    }

    const addressInput = page.locator('input[name="shippingAddress"]');
    if (await addressInput.inputValue() === '') {
      await addressInput.fill('Av. Providencia 1234, Depto 5B');
    }

    // Region (select) — value is "Metropolitana de Santiago"
    const regionSelect = page.locator('select#shippingRegion');
    const regionValue = await regionSelect.inputValue();
    if (!regionValue) {
      await regionSelect.selectOption('Metropolitana de Santiago');
      await page.waitForTimeout(500);
    }

    // Comuna (select)
    const citySelect = page.locator('select#shippingCitySelect');
    const cityValue = await citySelect.inputValue();
    if (!cityValue) {
      await citySelect.selectOption('Providencia');
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/payment-03-checkout-form.png' });

    // 8. Click en "Pagar con Mercado Pago"
    const payButton = page.getByRole('button', { name: /pagar con mercado pago/i });
    await payButton.click();

    // 9. Esperar redirección a Mercado Pago
    await page.waitForURL(/mercadopago/, { timeout: 30_000 });
    console.log('📍 Redirigido a MP Checkout:', page.url());
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-04-mp-checkout.png' });

    // 10. Wait for MP checkout page to render
    await page.waitForTimeout(3_000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-04-mp-checkout.png' });

    // 11. Select "Tarjeta" option (pay without MP account)
    const tarjetaOption = page.getByText(/tarjeta/i).first();
    await tarjetaOption.waitFor({ timeout: 15_000 });
    await tarjetaOption.click();
    await page.waitForTimeout(2_000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-05-mp-card-option.png' });

    // 12. Fill card details — MP uses iframes for card fields
    const fillField = async (selectors: string[], value: string, name: string) => {
      // Try main page first
      for (const sel of selectors) {
        const el = page.locator(sel);
        if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await el.fill(value);
          console.log(`  ✅ ${name}: filled (main)`);
          return;
        }
      }
      // Try iframes
      for (const frame of page.frames()) {
        for (const sel of selectors) {
          const el = frame.locator(sel);
          if (await el.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await el.fill(value);
            console.log(`  ✅ ${name}: filled (iframe)`);
            return;
          }
        }
      }
      console.warn(`  ⚠️ ${name}: not found`);
    };

    await fillField(
      ['input[name="cardNumber"]', '#cardNumber', 'input[data-testid="input-card-number"]'],
      TEST_CARD.number, 'Card Number'
    );
    await fillField(
      ['input[name="cardholderName"]', '#cardholderName', 'input[data-testid="input-card-holder"]'],
      TEST_CARD.holderName, 'Holder Name'
    );
    await fillField(
      ['input[name="cardExpirationDate"]', '#cardExpiration', 'input[data-testid="input-card-expiration"]',
       'input[name="expirationDate"]', 'input[placeholder*="MM"]', 'input[autocomplete="cc-exp"]'],
      TEST_CARD.expiry, 'Expiry'
    );
    await fillField(
      ['input[name="securityCode"]', '#securityCode', 'input[data-testid="input-security-code"]'],
      TEST_CARD.cvv, 'CVV'
    );

    // Document type select
    const docTypeSelect = page.locator('select[name="docType"]').or(page.locator('#docType'))
      .or(page.locator('select[name="identificationType"]'));
    if (await docTypeSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
      // Try "Otro" first, fallback to first non-empty option
      try {
        await docTypeSelect.selectOption({ label: TEST_CARD.docType });
      } catch {
        await docTypeSelect.selectOption({ index: 0 });
      }
      console.log('  ✅ Doc Type: selected');
    }
    // Document/RUT number — MP Chile uses #cardholderIdentificationNumber with RUT format
    await fillField(
      ['#cardholderIdentificationNumber', 'input[name="docNumber"]', '#docNumber',
       'input[name="identificationNumber"]', 'input[name="identification_number"]'],
      '11.111.111-1', 'Doc/RUT Number'
    );

    // Installments
    const installments = page.locator('select[name="installments"]').or(page.locator('#installments'));
    if (await installments.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await installments.selectOption({ index: 0 });
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/payment-06-mp-card-filled.png' });

    // 13. Confirm payment
    await page.waitForTimeout(2_000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-07-before-pay.png' });

    const continueButton = page.getByRole('button', { name: /continuar/i })
      .or(page.locator('button[type="submit"]'))
      .or(page.locator('[data-testid="action-button"]'));
    await continueButton.first().click({ timeout: 15_000 });

    // 14. MP shows a "Revisa tu pago" review page — click "Pagar"
    await page.waitForTimeout(3_000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-08-mp-review.png' });

    const mpPayButton = page.getByRole('button', { name: /pagar|pay/i }).first();
    await mpPayButton.click({ timeout: 15_000 });
    console.log('📍 Clicked "Pagar" on review page');

    // 15. Wait for redirect back to Casa Orfebre
    await page.waitForURL(/checkout\/(success|failure)|casaorfebre/, { timeout: 90_000 });
    const finalUrl = page.url();
    console.log('📍 URL final:', finalUrl);

    // 15. Verificar página de éxito
    expect(finalUrl).toMatch(/checkout\/success/);
    await expect(
      page.getByRole('heading', { name: /gracias.*compra/i })
    ).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: 'tests/e2e/screenshots/payment-06-success.png' });
    console.log('✅ Pago exitoso completado');
  });
});
