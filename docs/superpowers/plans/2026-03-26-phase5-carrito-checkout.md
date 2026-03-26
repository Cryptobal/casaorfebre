# Phase 5: Carrito & Checkout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Cart system, checkout with shipping, MercadoPago Checkout Pro, webhook for payment, order creation with commission split.

**Architecture:** Cart in DB (CartItem model), MercadoPago Checkout Pro for payment, webhook processes payment notifications and creates orders. Split payments prepared for when artisans connect MP accounts.

**Tech Stack:** Next.js 16, Prisma 7, mercadopago SDK, Server Actions

---

## File Map

| File | Responsibility |
|------|---------------|
| `lib/mercadopago.ts` | MercadoPago client singleton |
| `lib/queries/cart.ts` | Cart query functions |
| `lib/actions/cart.ts` | Cart server actions |
| `components/cart/cart-drawer.tsx` | Slide-in cart panel |
| `components/cart/cart-item.tsx` | Single cart item row |
| `components/layout/navbar.tsx` | Updated with cart count + drawer |
| `app/(public)/coleccion/[slug]/page.tsx` | Updated with add-to-cart button |
| `app/(public)/checkout/page.tsx` | Checkout form + payment |
| `app/(public)/checkout/success/page.tsx` | Payment success |
| `app/(public)/checkout/failure/page.tsx` | Payment failure |
| `app/api/mercadopago/webhook/route.ts` | Webhook handler |
| `lib/actions/checkout.ts` | Create preference + order server actions |

---

### Task 1: Cart Backend (Queries + Actions)

**Files:**
- Create: `lib/queries/cart.ts`
- Create: `lib/actions/cart.ts`

- [ ] **Step 1: Cart queries**

`lib/queries/cart.ts`:
- `getCart(userId)` — findMany CartItems with product (name, slug, price, stock, isUnique, isCustomMade), artisan (displayName, slug), first image. Ordered by createdAt.
- `getCartCount(userId)` — count of CartItems
- `getCartTotal(userId)` — aggregate sum of price * quantity (need to compute manually since Prisma can't multiply fields)

- [ ] **Step 2: Cart actions**

`lib/actions/cart.ts`:
- `addToCart(productId: string, quantity = 1)` — validates auth, product approved, stock. If isUnique and already in cart: error. If already in cart: increment quantity. Otherwise create.
- `updateCartQuantity(cartItemId: string, quantity: number)` — validates ownership, quantity between 1 and product.stock
- `removeFromCart(cartItemId: string)` — validates ownership, deletes
- `clearCart()` — deletes all for user
- All revalidatePath appropriately

- [ ] **Step 3: Commit**

```bash
git add lib/queries/cart.ts lib/actions/cart.ts
git commit -m "feat: add cart queries and server actions"
```

---

### Task 2: Cart Drawer UI

**Files:**
- Create: `components/cart/cart-drawer.tsx`
- Create: `components/cart/cart-item.tsx`
- Modify: `components/layout/navbar.tsx` — add cart count badge + drawer toggle

- [ ] **Step 1: CartItem component**

`components/cart/cart-item.tsx` — "use client":
- Shows: thumbnail (ImagePlaceholder), product name, artisan name, price (formatCLP), quantity controls (+/- buttons), remove X
- Calls updateCartQuantity and removeFromCart server actions
- useTransition for non-blocking UI

- [ ] **Step 2: CartDrawer component**

`components/cart/cart-drawer.tsx` — "use client":
- Props: `isOpen`, `onClose`, `cart` (items with product+artisan), `total`
- Fixed panel from right: `fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-surface border-l`
- Backdrop overlay on click closes
- Header: "Tu Carrito" + close button
- Items grouped by artisan:
  - Artisan name as section header
  - CartItem components for each
- Bottom section:
  - Note: "Tu pedido puede llegar en envíos separados si incluye piezas de distintos orfebres" (text-xs, text-tertiary)
  - Subtotal: formatCLP(total)
  - "Ir al Checkout" Button → Link to /checkout
- Empty state: "Tu carrito está vacío" + Link to /coleccion

- [ ] **Step 3: Update Navbar**

Modify `components/layout/navbar.tsx`:
- Make it a mixed component — the Navbar itself stays server, but extract the cart button into a client component
- Create `components/layout/cart-button.tsx` — "use client":
  - Props: `count` (number of items)
  - Shows cart icon with count badge if > 0
  - On click: opens CartDrawer
  - Manages drawer open state
  - Fetches full cart data when drawer opens (or receives it as prop)

Actually, simpler approach: make the cart button + drawer a single client component that fetches cart on mount:
- `components/layout/cart-button.tsx`:
  - Fetches cart via a route handler or receives count as prop
  - For simplicity: pass `cartCount` from a server component wrapper
  - The Navbar needs to know the count — add `getCartCount` call in the public layout

Update `app/(public)/layout.tsx` to fetch cart count and pass to Navbar.

- [ ] **Step 4: Commit**

```bash
git add components/cart/ components/layout/ app/\(public\)/layout.tsx
git commit -m "feat: add cart drawer with item grouping, quantity controls, and navbar badge"
```

---

### Task 3: Add to Cart on Product Detail

**Files:**
- Modify: `app/(public)/coleccion/[slug]/page.tsx` — make "Añadir al Carrito" functional

- [ ] **Step 1: Create add-to-cart client component**

Create `app/(public)/coleccion/[slug]/add-to-cart.tsx` — "use client":
- Props: `productId`, `isUnique`, `stock`, `price`
- If not isUnique: quantity selector (1 to stock)
- "Añadir al Carrito — $XX.XXX" button
- On click: calls addToCart server action
- Shows success toast/message or error
- useTransition for loading state

- [ ] **Step 2: Replace visual-only button in product detail**

Update the product detail page to use the new AddToCart component instead of the static button.

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/coleccion/\[slug\]/
git commit -m "feat: add functional add-to-cart on product detail page"
```

---

### Task 4: MercadoPago + Checkout Page

**Files:**
- Create: `lib/mercadopago.ts`
- Create: `lib/actions/checkout.ts`
- Create: `app/(public)/checkout/page.tsx`
- Create: `app/(public)/checkout/checkout-form.tsx`
- Create: `app/(public)/checkout/success/page.tsx`
- Create: `app/(public)/checkout/failure/page.tsx`

**Install:** `npm install mercadopago`

- [ ] **Step 1: MercadoPago client**

`lib/mercadopago.ts`:
```ts
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);
```

- [ ] **Step 2: Checkout server action**

`lib/actions/checkout.ts`:
```ts
"use server";
```

Function `createCheckoutPreference(formData)`:
1. Validate auth session
2. Get cart items with products + artisans
3. Validate all items still in stock
4. Parse shipping data from formData
5. Generate a temporary reference: `cart-{userId}-{timestamp}`
6. Store shipping data temporarily (in a new table or JSON in a temp record — simplest: store in the preference's external_reference and parse later, or create the Order as PENDING_PAYMENT immediately)

**Approach:** Create Order immediately as PENDING_PAYMENT:
- Generate orderNumber: `CO-${year}-${random5digits}`
- Create Order with status PENDING_PAYMENT
- Create OrderItems with commission calculation
- Store orderId as external_reference in MP preference
- If payment never comes: order stays as PENDING_PAYMENT (can be cleaned up later)

Create MercadoPago preference:
```ts
const preference = await preferenceClient.create({
  body: {
    items: cartItems.map(item => ({
      id: item.productId,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: "CLP",
    })),
    payer: { email: session.user.email },
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    },
    auto_return: "approved",
    external_reference: orderId,
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
  },
});
```

Return `preference.init_point` (URL to redirect to).

- [ ] **Step 3: Checkout page**

`app/(public)/checkout/page.tsx` — Server Component:
- Requires auth (redirect if not)
- Fetches cart — if empty, redirect to /coleccion
- Shows order summary + shipping form

`app/(public)/checkout/checkout-form.tsx` — "use client":
- Shipping form fields: name, address, city, region (Chilean regions select), postal code
- Order summary sidebar: items, subtotal, shipping ($0), total
- If any isCustomMade items: amber warning box
- "Pagar con Mercado Pago" button → calls createCheckoutPreference → redirects to init_point
- Loading state during preference creation
- Chilean regions list: Arica y Parinacota, Tarapacá, Antofagasta, Atacama, Coquimbo, Valparaíso, Metropolitana, O'Higgins, Maule, Ñuble, Biobío, Araucanía, Los Ríos, Los Lagos, Aysén, Magallanes

- [ ] **Step 4: Success + Failure pages**

`app/(public)/checkout/success/page.tsx`:
- Reads searchParams for `payment_id`, `external_reference`
- Shows: success icon, "¡Gracias por tu compra!", order number if available
- Link to "Ver mis pedidos"

`app/(public)/checkout/failure/page.tsx`:
- Error message, "Hubo un problema con tu pago"
- Link to "Volver al carrito"

- [ ] **Step 5: Commit**

```bash
git add lib/mercadopago.ts lib/actions/checkout.ts app/\(public\)/checkout/ package.json package-lock.json
git commit -m "feat: add MercadoPago checkout with preference creation and payment pages"
```

---

### Task 5: Webhook + Order Processing

**Files:**
- Create: `app/api/mercadopago/webhook/route.ts`

- [ ] **Step 1: Webhook handler**

Remove .gitkeep. POST handler:
1. Parse body — MercadoPago sends `{ action, data: { id } }` or `{ type, data: { id } }`
2. If action is "payment.created" or type is "payment":
   - Fetch payment details via paymentClient.get(data.id)
   - If payment.status === "approved":
     - Get orderId from payment.external_reference
     - Update Order: status → PAID, mpPaymentId → payment.id
     - Destock: for each OrderItem, decrement product.stock. If stock reaches 0, set product.status → SOLD_OUT
     - Clear user's cart
     - // TODO Phase 7: Send confirmation emails
   - If payment.status === "rejected": update order status → CANCELLED
3. Return 200 OK (always, even on error — MP retries on non-200)

- [ ] **Step 2: Commit**

```bash
git add app/api/mercadopago/
git commit -m "feat: add MercadoPago webhook — payment processing, order update, stock management"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Clean and start**

```bash
rm -rf .next && npm run dev
```

- [ ] **Step 2: Verify all routes**

Public:
- `/` — home with cart icon in navbar
- `/coleccion/[slug]` — add to cart button functional
- `/checkout` — redirects to login if not auth
- `/checkout/success` — renders
- `/checkout/failure` — renders

API:
- `POST /api/mercadopago/webhook` — returns 200

- [ ] **Step 3: Commit fixes**

```bash
git add -A && git commit -m "fix: polish Phase 5 cart and checkout"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Cart queries + actions | lib/queries/cart.ts, lib/actions/cart.ts |
| 2 | Cart drawer UI + navbar | components/cart/, components/layout/ |
| 3 | Add to cart on product page | app/(public)/coleccion/[slug]/ |
| 4 | MercadoPago + checkout page | lib/mercadopago.ts, app/(public)/checkout/ |
| 5 | Webhook + order processing | app/api/mercadopago/webhook/ |
| 6 | Verification | All pages |
