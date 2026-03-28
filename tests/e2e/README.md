# Tests E2E — Mercado Pago × Casa Orfebre

## Setup

1. Instalar dependencias:
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

2. Asegurar que `.env.local` tiene todas las variables de MP configuradas,
   incluyendo `MERCADOPAGO_WEBHOOK_SECRET` y `AUTH_SECRET`.

3. Iniciar la app en modo desarrollo:
   ```bash
   npm run dev
   ```

4. En otra terminal, ejecutar el seed:
   ```bash
   npm run test:seed
   ```

## Ejecutar tests

### Modo visual (recomendado para primera vez):
```bash
npm run test:e2e:headed
```

### Modo UI (con panel interactivo):
```bash
npm run test:e2e:ui
```

### Modo headless:
```bash
npm run test:e2e
```

### Ejecutar un test específico:
```bash
npx playwright test mp-webhook-manual
npx playwright test mp-oauth
npx playwright test mp-payment-success
npx playwright test mp-db-verification
npx playwright test mp-payment-rejected
```

## Orden de ejecución recomendado

1. `mp-webhook-manual` — Verifica que el endpoint está up y valida firmas
2. `mp-oauth` — Vincula artesano con MP (requiere interacción con MP sandbox)
3. `mp-payment-success` — Pago exitoso completo (requiere interacción con checkout MP)
4. `mp-db-verification` — Verifica datos en DB (ejecutar después de pago exitoso)
5. `mp-payment-rejected` — Pago rechazado (usa nombre "OTHE" en tarjeta)

## Autenticación en tests

Los tests usan un endpoint especial `POST /api/test/auth` que genera una cookie
de sesión JWT de Auth.js sin pasar por Google OAuth. Solo funciona en desarrollo
(`NODE_ENV !== 'production'`).

Password de todos los usuarios de test: `TestE2E2024!`

## Cuentas de test MP

| Rol | User ID | Usuario | Password | Código |
|-----|---------|---------|----------|--------|
| Vendedor | 3293892149 | TESTUSER5817670393827660732 | aW2QRqX7bG | 892149 |
| Comprador | 3293726767 | TESTUSER4541972477439750808 | Pu4vJGgH8T | 726767 |
| Marketplace | 3297987611 | TESTUSER4192526338966199751 | 7gh6qT8OCj | 987611 |

## Tarjetas de test (Chile)

| Tipo | Número | CVV | Exp |
|------|--------|-----|-----|
| Mastercard | 5416 7526 0258 2580 | 123 | 11/30 |
| Visa | 4168 8188 4444 7115 | 123 | 11/30 |
| Amex | 3757 7817 4461 804 | 1234 | 11/30 |

## Nombres para simular estados de pago

| Nombre | Resultado |
|--------|-----------|
| `APRO` | Aprobado |
| `OTHE` | Rechazado (error general) |
| `CONT` | Pendiente |
| `FUND` | Sin fondos |
| `SECU` | Rechazado (código seguridad) |
| `EXPI` | Rechazado (fecha vencimiento) |

## Notas importantes

- **Timeouts**: MP sandbox es lento. Los timeouts de 60s+ son necesarios, no reducirlos.
- **Selectores MP**: La UI del sandbox de MP cambia frecuentemente. Si un test falla en la
  interacción con MP, usar `await page.pause()` para ver la UI real y ajustar selectores.
- **OAuth semi-manual**: El login en MP puede tener CAPTCHAs. Ejecutar en modo `--headed`.
- **Screenshots**: Se guardan en `tests/e2e/screenshots/` para debugging.
