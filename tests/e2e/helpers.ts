/**
 * Helpers compartidos para E2E tests
 */
import { type Page } from '@playwright/test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

/**
 * Login via test auth endpoint (solo funciona en desarrollo).
 * Setea la cookie de sesión de Auth.js directamente.
 */
export async function loginAs(page: Page, email: string) {
  const response = await page.request.post(`${BASE_URL}/api/test/auth`, {
    data: { email },
  });

  if (!response.ok()) {
    const body = await response.json();
    throw new Error(`Login failed for ${email}: ${body.error || response.status()}`);
  }

  // Las cookies se setean automáticamente en el contexto del browser
  return response.json();
}

/** Credenciales de la cuenta test vendedor de MP */
export const MP_SELLER = {
  userId: '3293892149',
  username: 'TESTUSER5817670393827660732',
  password: 'aW2QRqX7bG',
  verificationCode: '892149',
};

/** Credenciales de la cuenta test comprador de MP */
export const MP_BUYER = {
  userId: '3293726767',
  username: 'TESTUSER4541972477439750808',
  password: 'Pu4vJGgH8T',
  verificationCode: '726767',
};

/** Tarjeta de prueba Mastercard (Chile) */
export const TEST_CARD = {
  number: '5416752602582580',
  cvv: '123',
  expiry: '11/30',
  holderName: 'APRO', // Pago aprobado
  docType: 'Otro',
  docNumber: '123456789',
};

/** Tarjeta de prueba para pago rechazado */
export const TEST_CARD_REJECTED = {
  ...TEST_CARD,
  holderName: 'OTHE', // Rechazado por error general
};

/** Emails de testing */
export const TEST_EMAILS = {
  admin: 'carlos.irigoyen@gmail.com',
  artisan: 'carlos.irigoyen@me.com',
  buyer: 'carlos.irigoyen@gard.cl',
};
