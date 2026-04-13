# Fix Payment Collection: Always Collect to Casa Orfebre

**Date:** 2026-04-13
**Status:** Approved
**Problem:** When an artisan has MercadoPago OAuth connected, checkout creates the payment preference using the artisan's access token. This causes the buyer's payment to land in the artisan's MP account instead of Casa Orfebre's. Casa Orfebre only receives the `marketplace_fee` (commission), which is the inverse of the intended model.

**Solution:** Eliminate the split payment path entirely. ALL payment preferences are created with Casa Orfebre's marketplace access token. The existing payout system (HELD → PENDING → PAID via Santander CSV) already handles artisan disbursements correctly.

---

## Scope

### What Changes

#### 1. `lib/actions/checkout.ts` — Remove split payment logic (2 locations)

**Location A: Main checkout flow (lines ~335-418)**
- Delete lines 335-348: split payment detection logic (`artisanIds`, `isSingleArtisan`, `soleArtisan`, `validArtisanToken`, `useSplit`)
- Delete lines 395-418: the `if (useSplit)` branch that calls `createArtisanPreference`
- Keep lines 419-442 (the marketplace path) as the ONLY path, removing the `else` wrapper
- Remove the `import { createArtisanPreference }` from line 7
- Remove the `import { ensureValidToken }` from line 13

**Location B: Resume checkout flow (lines ~510-575)**
- Same pattern: delete split detection (lines 510-522) and `if (useSplit)` branch (lines 554-574)
- Keep the marketplace `else` branch as the only path

**After cleanup, the checkout log line should read:**
```typescript
console.log(`[checkout] Marketplace payment — ${artisanIds.length} artisan(s)`);
```

#### 2. `lib/mercadopago-split.ts` — Delete file

This file only exports `createArtisanPreference()` which will no longer be called.

#### 3. `app/api/mercadopago/webhook/route.ts` — Simplify `fetchPayment()` (lines 488-525)

Remove the artisan token fallback. The function should only use the marketplace `paymentClient`:

```typescript
async function fetchPayment(paymentId: string | number): Promise<any> {
  try {
    return await paymentClient.get({ id: paymentId });
  } catch (err: any) {
    console.error('[MP Webhook] Failed to fetch payment', {
      paymentId, error: err?.message,
    });
    return null;
  }
}
```

### What Does NOT Change

- **OAuth flow** (`app/api/oauth/mercadopago/`) — Keep as-is. Artisan OAuth data stays in DB for future use or identity verification.
- **Token refresh** (`lib/mercadopago-refresh.ts`) — Keep as-is. `ensureValidToken` may be used elsewhere or in the future; the import is simply removed from checkout.
- **Payout system** — HELD → delivery → settlement → PENDING → CSV → PAID flow is untouched.
- **Cron jobs** — `release-payouts`, `auto-confirm-receipt`, `auto-cancel-unshipped` are unaffected.
- **Admin panel** — `/portal/admin/pagos/` works the same.
- **Artisan finanzas** — `/portal/orfebre/finanzas/` works the same.
- **Commission calculation** — Still computed at checkout and stored on `OrderItem`.
- **DB schema** — No migrations needed. `mpAccessToken`, `mpRefreshToken`, `mpOnboarded` fields remain on `Artisan`.

---

## Verification Plan

1. **Read modified files** — Confirm no references to `createArtisanPreference` or split logic remain
2. **Grep codebase** — Search for `createArtisanPreference`, `mercadopago-split`, `useSplit`, `validArtisanToken`, `marketplace_fee` to ensure full cleanup
3. **Build check** — `npm run build` must pass with no import errors
4. **Lint check** — `npm run lint` should not introduce new errors
5. **Manual flow test** — Create a test checkout with a connected artisan and verify the preference is created with the marketplace token (check server logs for `[checkout] Marketplace payment`)

---

## Risk Assessment

- **Low risk**: This removes a code path, it doesn't add one. The marketplace path already works for multi-artisan and unconnected-artisan orders.
- **Existing split orders**: Any orders already paid via split are already in the DB with their payment IDs. The webhook can still process notifications for those if they arrive, since MP notifications include the payment data inline. The only thing removed is the artisan-token fallback for fetching — but existing payments are already settled.
- **Production**: `MP_SANDBOX=false` means this is live. After deploy, all new checkouts will go through the marketplace account regardless of artisan OAuth status.
