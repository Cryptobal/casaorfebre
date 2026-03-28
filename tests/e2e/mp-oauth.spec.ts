/**
 * Test E2E: Flujo OAuth de Mercado Pago para artesano
 *
 * Prerequisito: Ejecutar seed (npm run test:seed)
 *
 * Flujo:
 * 1. Login como artesano en Casa Orfebre
 * 2. Navegar al portal orfebre
 * 3. Click en "Conectar Mercado Pago"
 * 4. Login en MP con cuenta de test vendedor
 * 5. Autorizar acceso
 * 6. Verificar redirect de vuelta y banner verde
 */
import { test, expect } from '@playwright/test';
import { loginAs, MP_SELLER, TEST_EMAILS } from './helpers';

test.describe('MP OAuth - Vinculación de artesano', () => {

  test('Artesano puede vincular su cuenta de Mercado Pago', async ({ page }) => {
    // 1. Login como artesano
    await loginAs(page, TEST_EMAILS.artisan);

    // 2. Ir al portal orfebre
    await page.goto('/portal/orfebre');
    await page.waitForLoadState('networkidle');

    // 3. Verificar que el botón de conectar MP está visible
    const connectButton = page.getByRole('button', { name: /conectar mercado pago/i })
      .or(page.getByRole('link', { name: /conectar mercado pago/i }));

    await expect(connectButton).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: 'tests/e2e/screenshots/mp-oauth-01-portal.png' });

    // 4. Click en "Conectar Mercado Pago"
    await connectButton.click();

    // 5. Debería redirigir a auth.mercadopago.cl
    await page.waitForURL(/auth\.mercadopago/, { timeout: 15_000 });
    console.log('📍 Redirigido a MP OAuth:', page.url());
    await page.screenshot({ path: 'tests/e2e/screenshots/mp-oauth-02-mp-login.png' });

    // 6. Login en MP con cuenta de test vendedor
    // MP puede pedir email/usuario en distintos formatos
    const emailInput = page.locator('input[name="user_id"]')
      .or(page.locator('input[type="email"]'))
      .or(page.locator('input[name="email"]'))
      .or(page.locator('#user_id'));

    await emailInput.waitFor({ timeout: 10_000 });
    await emailInput.fill(MP_SELLER.username);
    await page.getByRole('button', { name: /continuar|siguiente|iniciar/i }).click();

    // 7. MP may show a "verification method" screen — choose "Contrasena"
    const passwordOption = page.getByText(/contraseña/i).first();
    if (await passwordOption.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await passwordOption.click();
      console.log('📍 Selected "Contrasena" verification method');
    }

    // 8. Password
    await page.waitForSelector('input[type="password"]', { timeout: 15_000 });
    await page.locator('input[type="password"]').fill(MP_SELLER.password);
    await page.screenshot({ path: 'tests/e2e/screenshots/mp-oauth-03-mp-password.png' });
    await page.getByRole('button', { name: /iniciar|entrar|continuar|ingresar/i }).click();

    // 8. Posible verificación de código
    const codeInput = page.locator('input[name="code"]')
      .or(page.locator('input[inputmode="numeric"]'));

    if (await codeInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await codeInput.fill(MP_SELLER.verificationCode);
      await page.getByRole('button', { name: /verificar|confirmar|continuar/i }).click();
    }

    // 9. Autorizar la app (si MP muestra pantalla de autorización)
    const authorizeButton = page.getByRole('button', { name: /autorizar|permitir|allow/i });
    if (await authorizeButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await authorizeButton.click();
    }

    // 10. Debería redirigir de vuelta al portal orfebre
    await page.waitForURL(/portal\/orfebre/, { timeout: 20_000 });
    await page.screenshot({ path: 'tests/e2e/screenshots/mp-oauth-04-success.png' });

    // 11. Verificar que el banner cambió a "Conectado" o hay success message
    await expect(
      page.getByText(/conectado|vinculado|mercado pago conectado/i)
    ).toBeVisible({ timeout: 10_000 });

    console.log('✅ OAuth completado exitosamente');
  });
});
