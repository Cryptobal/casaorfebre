# Fix Payment Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the split payment path so ALL MercadoPago payments are collected by Casa Orfebre's marketplace account, never by artisan accounts.

**Architecture:** Remove the `useSplit` branch from both checkout functions and the artisan-token fallback from the webhook. Delete `mercadopago-split.ts`. The marketplace `preferenceClient` becomes the only payment path.

**Tech Stack:** Next.js server actions, MercadoPago SDK (`preferenceClient`), TypeScript

---

### Task 1: Remove split payment from main checkout

**Files:**
- Modify: `lib/actions/checkout.ts:1-13` (imports)
- Modify: `lib/actions/checkout.ts:335-442` (main checkout flow)

- [ ] **Step 1: Remove unused imports**

In `lib/actions/checkout.ts`, replace the imports block (lines 1-13):

```typescript
// DELETE line 7:
import { createArtisanPreference } from "@/lib/mercadopago-split";
// DELETE line 13:
import { ensureValidToken } from "@/lib/mercadopago-refresh";
```

- [ ] **Step 2: Replace split decision + branching with single marketplace path**

Replace lines 335-442 (from `// Determine if we can use split payment` through the end of the `else` block) with:

```typescript
  // Always use marketplace account for payment collection
  const artisanIds = [...new Set(products.map((p: any) => p.artisan?.id).filter(Boolean))];
  console.log(`[checkout] Marketplace payment — ${artisanIds.length} artisan(s)`);

  // Create MercadoPago preference
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const useSandbox = isSandbox();

    // Build MP items — if there's a discount/gift card, adjust prices proportionally
    // so MP total matches the actual charge (MP CLP doesn't accept negative unit_price)
    const totalDiscount = discountAmount + giftCardDiscount;
    const rawItemsTotal = subtotal + shippingCost;
    const adjustmentRatio = totalDiscount > 0 && rawItemsTotal > 0
      ? (rawItemsTotal - totalDiscount) / rawItemsTotal
      : 1;

    const items: { id: string; title: string; quantity: number; unit_price: number; currency_id: "CLP" }[] = cartItems.map((item: any) => ({
      id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Math.round(item.product.price * adjustmentRatio),
      currency_id: "CLP" as const,
    }));

    if (shippingCost > 0) {
      items.push({
        id: "shipping",
        title: `Despacho ${shippingResult.zoneName}`,
        quantity: 1,
        unit_price: Math.round(shippingCost * adjustmentRatio),
        currency_id: "CLP",
      });
    }

    // Ensure MP items sum exactly matches total (fix rounding)
    const mpSum = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    if (mpSum !== total && items.length > 0) {
      items[0].unit_price += total - mpSum;
    }

    const backUrls = {
      success: `${appUrl}/checkout/success`,
      failure: `${appUrl}/checkout/failure`,
      pending: `${appUrl}/checkout/success`,
    };

    const preference = await preferenceClient.create({
      body: {
        items,
        payer: { email: session.user.email },
        back_urls: backUrls,
        auto_return: "approved",
        external_reference: order.id,
        notification_url: `${appUrl}/api/mercadopago/webhook`,
        statement_descriptor: "CASA ORFEBRE",
      },
    });

    const redirectUrl = useSandbox
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point;
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `checkout.ts`

- [ ] **Step 4: Commit**

```bash
git add lib/actions/checkout.ts
git commit -m "fix(checkout): remove split payment from main checkout — always collect to marketplace"
```

---

### Task 2: Remove split payment from resume checkout

**Files:**
- Modify: `lib/actions/checkout.ts:510-591` (resumeOrderPayment function)

- [ ] **Step 1: Replace split logic in resumeOrderPayment**

Replace lines 510-591 (from `// Check if we can use split payment` through end of `else` block) with:

```typescript
  const artisanIds = [...new Set(order.items.map((i) => i.artisanId).filter(Boolean))];
  console.log(`[checkout:resume] Marketplace payment — ${artisanIds.length} artisan(s)`);

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const useSandbox = isSandbox();

    const items: { id: string; title: string; quantity: number; unit_price: number; currency_id: "CLP" }[] = order.items.map((item) => ({
      id: item.productId,
      title: item.productName,
      quantity: item.quantity,
      unit_price: item.productPrice,
      currency_id: "CLP" as const,
    }));

    if (order.shippingCost > 0) {
      items.push({
        id: "shipping",
        title: "Despacho",
        quantity: 1,
        unit_price: order.shippingCost,
        currency_id: "CLP",
      });
    }

    const backUrls = {
      success: `${appUrl}/checkout/success`,
      failure: `${appUrl}/checkout/failure`,
      pending: `${appUrl}/checkout/success`,
    };

    const preference = await preferenceClient.create({
      body: {
        items,
        payer: { email: session.user.email },
        back_urls: backUrls,
        auto_return: "approved",
        external_reference: order.id,
        notification_url: `${appUrl}/api/mercadopago/webhook`,
        statement_descriptor: "CASA ORFEBRE",
      },
    });

    const redirectUrl = useSandbox
      ? preference.sandbox_init_point || preference.init_point
      : preference.init_point;
```

- [ ] **Step 2: Remove mpAccessToken/mpOnboarded from product query**

In the `resumeOrderPayment` function, the `products` query (lines ~485-498) fetches `mpAccessToken` and `mpOnboarded` for the artisan. Remove those fields since they're no longer needed in this function:

```typescript
  const products = await prisma.product.findMany({
    where: { id: { in: order.items.map((i) => i.productId) } },
    include: {
      artisan: {
        select: {
          id: true,
          commissionRate: true,
          commissionOverride: true,
        },
      },
    },
  });
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `checkout.ts`

- [ ] **Step 4: Commit**

```bash
git add lib/actions/checkout.ts
git commit -m "fix(checkout): remove split payment from resumeOrderPayment"
```

---

### Task 3: Delete mercadopago-split.ts

**Files:**
- Delete: `lib/mercadopago-split.ts`

- [ ] **Step 1: Verify no other imports of this file exist**

Run: `grep -r "mercadopago-split" --include="*.ts" --include="*.tsx" .`
Expected: No results (imports were already removed in Task 1)

- [ ] **Step 2: Delete the file**

```bash
rm lib/mercadopago-split.ts
```

- [ ] **Step 3: Commit**

```bash
git add lib/mercadopago-split.ts
git commit -m "fix(checkout): delete mercadopago-split.ts — no longer used"
```

---

### Task 4: Simplify webhook fetchPayment

**Files:**
- Modify: `app/api/mercadopago/webhook/route.ts:485-525`

- [ ] **Step 1: Replace fetchPayment with simplified version**

Replace lines 485-525 (the entire `fetchPayment` function) with:

```typescript
/**
 * Fetches a payment from MP using the marketplace token.
 */
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

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `webhook/route.ts`

- [ ] **Step 3: Commit**

```bash
git add app/api/mercadopago/webhook/route.ts
git commit -m "fix(webhook): remove artisan token fallback — all payments fetched via marketplace"
```

---

### Task 5: Full verification

- [ ] **Step 1: Grep for any remaining split references**

```bash
grep -rn "createArtisanPreference\|useSplit\|validArtisanToken\|marketplace_fee\|mercadopago-split" --include="*.ts" --include="*.tsx" .
```

Expected: Zero results

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: Build succeeds with no new errors

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: No new lint errors introduced (pre-existing warnings are OK)

- [ ] **Step 4: Final commit if any cleanup needed**

If grep in step 1 found stragglers, fix and commit them here.
