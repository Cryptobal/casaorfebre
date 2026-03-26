# Phase 3: Portal del Orfebre — Design Spec

**Project:** Casa Orfebre
**Phase:** 3 of 9 — Portal del Orfebre
**Date:** 2026-03-26
**Status:** Approved

---

## Scope

Build the artisan portal: dashboard, product CRUD with image upload to Cloudflare R2, photography guide, order management, Q&A inbox, finances overview, and public profile editor. All behind authentication requiring role ARTISAN with status APPROVED.

## Out of Scope

- Admin moderation workflows (Phase 6)
- Cart/checkout/payments (Phase 5)
- Email notifications (Phase 7)
- Certificates (Phase 8)
- Reviews management (Phase 4)

---

## 1. R2 Image Upload (`lib/r2.ts` + `app/api/upload/route.ts`)

### R2 Client Setup
- Use `@aws-sdk/client-s3` (S3-compatible) with R2 credentials from env.local
- Credentials: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET_NAME`
- `R2_PUBLIC_URL` is empty — for now, serve images via a signed URL or construct the URL as `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`

### Upload API Route
- `POST /api/upload` — accepts `multipart/form-data`
- Requires authenticated session (check with `auth()`)
- Accepts: image files (jpg, png, webp), max 10MB each
- Generates unique key: `products/{productId}/{uuid}.{ext}`
- Uploads to R2 via PutObjectCommand
- Returns: `{ url: string, key: string }`
- Creates `ProductImage` record with `status: PENDING_REVIEW`

### Client Upload Component
- Drag & drop zone + file input
- Preview thumbnails with upload progress
- Reorderable (drag to reorder, updates `position` field)
- Delete button per image
- Photography Guide modal triggered by info button

---

## 2. Photography Guide (Modal)

Shown when artisan clicks info icon next to "Subir fotos" heading:
- **Resolución mínima:** 1200 x 1600 px (formato retrato 3:4)
- **Fondo:** neutro, idealmente blanco o gris claro, sin distracciones
- **Iluminación:** luz natural o luz difusa, sin sombras duras ni flash directo
- **Tomas recomendadas:**
  1. Foto general de la pieza completa
  2. Foto de detalle/textura
  3. Foto con escala (en mano, cuello, etc.)
  4. Foto del cierre/terminación
- **Prohibido:** filtros de Instagram, logos, marcas de agua, texto sobre imagen
- Clean modal design, dismissible, with visual examples placeholder

---

## 3. Artisan Dashboard (`/portal/orfebre`)

Requires: session.user.role === "ARTISAN", artisan.status === "APPROVED"

### Layout
- Stats cards row: ventas del mes, pedidos pendientes, productos activos, rating
- Alert banners: pedidos sin confirmar, preguntas sin responder, productos rechazados

### Stats (from DB)
- Ventas del mes: count of OrderItems where artisanId = current, createdAt this month
- Pedidos pendientes: OrderItems with fulfillmentStatus PENDING
- Productos activos: Products with status APPROVED
- Rating: artisan.rating

---

## 4. Product CRUD (`/portal/orfebre/productos`)

### Product List (`/portal/orfebre/productos`)
- Table/list of artisan's products
- Columns: image thumbnail, name, category, price, status (badge), stock, actions
- Status badges with colors: DRAFT (gray), PENDING_REVIEW (yellow), APPROVED (green), REJECTED (red), PAUSED (blue), SOLD_OUT (dark)
- Actions: edit, pause/resume, view rejection reason

### Create Product (`/portal/orfebre/productos/nuevo`)
- Form fields:
  - Nombre (text input)
  - Descripción (textarea)
  - Historia de la pieza (optional textarea)
  - Categoría (select from ProductCategory enum)
  - Materiales (multi-input, add/remove tags)
  - Técnica (text input, optional)
  - Precio CLP (number input, formatted)
  - Precio comparación (optional number)
  - ¿Pieza única? (toggle) → if no: editionSize + stock inputs
  - ¿Pieza personalizada/a pedido? (toggle `isCustomMade`) → shows note: "Las piezas personalizadas no admiten devolución. Esto se indicará al comprador."
  - Dimensiones (text, optional)
  - Peso en gramos (number, optional)
  - Imágenes: upload component with photography guide
- Save as DRAFT button
- "Enviar a Revisión" button → status PENDING_REVIEW
- Server action for form submission

### Edit Product (`/portal/orfebre/productos/[id]`)
- Same form, pre-filled
- If APPROVED and material fields change → reverts to PENDING_REVIEW
- If REJECTED: show admin rejection notes prominently
- Can add/remove/reorder images

---

## 5. Order Management (`/portal/orfebre/pedidos`)

### Order List
- Table of OrderItems where artisanId = current artisan
- Columns: order number, product name, date, fulfillment status, tracking
- Filterable by status: Todos, Pendientes, Preparando, Despachados, Entregados
- Sorted by createdAt desc

### Order Detail (`/portal/orfebre/pedidos/[id]`)
- Shows: order number, date, product(s), quantity, price
- Shipping info: **name and address ONLY** — NEVER email or phone
- Fulfillment actions:
  - PENDING → "Confirmar preparación" button (→ PREPARING)
  - PREPARING → "Marcar como despachado" button → form: tracking number + carrier select (Chilexpress, Starken, Blue Express, Otro)
  - SHIPPED → show tracking info, waiting for delivery
- Timer visual: days since order (warn at 3 and 5 days)

---

## 6. Questions Inbox (`/portal/orfebre/preguntas`)

- List of ProductQuestions where artisanId = current
- Filter: sin responder / respondidas
- Each shows: product name, question text, date, buyer name
- Inline answer textarea + submit (with anti-contact filter placeholder — actual filter in Phase 7)
- Server action to save answer

---

## 7. Finances (`/portal/orfebre/finanzas`)

- Summary cards: total ventas, comisiones pagadas, balance pendiente
- Table of recent sales: date, product, sale price, commission rate, commission amount, net payout
- Commission info: "Tu comisión es del X%. Esto incluye el procesamiento de pagos."
- Note: actual payouts not implemented until Phase 5 (MercadoPago), this is display only from existing data

---

## 8. Profile Editor (`/portal/orfebre/perfil`)

- Edit: displayName, bio, story, specialty, materials, location
- Profile image upload (to R2, separate from product images)
- Workshop images upload (multiple, to R2)
- Video URL (text input, optional)
- Preview link: "Ver cómo se ve tu perfil" → opens `/orfebres/[slug]` in new tab
- Server action to save

---

## Verification Criteria

1. R2 upload works — image appears in bucket, URL accessible
2. Photography guide modal displays correctly
3. Product CRUD: create draft, edit, send to review, view rejection
4. Images upload with PENDING_REVIEW status
5. isCustomMade toggle shows warning note
6. Order list shows orders, detail shows shipping WITHOUT buyer email/phone
7. Questions inbox with inline answer
8. Finances displays commission breakdown
9. Profile editor saves and reflects on public page
10. All pages require ARTISAN role + APPROVED status
