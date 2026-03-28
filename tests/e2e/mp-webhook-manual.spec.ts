/**
 * Test de webhook manual
 *
 * Envía requests simulados al webhook endpoint para verificar
 * que responde correctamente y valida firmas.
 */
import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const WEBHOOK_SECRET = 'aceb21c5a72a2f2c4c76743bad30d3845b253ac5ed8ec9225411c07957fc731f';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function generateWebhookSignature(dataId: string, requestId: string) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex');

  return {
    signature: `ts=${ts},v1=${hmac}`,
    requestId,
  };
}

test.describe('MP Webhook - Prueba manual', () => {

  test('GET /api/mercadopago/webhook retorna status ok', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/mercadopago/webhook`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
    console.log('✅ Webhook GET health check passed');
  });

  test('POST sin firma retorna 401 (firma invalida)', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/mercadopago/webhook`, {
      data: {
        action: 'payment.updated',
        type: 'payment',
        data: { id: '999999999' },
      },
    });

    // Retorna 401 porque la firma HMAC es invalida/ausente
    expect(response.status()).toBe(401);
    console.log('✅ Webhook rechaza requests sin firma válida');
  });

  test('POST con firma válida pero payment ID inexistente', async ({ request }) => {
    const fakePaymentId = '999999999';
    const requestId = crypto.randomUUID();
    const { signature } = generateWebhookSignature(fakePaymentId, requestId);

    const response = await request.post(`${BASE_URL}/api/mercadopago/webhook`, {
      headers: {
        'x-signature': signature,
        'x-request-id': requestId,
      },
      data: {
        action: 'payment.updated',
        type: 'payment',
        data: { id: fakePaymentId },
      },
    });

    // Debería retornar 200 (no 500) incluso con payment inexistente
    expect(response.status()).toBe(200);
    console.log('✅ Webhook maneja payment inexistente sin crashear');
  });

  // Este test solo funciona con un payment ID real de sandbox
  // Descomentar y reemplazar después de ejecutar mp-payment-success
  test.skip('POST con firma válida procesa pago real', async ({ request }) => {
    const paymentId = 'REPLACE_WITH_REAL_PAYMENT_ID';
    const requestId = crypto.randomUUID();
    const { signature } = generateWebhookSignature(paymentId, requestId);

    const response = await request.post(`${BASE_URL}/api/mercadopago/webhook`, {
      headers: {
        'x-signature': signature,
        'x-request-id': requestId,
      },
      data: {
        action: 'payment.updated',
        type: 'payment',
        data: { id: paymentId },
      },
    });

    expect(response.status()).toBe(200);
    console.log('✅ Webhook procesó pago con firma válida');
  });
});
