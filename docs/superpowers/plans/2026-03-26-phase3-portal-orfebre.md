# Phase 3: Portal del Orfebre — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete artisan portal — R2 image uploads, product CRUD, order management, Q&A inbox, finances, and profile editor.

**Architecture:** Server Components for pages, Server Actions for mutations, R2 via @aws-sdk/client-s3, client components for upload/forms. All pages check session role ARTISAN + status APPROVED.

**Tech Stack:** Next.js 16, Prisma 7, @aws-sdk/client-s3 (R2), Server Actions, React 19 useActionState

---

## File Map

| File | Responsibility |
|------|---------------|
| `lib/r2.ts` | R2 client + upload/delete helpers |
| `app/api/upload/route.ts` | Image upload API endpoint |
| `components/products/image-upload.tsx` | Drag-drop upload with preview |
| `components/products/photography-guide.tsx` | Photography guide modal |
| `lib/queries/orders.ts` | Order query functions for artisan |
| `lib/actions/products.ts` | Server actions: create, update, submit product |
| `lib/actions/orders.ts` | Server actions: update fulfillment |
| `lib/actions/questions.ts` | Server action: answer question |
| `lib/actions/profile.ts` | Server action: update artisan profile |
| `app/portal/orfebre/page.tsx` | Dashboard |
| `app/portal/orfebre/productos/page.tsx` | Product list |
| `app/portal/orfebre/productos/nuevo/page.tsx` | Create product form |
| `app/portal/orfebre/productos/[id]/page.tsx` | Edit product form |
| `app/portal/orfebre/productos/product-form.tsx` | Shared form component |
| `app/portal/orfebre/pedidos/page.tsx` | Orders list |
| `app/portal/orfebre/pedidos/[id]/page.tsx` | Order detail |
| `app/portal/orfebre/preguntas/page.tsx` | Questions inbox |
| `app/portal/orfebre/finanzas/page.tsx` | Finances overview |
| `app/portal/orfebre/perfil/page.tsx` | Profile editor |

---

### Task 1: R2 Client and Upload API

**Files:**
- Create: `lib/r2.ts`
- Create: `app/api/upload/route.ts`

**Dependencies to install:** `@aws-sdk/client-s3`

- [ ] **Step 1: Install S3 SDK**

```bash
npm install @aws-sdk/client-s3
```

- [ ] **Step 2: Create R2 client helper**

`lib/r2.ts`:
- Initialize S3Client with R2 credentials from env
- Export `uploadToR2(file: Buffer, key: string, contentType: string)` — PutObjectCommand
- Export `deleteFromR2(key: string)` — DeleteObjectCommand
- Export `getR2Url(key: string)` — constructs public URL
- The URL format for R2: since R2_PUBLIC_URL is empty, use the R2 endpoint directly or construct as needed. For development, the URL will be `${R2_ENDPOINT}/${key}` — but R2 endpoints need public access configured. For now, store the key and construct URLs later when R2_PUBLIC_URL is set up. Use a helper that falls back gracefully.

```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(buffer: Buffer, key: string, contentType: string) {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return getR2Url(key);
}

export async function deleteFromR2(key: string) {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }));
}

export function getR2Url(key: string) {
  if (process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
  // Fallback: store just the key, resolve URL later
  return `r2://${key}`;
}
```

- [ ] **Step 3: Create upload API route**

`app/api/upload/route.ts`:
- POST handler, accepts FormData with `file` field and `productId` field
- Validates: authenticated session, file is image (jpg/png/webp), max 10MB
- Generates key: `products/${productId}/${crypto.randomUUID()}.${ext}`
- Uploads to R2
- Creates ProductImage record with status PENDING_REVIEW
- Returns JSON: `{ url, imageId }`

Remove any .gitkeep from `app/api/upload/` first.

- [ ] **Step 4: Commit**

```bash
git add lib/r2.ts app/api/upload/ package.json package-lock.json
git commit -m "feat: add R2 image upload — client helper and API route"
```

---

### Task 2: Image Upload Component + Photography Guide

**Files:**
- Create: `components/products/image-upload.tsx`
- Create: `components/products/photography-guide.tsx`

- [ ] **Step 1: Create Photography Guide modal**

`components/products/photography-guide.tsx`:
- `"use client"` component
- Button triggers a modal (dialog element or custom overlay)
- Content:
  - Title: "Guía de Fotografía"
  - Specs list with icons/bullets:
    - Resolución mínima: 1200 x 1600 px (retrato 3:4)
    - Fondo neutro (blanco o gris claro)
    - Luz natural o difusa, sin flash directo
    - 4 tomas: general, detalle/textura, escala (en mano), cierre/terminación
    - Sin filtros, logos, marcas de agua ni texto
  - Close button
- Uses brand styling: serif headings, text-secondary body

- [ ] **Step 2: Create Image Upload component**

`components/products/image-upload.tsx`:
- `"use client"` component
- Props: `productId: string`, `existingImages: ProductImage[]`, `onImagesChange: (images) => void`
- Drag & drop zone with dashed border
- File input (multiple, accept image/*)
- On drop/select: validate file type and size (max 10MB)
- Upload each file to `/api/upload` with FormData
- Show upload progress (simple loading state per image)
- Display thumbnails in a reorderable grid
- Each thumbnail: preview image, delete X button, position number
- Reorder by dragging (or simple move up/down buttons for simplicity)
- Photography Guide button/link that opens the modal
- Emits updated image list to parent

- [ ] **Step 3: Commit**

```bash
git add components/products/
git commit -m "feat: add image upload component with photography guide modal"
```

---

### Task 3: Artisan Auth Guard + Dashboard

**Files:**
- Create: `app/portal/orfebre/layout.tsx` (artisan guard)
- Modify: `app/portal/orfebre/page.tsx` (dashboard)

- [ ] **Step 1: Create artisan layout guard**

`app/portal/orfebre/layout.tsx`:
- Server Component
- Gets session via `auth()`
- Looks up artisan by `session.user.id` in prisma
- If no artisan or status !== APPROVED → redirect to `/`
- Passes artisan data to children (or stores in a way pages can access)
- Note: since we can't pass props through layouts in Next.js, each page will need to fetch its own artisan. The layout just handles the guard.

- [ ] **Step 2: Create dashboard page**

`app/portal/orfebre/page.tsx`:
- Remove .gitkeep if present
- Fetch artisan + stats:
  - Active products count (status APPROVED)
  - Pending orders (fulfillmentStatus PENDING)
  - This month's sales (OrderItems where artisanId, this month)
  - Unanswered questions count
- Display as stat cards in a responsive grid
- Alert banners if: pending orders > 0, unanswered questions > 0
- Title: "Mi Taller" (serif)

- [ ] **Step 3: Commit**

```bash
git add app/portal/orfebre/
git commit -m "feat: add artisan portal layout guard and dashboard"
```

---

### Task 4: Product CRUD — Server Actions + Form

**Files:**
- Create: `lib/actions/products.ts`
- Create: `app/portal/orfebre/productos/product-form.tsx`

- [ ] **Step 1: Create product server actions**

`lib/actions/products.ts`:
- `createProduct(formData)` — creates product as DRAFT, validates artisan ownership
- `updateProduct(id, formData)` — updates product, if APPROVED + material changes → PENDING_REVIEW
- `submitForReview(id)` — changes status to PENDING_REVIEW
- `pauseProduct(id)` / `resumeProduct(id)` — toggle PAUSED/APPROVED
- `deleteProductImage(imageId)` — deletes from R2 + DB
- `reorderImages(productId, imageIds[])` — updates position for each
- All actions verify artisan ownership via session

Key form fields parsed from FormData:
- name, description, story, category, materials (comma-separated → array), technique
- price (parse as Int), compareAtPrice
- isUnique (checkbox → boolean), editionSize, stock
- isCustomMade (checkbox → boolean), isReturnable (computed: !isCustomMade)
- dimensions, weight (parse as Float)

- [ ] **Step 2: Create shared product form component**

`app/portal/orfebre/productos/product-form.tsx`:
- `"use client"` component
- Props: `product?: Product` (for edit mode), `artisanId: string`
- Form with all fields from the spec
- Category select with ProductCategory enum values (Spanish labels)
- Materials: tag input (type + enter to add, X to remove)
- isUnique toggle → shows/hides editionSize + stock fields
- isCustomMade toggle → shows warning note: "Las piezas personalizadas no admiten devolución. Esto se indicará al comprador." (in a yellow/amber info box)
- Image upload section using ImageUpload component
- Photography Guide info button
- Two submit buttons: "Guardar Borrador" (saves as DRAFT) and "Enviar a Revisión" (saves + submits)
- Uses useActionState for form submission
- Error display for validation errors

- [ ] **Step 3: Commit**

```bash
git add lib/actions/products.ts app/portal/orfebre/productos/product-form.tsx
git commit -m "feat: add product server actions and form component"
```

---

### Task 5: Product Pages (List, Create, Edit)

**Files:**
- Create: `app/portal/orfebre/productos/page.tsx`
- Create: `app/portal/orfebre/productos/nuevo/page.tsx`
- Create: `app/portal/orfebre/productos/[id]/page.tsx`

- [ ] **Step 1: Product list page**

`app/portal/orfebre/productos/page.tsx`:
- Fetch artisan's products (all statuses)
- Table/cards with: thumbnail, name, category, price (formatCLP), status badge, stock, actions
- Status badges: DRAFT (gray), PENDING_REVIEW (amber), APPROVED (green), REJECTED (red), PAUSED (blue), SOLD_OUT (zinc)
- Actions: Edit link, Pause/Resume button, rejection reason popup if REJECTED
- "Crear nueva pieza" button → `/portal/orfebre/productos/nuevo`

- [ ] **Step 2: Create product page**

`app/portal/orfebre/productos/nuevo/page.tsx`:
- Renders ProductForm with no initial product
- Title: "Nueva Pieza"

- [ ] **Step 3: Edit product page**

`app/portal/orfebre/productos/[id]/page.tsx`:
- Fetch product by ID, verify artisan ownership
- If REJECTED: show admin notes prominently in red/amber banner
- Renders ProductForm with existing product data
- Title: "Editar Pieza"

- [ ] **Step 4: Commit**

```bash
git add app/portal/orfebre/productos/
git commit -m "feat: add product list, create, and edit pages"
```

---

### Task 6: Order Management

**Files:**
- Create: `lib/queries/orders.ts`
- Create: `lib/actions/orders.ts`
- Create: `app/portal/orfebre/pedidos/page.tsx`
- Create: `app/portal/orfebre/pedidos/[id]/page.tsx`

- [ ] **Step 1: Order queries**

`lib/queries/orders.ts`:
- `getArtisanOrders(artisanId, statusFilter?)` — OrderItems with order relation, filtered by artisan
- `getArtisanOrderDetail(orderItemId, artisanId)` — single OrderItem with full order (shipping info)

- [ ] **Step 2: Order actions**

`lib/actions/orders.ts`:
- `confirmPreparation(orderItemId)` — PENDING → PREPARING
- `markAsShipped(orderItemId, trackingNumber, trackingCarrier)` — PREPARING → SHIPPED, sets shippedAt
- All verify artisan ownership

- [ ] **Step 3: Orders list page**

`app/portal/orfebre/pedidos/page.tsx`:
- Table: order number, product name, date, status badge, tracking
- Filter tabs: Todos, Pendientes, Preparando, Despachados, Entregados
- Status badges with appropriate colors

- [ ] **Step 4: Order detail page**

`app/portal/orfebre/pedidos/[id]/page.tsx`:
- Product info, quantity, price
- Shipping: **name + address ONLY** — no email, no phone, no buyer user data
- Fulfillment actions based on current status:
  - PENDING: "Confirmar preparación" button
  - PREPARING: "Marcar como despachado" form (tracking number + carrier select: Chilexpress, Starken, Blue Express, Otro)
  - SHIPPED: tracking info display
- Days since order with warning colors (3 days = yellow, 5 days = red)

- [ ] **Step 5: Commit**

```bash
git add lib/queries/orders.ts lib/actions/orders.ts app/portal/orfebre/pedidos/
git commit -m "feat: add artisan order management — list, detail, fulfillment actions"
```

---

### Task 7: Questions, Finances, Profile

**Files:**
- Create: `lib/actions/questions.ts`
- Create: `lib/actions/profile.ts`
- Create: `app/portal/orfebre/preguntas/page.tsx`
- Create: `app/portal/orfebre/finanzas/page.tsx`
- Create: `app/portal/orfebre/perfil/page.tsx`

- [ ] **Step 1: Questions inbox**

`lib/actions/questions.ts`:
- `answerQuestion(questionId, answer)` — saves answer, sets answeredAt

`app/portal/orfebre/preguntas/page.tsx`:
- List of questions for artisan's products
- Filter: sin responder / respondidas
- Each: product name, buyer name, question text, date
- Inline textarea for answer + submit button
- Note: anti-contact filter will be added in Phase 7

- [ ] **Step 2: Finances page**

`app/portal/orfebre/finanzas/page.tsx`:
- Summary cards: total ventas, total comisiones, pago neto estimado
- Table of OrderItems for artisan: date, product, sale price, commission rate, commission amount, artisan payout
- Commission note: "Tu comisión es del {rate}%. Esto incluye el procesamiento de pagos."
- This is display-only from existing data (actual payouts come in Phase 5)

- [ ] **Step 3: Profile editor**

`lib/actions/profile.ts`:
- `updateArtisanProfile(formData)` — updates displayName, bio, story, specialty, materials, location, videoUrl
- `updateProfileImage(formData)` — uploads to R2 at `artisans/{artisanId}/profile.{ext}`, updates artisan.profileImage

`app/portal/orfebre/perfil/page.tsx`:
- Form with: displayName, bio (textarea), story (textarea), specialty, materials (tag input), location, videoUrl
- Profile image upload (single image)
- Workshop images upload (multiple) — placeholder for now, full implementation similar to product images
- "Ver mi perfil público" link → opens `/orfebres/[slug]` in new tab
- Save button with server action

- [ ] **Step 4: Commit**

```bash
git add lib/actions/questions.ts lib/actions/profile.ts app/portal/orfebre/preguntas/ app/portal/orfebre/finanzas/ app/portal/orfebre/perfil/
git commit -m "feat: add questions inbox, finances overview, and profile editor"
```

---

### Task 8: Update Portal Sidebar + Verification

**Files:**
- Modify: `app/portal/layout.tsx` — add artisan nav links

- [ ] **Step 1: Update portal sidebar**

Add navigation links for artisan role:
- Mi Taller (dashboard) → `/portal/orfebre`
- Mis Piezas → `/portal/orfebre/productos`
- Pedidos → `/portal/orfebre/pedidos`
- Preguntas → `/portal/orfebre/preguntas`
- Finanzas → `/portal/orfebre/finanzas`
- Mi Perfil → `/portal/orfebre/perfil`

- [ ] **Step 2: Update ProductCard and product detail to show real images**

When a product has images with URLs starting with `r2://` or actual URLs, show them via `next/image` instead of the placeholder. Add the R2 domain to `next.config.ts` remotePatterns.

- [ ] **Step 3: Verify all artisan portal pages**

```bash
npm run dev
```

Log in as a demo artisan (valentina@demo.casaorfebre.cl / orfebre123) and verify:
1. Dashboard shows stats
2. Product list shows products
3. Create product form works (save as draft)
4. Image upload to R2 works
5. Photography guide modal displays
6. isCustomMade toggle shows warning
7. Order management (no orders yet, but page renders)
8. Questions page renders
9. Finances page renders
10. Profile editor saves

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish artisan portal and update sidebar navigation"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | R2 upload client + API | lib/r2.ts, app/api/upload/ |
| 2 | Image upload component + photography guide | components/products/ |
| 3 | Artisan guard + dashboard | app/portal/orfebre/ layout + page |
| 4 | Product server actions + form | lib/actions/products.ts, product-form.tsx |
| 5 | Product pages (list, create, edit) | app/portal/orfebre/productos/ |
| 6 | Order management | lib/queries/orders.ts, app/portal/orfebre/pedidos/ |
| 7 | Questions, finances, profile | app/portal/orfebre/preguntas,finanzas,perfil |
| 8 | Sidebar update + verification | app/portal/layout.tsx |
