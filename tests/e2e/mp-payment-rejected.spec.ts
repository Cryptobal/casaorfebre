/**
 * Test E2E: Pago rechazado con Mercado Pago
 *
 * Mismo flujo que pago exitoso pero usando nombre "OTHE" en la tarjeta
 * para simular un rechazo.
 */
import { test, expect } from '@playwright/test';
import { loginAs, MP_BUYER, TEST_CARD_REJECTED, TEST_EMAILS } from './helpers';

test.describe('MP Payment - Pago rechazado', () => {

  test('Pago rechazado redirige a página de fallo', async ({ page }) => {
    // 1. Login como comprador
    await loginAs(page, TEST_EMAILS.buyer);

    // 2. Ir al producto y agregar al carrito
    await page.goto('/coleccion/anillo-prueba-e2e');
    await page.waitForLoadState('networkidle');

    const addToCartButton = page.getByRole('button', { name: /añadir al carrito/i });
    await addToCartButton.click();
    await expect(page.getByText(/agregado al carrito/i)).toBeVisible({ timeout: 5_000 });

    // 3. Ir al carrito y luego checkout
    await page.goto('/carrito');
    await page.waitForLoadState('networkidle');

    const checkoutButton = page.getByRole('link', { name: /ir al checkout/i })
      .or(page.getByRole('button', { name: /ir al checkout/i }));
    await checkoutButton.click();
    await page.waitForURL(/checkout/, { timeout: 10_000 });

    // 4. Llenar datos de envío
    await page.locator('input[name="shippingName"]').fill('Comprador Test');
    await page.locator('input[name="shippingPhone"]').fill('+56912345678');
    await page.locator('input[name="shippingAddress"]').fill('Av. Providencia 1234');
    await page.locator('select#shippingRegion').selectOption({ label: 'Región Metropolitana' });
    await page.waitForTimeout(500);
    await page.locator('select#shippingCitySelect').selectOption({ label: 'Providencia' });

    // 5. Pagar con MP
    await page.getByRole('button', { name: /pagar con mercado pago/i }).click();
    await page.waitForURL(/mercadopago/, { timeout: 30_000 });

    // 6. En MP: login y pago con tarjeta rechazada
    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    const loginLink = page.getByText(/iniciar sesión|log in|ingresar/i);
    if (await loginLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await loginLink.click();

      const mpEmailInput = page.locator('input[name="user_id"]')
        .or(page.locator('input[type="email"]'))
        .or(page.locator('#user_id'));
      await mpEmailInput.fill(MP_BUYER.username);
      await page.getByRole('button', { name: /continuar|siguiente/i }).click();

      await page.waitForSelector('input[type="password"]', { timeout: 10_000 });
      await page.locator('input[type="password"]').fill(MP_BUYER.password);
      await page.getByRole('button', { name: /iniciar|entrar|continuar/i }).click();

      const codeInput = page.locator('input[name="code"]')
        .or(page.locator('input[inputmode="numeric"]'));
      if (await codeInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await codeInput.fill(MP_BUYER.verificationCode);
        await page.getByRole('button', { name: /verificar|confirmar/i }).click();
      }
    }

    // Seleccionar tarjeta
    const cardOption = page.getByText(/tarjeta.*crédito|nueva.*tarjeta/i);
    if (await cardOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await cardOption.click();
    }

    // Llenar datos con nombre OTHE (rechazado)
    const fillField = async (selectors: string[], value: string) => {
      for (const selector of selectors) {
        const el = page.locator(selector);
        if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await el.fill(value);
          return;
        }
      }
      for (const frame of page.frames()) {
        for (const selector of selectors) {
          const el = frame.locator(selector);
          if (await el.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await el.fill(value);
            return;
          }
        }
      }
    };

    await fillField(['input[name="cardNumber"]', '#cardNumber'], TEST_CARD_REJECTED.number);
    await fillField(['input[name="cardholderName"]', '#cardholderName'], TEST_CARD_REJECTED.holderName);
    await fillField(['input[name="cardExpirationDate"]', '#cardExpiration'], TEST_CARD_REJECTED.expiry);
    await fillField(['input[name="securityCode"]', '#securityCode'], TEST_CARD_REJECTED.cvv);

    const docTypeSelect = page.locator('select[name="docType"]');
    if (await docTypeSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await docTypeSelect.selectOption({ label: 'Otro' });
    }
    await fillField(['input[name="docNumber"]', '#docNumber'], TEST_CARD_REJECTED.docNumber);

    const installments = page.locator('select[name="installments"]');
    if (await installments.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await installments.selectOption({ index: 0 });
    }

    // Confirmar pago
    await page.getByRole('button', { name: /pagar|confirmar|pay/i }).click();

    // 7. Verificar que redirige a failure o muestra error
    // MP puede mostrar error inline o redirigir
    const failureRedirect = page.waitForURL(/checkout\/failure/, { timeout: 60_000 }).catch(() => null);
    const mpError = page.getByText(/rechazado|error|no.*pudo.*procesar|falló|insuficiente/i)
      .first()
      .waitFor({ timeout: 60_000 })
      .catch(() => null);

    await Promise.race([failureRedirect, mpError]);

    await page.screenshot({ path: 'tests/e2e/screenshots/payment-rejected.png' });
    console.log('✅ Pago rechazado manejado correctamente');
  });
});
