# Phase 4: Portal del Comprador — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the buyer portal — order tracking, reviews with photos, favorites synced to catalog, disputes, return requests, and profile.

**Architecture:** Server Components for pages, Server Actions for mutations. Favorites toggle via server action called from client ProductCard. Review photos uploaded to R2.

**Tech Stack:** Next.js 16, Prisma 7, R2 uploads, Server Actions, React 19

---

## File Map

| File | Responsibility |
|------|---------------|
| `lib/queries/buyer-orders.ts` | Buyer order queries |
| `lib/actions/reviews.ts` | Create review server action |
| `lib/actions/favorites.ts` | Toggle favorite server action |
| `lib/actions/disputes.ts` | Create dispute server action |
| `lib/actions/returns.ts` | Create return request server action |
| `lib/actions/buyer-profile.ts` | Update buyer profile server action |
| `app/portal/comprador/pedidos/page.tsx` | Buyer orders list |
| `app/portal/comprador/pedidos/[id]/page.tsx` | Order detail with actions |
| `app/portal/comprador/pedidos/[id]/review-form.tsx` | Review form client component |
| `app/portal/comprador/pedidos/[id]/disputa/page.tsx` | Dispute form |
| `app/portal/comprador/pedidos/[id]/devolucion/page.tsx` | Return request form |
| `app/portal/comprador/favoritos/page.tsx` | Favorites grid |
| `app/portal/comprador/perfil/page.tsx` | Profile editor |
| `components/products/product-card.tsx` | Updated with favorite support |

---

### Task 1: Queries and Server Actions

**Files:**
- Create: `lib/queries/buyer-orders.ts`
- Create: `lib/actions/reviews.ts`
- Create: `lib/actions/favorites.ts`
- Create: `lib/actions/disputes.ts`
- Create: `lib/actions/returns.ts`
- Create: `lib/actions/buyer-profile.ts`

- [ ] **Step 1: Buyer order queries**

`lib/queries/buyer-orders.ts`:
- `getBuyerOrders(userId)` — orders with items, each item with product (including isCustomMade) and artisan, plus fulfillment status. Also include existing reviews and disputes for conditional button logic.
- `getBuyerOrderDetail(orderId, userId)` — single order with full items, product details, artisan info, existing reviews, existing disputes, certificates, return requests

- [ ] **Step 2: Reviews action**

`lib/actions/reviews.ts`:
- `createReview(formData)` — validates: user bought product (has delivered OrderItem), 3+ days since delivery, no existing review
- Parses: rating (1-5), comment, orderId, productId, artisanId
- Creates Review with `isVerified: true`
- Handles photo URLs (already uploaded to R2 via /api/upload — pass imageUrls as JSON string in formData)
- `// TODO Phase 7: Apply contact-filter.ts to comment before saving`
- Revalidates paths

- [ ] **Step 3: Favorites action**

`lib/actions/favorites.ts`:
- `toggleFavorite(productId)` — if favorite exists, delete it; if not, create it
- Returns `{ favorited: boolean }`
- Revalidates paths

- [ ] **Step 4: Disputes action**

`lib/actions/disputes.ts`:
- `createDispute(formData)` — validates: order belongs to user, within 14 days of delivery, no open dispute
- Parses: reason (DisputeReason enum), description, orderId, imageUrls (JSON)
- Creates Dispute with status OPEN

- [ ] **Step 5: Returns action**

`lib/actions/returns.ts`:
- `createReturnRequest(formData)` — validates: orderItem belongs to user, within 14 days, product NOT isCustomMade
- Parses: reason (ReturnReason enum), description, orderItemId, imageUrls
- Auto-assigns shippingPaidBy: BUYER_REGRET → BUYER, everything else → PLATFORM
- Creates ReturnRequest with status REQUESTED

- [ ] **Step 6: Buyer profile action**

`lib/actions/buyer-profile.ts`:
- `updateBuyerProfile(formData)` — updates user name
- `changePassword(formData)` — validates current password, hashes new, updates

- [ ] **Step 7: Commit**

```bash
git add lib/queries/buyer-orders.ts lib/actions/reviews.ts lib/actions/favorites.ts lib/actions/disputes.ts lib/actions/returns.ts lib/actions/buyer-profile.ts
git commit -m "feat: add buyer portal queries and server actions"
```

---

### Task 2: Buyer Orders Pages

**Files:**
- Create: `app/portal/comprador/pedidos/page.tsx`
- Create: `app/portal/comprador/pedidos/[id]/page.tsx`
- Create: `app/portal/comprador/pedidos/[id]/review-form.tsx`

- [ ] **Step 1: Orders list**

`app/portal/comprador/pedidos/page.tsx`:
- Remove .gitkeep
- Fetch buyer's orders via `getBuyerOrders(session.user.id)`
- Each order card: order number, date, total formatCLP, status badge, item count
- Click → `/portal/comprador/pedidos/[orderId]`
- Empty state: "No tienes pedidos aún"

- [ ] **Step 2: Order detail page**

`app/portal/comprador/pedidos/[id]/page.tsx`:
- Fetch order detail with all items
- Show: order number, date, shipping address, total
- Per OrderItem:
  - Product name (link to product page), artisan name, price, quantity
  - Fulfillment status badge
  - If SHIPPED: tracking number + carrier
  - If DELIVERED: delivery date
  - **Conditional buttons (key logic):**
    - "Dejar Review": `item.fulfillmentStatus === "DELIVERED" && daysSinceDelivery >= 3 && !existingReview`
    - "Solicitar Devolución": `item.fulfillmentStatus === "DELIVERED" && daysSinceDelivery <= 14 && !item.product.isCustomMade`
      - If isCustomMade: show "Pieza personalizada · Sin devolución" text instead
    - "Abrir Disputa": `order has DELIVERED items && daysSinceDelivery <= 14 && !openDispute`
    - "Ver Certificado": placeholder text "Certificado disponible próximamente"
  - Date calculations: use `item.deliveredAt`, compute `daysSinceDelivery = (now - deliveredAt) / (1000*60*60*24)`

- [ ] **Step 3: Review form component**

`app/portal/comprador/pedidos/[id]/review-form.tsx`:
- `"use client"` component
- Props: productId, artisanId, orderId, orderItemId
- Star rating: 5 clickable stars (useState for selected rating)
- Comment textarea
- Photo upload: reuse the pattern from image-upload but simpler (up to 4 photos, upload to `/api/upload` — we'll need to adjust the upload route to accept a `type` param for reviews)
  - Actually, for simplicity: use a basic file input, upload to R2 via a new lightweight approach or adjust existing upload route
  - Simplest: add the review image URLs as a text field for now, and in the submit action handle them
- Submit button calls createReview server action
- useActionState for form handling

- [ ] **Step 4: Commit**

```bash
git add app/portal/comprador/pedidos/
git commit -m "feat: add buyer order list, detail with conditional actions, and review form"
```

---

### Task 3: Dispute and Return Request Pages

**Files:**
- Create: `app/portal/comprador/pedidos/[id]/disputa/page.tsx`
- Create: `app/portal/comprador/pedidos/[id]/devolucion/page.tsx`

- [ ] **Step 1: Dispute form page**

Server Component that renders a client form:
- Validates: order belongs to user, has delivered items, within 14 days
- Form: reason select (DisputeReason values with Spanish labels), description textarea, submit
- Photo upload: basic file inputs for evidence
- On submit: calls createDispute action → redirects to order detail

Spanish labels for DisputeReason:
- NOT_AS_DESCRIBED: "El producto no coincide con la descripción"
- NOT_RECEIVED: "No recibí el producto"
- DAMAGED: "El producto llegó dañado"
- WRONG_ITEM: "Recibí un producto equivocado"
- OTHER: "Otro motivo"

- [ ] **Step 2: Return request page**

Server Component with client form:
- Validates: orderItem exists, belongs to user, product NOT isCustomMade, within 14 days
- If isCustomMade: redirect back with error (shouldn't reach this page, but guard)
- Form: reason select (ReturnReason with Spanish labels), description textarea, photos
- Shows who pays shipping based on selected reason (auto-calculated):
  - BUYER_REGRET: "El envío de devolución corre por tu cuenta"
  - Others: "El envío de devolución es cubierto por la plataforma"
- On submit: calls createReturnRequest → redirects to order detail

Spanish labels for ReturnReason:
- NOT_AS_DESCRIBED: "No coincide con la descripción"
- DAMAGED_ON_ARRIVAL: "Llegó dañado"
- WRONG_ITEM: "Producto equivocado"
- BUYER_REGRET: "Arrepentimiento"
- DEFECTIVE: "Defecto de fabricación"
- OTHER: "Otro"

- [ ] **Step 3: Commit**

```bash
git add app/portal/comprador/pedidos/
git commit -m "feat: add dispute and return request forms"
```

---

### Task 4: Favorites System

**Files:**
- Modify: `components/products/product-card.tsx` — add favorite state
- Create: `app/portal/comprador/favoritos/page.tsx`
- Modify: `app/(public)/page.tsx` — pass favorites to ProductCards
- Modify: `app/(public)/coleccion/page.tsx` — pass favorites to ProductCards
- Modify: `app/(public)/orfebres/[slug]/page.tsx` — pass favorites to ProductCards

- [ ] **Step 1: Update ProductCard for favorites**

Modify `components/products/product-card.tsx`:
- Add prop: `isFavorited?: boolean`
- The heart button: if `isFavorited`, fill the heart SVG (use `fill="currentColor"` + `text-accent`)
- onClick: call `toggleFavorite(productId)` server action
- Since this is a client component, import the server action and call it
- After toggle: use `useRouter().refresh()` to reflect the change

- [ ] **Step 2: Create favorites page**

`app/portal/comprador/favoritos/page.tsx`:
- Remove .gitkeep
- Fetch user's favorites with product + artisan relation
- Render as ProductCard grid (all marked isFavorited=true)
- Empty state: "Aún no tienes piezas guardadas. Explora la colección y guarda las que más te gusten."

- [ ] **Step 3: Update catalog pages to pass favorites**

For `app/(public)/page.tsx`, `app/(public)/coleccion/page.tsx`, and `app/(public)/orfebres/[slug]/page.tsx`:
- At the top: check if user is authenticated via `auth()` (optional, don't redirect)
- If authenticated: fetch their favorite productIds as a Set
- Pass `isFavorited={favoriteIds.has(product.id)}` to each ProductCard
- If not authenticated: pass `isFavorited={false}`

Create a helper function `getUserFavoriteIds(userId?: string)` in `lib/queries/products.ts`:
```ts
export async function getUserFavoriteIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(favorites.map(f => f.productId));
}
```

- [ ] **Step 4: Commit**

```bash
git add components/products/product-card.tsx app/portal/comprador/favoritos/ app/\(public\)/ lib/queries/products.ts
git commit -m "feat: add favorites system — toggle, page, synced to catalog cards"
```

---

### Task 5: Buyer Profile + Portal Sidebar

**Files:**
- Create: `app/portal/comprador/perfil/page.tsx`
- Modify: `app/portal/layout.tsx` — add buyer nav links

- [ ] **Step 1: Profile page**

`app/portal/comprador/perfil/page.tsx`:
- Remove .gitkeep
- Fetch user data
- Form: name (editable), email (read-only display)
- Change password section: current password, new password, confirm new password
- Server actions for both updates
- Success/error feedback

- [ ] **Step 2: Update portal sidebar**

Add buyer links to `app/portal/layout.tsx`:
- Under a "Comprador" section (always visible since any user can be a buyer):
  - Mis Pedidos → `/portal/comprador/pedidos`
  - Favoritos → `/portal/comprador/favoritos`
  - Mi Cuenta → `/portal/comprador/perfil`

- [ ] **Step 3: Commit**

```bash
git add app/portal/comprador/perfil/ app/portal/layout.tsx
git commit -m "feat: add buyer profile page and update portal sidebar"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Clean cache and start dev server**

```bash
rm -rf .next && npm run dev
```

- [ ] **Step 2: Verify all buyer portal pages respond**

Test (expect 307 redirect to login for all portal routes):
- `/portal/comprador/pedidos`
- `/portal/comprador/favoritos`
- `/portal/comprador/perfil`

Test public pages still work (200):
- `/` — verify hearts show on product cards
- `/coleccion` — verify hearts show

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix: polish Phase 4 buyer portal"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Queries + server actions | lib/queries/, lib/actions/ |
| 2 | Order list + detail + review form | app/portal/comprador/pedidos/ |
| 3 | Dispute + return request forms | pedidos/[id]/disputa, devolucion |
| 4 | Favorites system | product-card, favoritos page, catalog updates |
| 5 | Buyer profile + sidebar | perfil page, portal layout |
| 6 | Verification | All pages |
