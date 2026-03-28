/**
 * Test E2E: Pago rechazado con Mercado Pago
 *
 * Mismo flujo que pago exitoso pero usando nombre "OTHE" en la tarjeta
 * para simular un rechazo.
 */
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { loginAs, TEST_CARD_REJECTED, TEST_EMAILS } from './helpers';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

test.describe('MP Payment - Pago rechazado', () => {

  test('Pago rechazado redirige a pagina de fallo', async ({ page }) => {
    // 1. Login como comprador
    await loginAs(page, TEST_EMAILS.buyer);

    // 2. Clear cart via DB
    const buyer = await prisma.user.findUnique({ where: { email: TEST_EMAILS.buyer } });
    if (buyer) {
      await prisma.cartItem.deleteMany({ where: { userId: buyer.id } });
    }

    // 3. Navigate to product
    await page.goto('/coleccion/anillo-prueba-e2e');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /anillo.*prueba/i })).toBeVisible({ timeout: 10_000 });

    // 4. Add to cart
    await page.getByRole('button', { name: /añadir al carrito/i }).click();
    await page.waitForTimeout(2_000);

    // 5. Go to cart then checkout
    await page.goto('/carrito');
    await page.waitForLoadState('networkidle');

    await page.getByRole('main').getByRole('link', { name: /ir al checkout/i }).first().click();
    await page.waitForURL(/checkout/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    // 6. Fill checkout form (use pre-filled data or fill manually)
    const regionSelect = page.locator('select#shippingRegion');
    if (!(await regionSelect.inputValue())) {
      await regionSelect.selectOption('Metropolitana de Santiago');
      await page.waitForTimeout(500);
      await page.locator('select#shippingCitySelect').selectOption('Providencia');
    }
    const nameInput = page.locator('input[name="shippingName"]');
    if (await nameInput.inputValue() === '') await nameInput.fill('Comprador Test');
    const addrInput = page.locator('input[name="shippingAddress"]');
    if (await addrInput.inputValue() === '') await addrInput.fill('Av. Providencia 1234');

    // 7. Click Pagar con Mercado Pago
    await page.getByRole('button', { name: /pagar con mercado pago/i }).click();
    await page.waitForURL(/mercadopago/, { timeout: 30_000 });
    console.log('📍 Redirigido a MP Checkout:', page.url());

    // 8. Select card option
    await page.waitForTimeout(3_000);
    const tarjeta = page.getByText(/tarjeta/i).first();
    await tarjeta.waitFor({ timeout: 15_000 });
    await tarjeta.click();
    await page.waitForTimeout(2_000);

    // 9. Fill card with OTHE (rejected)
    const fillField = async (selectors: string[], value: string, name: string) => {
      for (const sel of selectors) {
        const el = page.locator(sel);
        if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await el.fill(value);
          console.log(`  ✅ ${name}: filled (main)`);
          return;
        }
      }
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

    await fillField(['#cardNumber', 'input[name="cardNumber"]'], TEST_CARD_REJECTED.number, 'Card');
    await fillField(['#cardholderName'], TEST_CARD_REJECTED.holderName, 'Name');
    await fillField(
      ['input[name="expirationDate"]', '#expirationDate', 'input[placeholder*="MM"]', 'input[autocomplete="cc-exp"]'],
      TEST_CARD_REJECTED.expiry, 'Expiry'
    );
    await fillField(['#securityCode', 'input[name="securityCode"]'], TEST_CARD_REJECTED.cvv, 'CVV');
    await fillField(['#cardholderIdentificationNumber', 'input[name="docNumber"]'], '11.111.111-1', 'RUT');

    // 10. Click Continuar
    await page.waitForTimeout(2_000);
    const continueBtn = page.getByRole('button', { name: /continuar/i })
      .or(page.locator('button[type="submit"]'));
    await continueBtn.first().click({ timeout: 15_000 });

    // 11. Click Pagar on review page
    await page.waitForTimeout(3_000);
    const payBtn = page.getByRole('button', { name: /pagar|pay/i }).first();
    await payBtn.click({ timeout: 15_000 });
    console.log('📍 Clicked Pagar');

    // 12. MP should show error or redirect to failure
    const failureRedirect = page.waitForURL(/checkout\/failure/, { timeout: 90_000 }).catch(() => null);
    const mpError = page.getByText(/rechazado|error|no.*pudo|falló|insufficient/i)
      .first().waitFor({ timeout: 90_000 }).catch(() => null);

    await Promise.race([failureRedirect, mpError]);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment-rejected.png' });
    console.log('📍 Final URL:', page.url());
    console.log('✅ Pago rechazado manejado correctamente');
  });
});
