# Phase 4: Portal del Comprador — Design Spec

**Project:** Casa Orfebre
**Phase:** 4 of 9 — Portal del Comprador
**Date:** 2026-03-26
**Status:** Approved

---

## Scope

Build the buyer portal: order tracking with per-item fulfillment, reviews with photo upload, favorites/wishlist synced to catalog cards, dispute and return request flows, profile management, and certificate placeholder.

## Out of Scope

- Cart/checkout/payments (Phase 5)
- Email notifications (Phase 7)
- Actual certificate PDF generation (Phase 8)
- Admin moderation of disputes/returns (Phase 6)

---

## 1. My Orders (`/portal/comprador/pedidos`)

### Order List
- All orders for the buyer, sorted by newest
- Each: order number, date, total (formatCLP), status badge, item count
- Click → detail page

### Order Detail (`/portal/comprador/pedidos/[id]`)
- Order number, date, shipping address
- Items grouped by artisan (since each ships separately)
- Per item: product name, price, quantity, fulfillment status badge, tracking info
- If SHIPPED: tracking number + carrier as clickable link (placeholder — real tracking URL later)
- If DELIVERED: show delivery date

**Conditional Actions per OrderItem:**
- **"Dejar Review"** — visible if:
  - fulfillmentStatus === DELIVERED
  - deliveredAt + 3 days has passed (NOT before)
  - No existing review for this user+product
- **"Solicitar Devolución"** — visible if:
  - fulfillmentStatus === DELIVERED
  - deliveredAt + 14 days has NOT passed
  - product.isCustomMade === false
  - If isCustomMade: show "Pieza personalizada · Sin devolución" badge instead
- **"Abrir Disputa"** — visible if:
  - fulfillmentStatus === DELIVERED
  - deliveredAt + 14 days has NOT passed
  - No open dispute for this order
- **"Ver Certificado"** — visible if:
  - Certificate exists for this product
  - For now: placeholder link "Certificado disponible próximamente"

---

## 2. Reviews

### Leave Review Form (modal or inline on order detail)
- Rating: 1-5 stars (clickable)
- Comment: textarea (with anti-contact filter — Phase 7 will add the actual filter, but the check placeholder goes here)
- Photo upload: upload images to R2 at `reviews/{reviewId}/{uuid}.{ext}` — up to 4 photos
- isVerified: automatically true (only reachable if they bought)
- Server action: creates Review + links to product and artisan
- After submit: redirect back to order detail with success message

### Contact Filter Placeholder
- In the review submission action: add a comment with `// TODO Phase 7: Apply contact-filter.ts here`
- The form should have the textarea ready for filtering

---

## 3. Favorites / Wishlist (`/portal/comprador/favoritos`)

### Favorite Toggle
- Server action: `toggleFavorite(productId)` — adds or removes Favorite record
- Works from: ProductCard heart button, product detail page
- Requires authentication — if not logged in, redirect to login

### Favorites Page
- Grid of favorited products (same ProductCard component)
- Empty state: "Aún no tienes piezas guardadas"

### ProductCard Integration
- Update ProductCard to show filled heart if product is in user's favorites
- This requires passing `isFavorited` boolean to ProductCard
- On catalog/home pages: fetch user's favorite productIds, pass to cards

---

## 4. Disputes (`/portal/comprador/pedidos/[id]/disputa`)

### Open Dispute Form
- Reason select: NOT_AS_DESCRIBED, NOT_RECEIVED, DAMAGED, WRONG_ITEM, OTHER
- Description textarea
- Photo upload: evidence images to R2 at `disputes/{disputeId}/{uuid}.{ext}`
- Creates Dispute with status OPEN
- Redirect to order detail with success

---

## 5. Return Requests (`/portal/comprador/pedidos/[id]/devolucion`)

### Request Return Form
- Only accessible if product.isCustomMade === false
- Reason select: NOT_AS_DESCRIBED, DAMAGED_ON_ARRIVAL, WRONG_ITEM, BUYER_REGRET, DEFECTIVE, OTHER
- Description textarea (optional)
- Photo upload to R2
- Auto-assigns shippingPaidBy based on reason:
  - BUYER_REGRET → BUYER
  - Everything else → PLATFORM
- Creates ReturnRequest with status REQUESTED
- Redirect to order detail

---

## 6. Buyer Profile (`/portal/comprador/perfil`)

- Name, email (read-only), saved shipping address
- Change password form (current password + new + confirm)
- Server action to update

---

## Verification Criteria

1. Orders page shows orders with correct per-item fulfillment status
2. "Dejar Review" appears only 3+ days after delivery, only if no existing review
3. Review form with 1-5 stars and photo upload works
4. "Solicitar Devolución" NOT visible for isCustomMade products
5. "Abrir Disputa" visible within 14 days of delivery
6. Favorites toggle works on ProductCard and persists
7. Favorites page shows saved products
8. Catalog/home ProductCards show filled heart for favorited items
9. Dispute and return request forms create records correctly
10. Profile page saves changes
