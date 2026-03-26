# Phase 5: Carrito & Checkout — Design Spec

**Project:** Casa Orfebre
**Phase:** 5 of 9 — Carrito & Checkout
**Date:** 2026-03-26
**Status:** Approved

---

## Scope

Cart system (DB-backed for authenticated users), checkout with shipping form, MercadoPago Checkout Pro integration with split payment preparation, webhook for payment notifications, order creation on successful payment, stock management.

## Out of Scope

- MercadoPago OAuth for artisans (prepared but not active)
- Email sending via Resend (placeholder)
- Actual shipping cost calculation (flat $0 for MVP)

---

## 1. Cart System

### Data Model
- Uses existing `CartItem` model (userId + productId + quantity, unique constraint)
- DB-backed: authenticated users only
- Anonymous users: redirect to login when trying to add to cart

### Cart Actions (`lib/actions/cart.ts`)
- `addToCart(productId, quantity?)` — creates or increments CartItem
  - Validates: product exists, status APPROVED, stock available
  - If isUnique and already in cart: error
- `updateCartQuantity(cartItemId, quantity)` — updates quantity (min 1, max stock)
- `removeFromCart(cartItemId)` — deletes CartItem
- `clearCart(userId)` — deletes all CartItems for user

### Cart Queries (`lib/queries/cart.ts`)
- `getCart(userId)` — CartItems with product + artisan + first image
- `getCartCount(userId)` — count for navbar badge
- `getCartTotal(userId)` — sum of price * quantity

### Cart Drawer (`components/cart/cart-drawer.tsx`)
- Slide-in panel from right with overlay
- Items grouped by artisan (visual grouping with artisan name header)
- Each item: thumbnail, name, artisan, price, quantity controls (+/-), remove X
- Subtotal at bottom
- Note: "Tu pedido puede llegar en envíos separados si incluye piezas de distintos orfebres"
- "Ir al Checkout" button → `/checkout`
- Empty state: "Tu carrito está vacío"

### Navbar Integration
- Cart icon shows badge with item count
- Click opens cart drawer

---

## 2. Checkout Page (`/checkout`)

### Shipping Form
- Nombre del destinatario
- Dirección
- Ciudad
- Región (select with Chilean regions)
- Código postal (optional)
- Country: fixed "Chile"

### Order Summary
- Items listed with price and quantity
- Subtotal
- Envío: $0 (gratis para MVP)
- Total
- If cart contains isCustomMade items: amber warning "Tu carrito incluye piezas personalizadas que no admiten devolución. Al pagar, aceptas esta condición."

### Payment
- "Pagar con Mercado Pago" button
- Creates MercadoPago preference via server action
- Redirects to MercadoPago Checkout Pro hosted page
- On success: MercadoPago redirects to `/checkout/success?payment_id=...`
- On failure: redirects to `/checkout/failure`

---

## 3. MercadoPago Integration

### SDK Setup (`lib/mercadopago.ts`)
- Use `mercadopago` npm package (official SDK)
- Configure with test credentials for development:
  - `MERCADOPAGO_ACCESS_TOKEN` (test token for MVP)
  - `MERCADOPAGO_PUBLIC_KEY` (test public key)

### Preference Creation
- Creates a MercadoPago preference with:
  - Items: each cart item as a preference item
  - Payer: buyer email
  - Back URLs: success, failure, pending
  - `notification_url`: webhook URL
  - `external_reference`: temporary cart reference (used to match webhook to order)
  - For MVP (no artisan MP accounts): pay to marketplace account
  - Prepared for split: when artisan has `mpAccessToken`, use it as `access_token` in preference and set `marketplace_fee`

### Test Credentials
```
Public Key: APP_USR-529c84e9-6e3b-42fb-b107-71664155fd4e
Access Token: APP_USR-8991612893835107-032613-908e22de0ef3cb5ff2745b5ebf1fdead-3293892149
```

---

## 4. Webhook (`/api/mercadopago/webhook`)

### Flow
1. MercadoPago sends POST to `/api/mercadopago/webhook`
2. Validate: check payment status via MP API
3. If payment approved:
   - Create Order with `orderNumber: CO-2026-XXXXX` (random 5 digits)
   - Create OrderItems for each cart item with commission calculation
   - Destock products (decrement stock, set SOLD_OUT if 0)
   - Clear cart
   - Store `mpPaymentId` on Order
4. If payment rejected/pending: log but don't create order

### Order Number Format
- `CO-{year}-{5 random digits}` e.g. `CO-2026-48372`

### Commission Calculation
- Per OrderItem: `commissionRate = artisan.commissionRate`
- `commissionAmount = Math.round(productPrice * quantity * commissionRate)`
- `artisanPayout = (productPrice * quantity) - commissionAmount`

---

## 5. Success/Failure Pages

### `/checkout/success`
- "¡Gracias por tu compra!" heading
- Order number display
- "Tu pedido está siendo procesado"
- Link to "Ver mis pedidos" → `/portal/comprador/pedidos`

### `/checkout/failure`
- "Hubo un problema con tu pago" heading
- "Puedes intentar nuevamente"
- Link back to cart

---

## Verification Criteria

1. Add to cart works from product detail page
2. Cart drawer opens from navbar, shows items grouped by artisan
3. Quantity controls work (respects stock limits)
4. Checkout form validates shipping fields
5. isCustomMade warning appears when relevant
6. MercadoPago preference is created correctly
7. Redirect to MercadoPago Checkout Pro works
8. Webhook receives payment notification
9. Order created with correct number format and commission calculation
10. Stock decremented after purchase
11. Cart cleared after successful payment
