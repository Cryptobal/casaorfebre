# Phase 6: Admin Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Complete admin panel — dashboard KPIs, artisan applications, product/photo moderation, artisan/order/dispute/return management, finances.

**Architecture:** Server Components for all pages, Server Actions for mutations. Admin guard at layout level (role === ADMIN). All queries in dedicated admin query files.

**Tech Stack:** Next.js 16, Prisma 7, Server Actions

---

## File Map

| File | Responsibility |
|------|---------------|
| `lib/queries/admin.ts` | All admin query functions |
| `lib/actions/admin.ts` | All admin server actions |
| `app/portal/admin/layout.tsx` | Admin role guard |
| `app/portal/admin/page.tsx` | Dashboard with KPIs + alerts |
| `app/portal/admin/postulaciones/page.tsx` | Application queue |
| `app/portal/admin/productos/page.tsx` | Product moderation queue |
| `app/portal/admin/fotos/page.tsx` | Photo review queue |
| `app/portal/admin/orfebres/page.tsx` | Artisan management |
| `app/portal/admin/pedidos/page.tsx` | All orders |
| `app/portal/admin/disputas/page.tsx` | Dispute resolution |
| `app/portal/admin/devoluciones/page.tsx` | Return management |
| `app/portal/admin/finanzas/page.tsx` | Finances overview |

---

### Task 1: Admin Queries

**File:** `lib/queries/admin.ts`

All query functions for the admin panel:

- `getAdminDashboardStats()` — GMV month, commissions, sales count, avg ticket, active artisans, published products, pending applications, pending products, pending photos, open disputes, late shipments
- `getPendingApplications()` — ArtisanApplications with status PENDING
- `getPendingProducts()` — Products with status PENDING_REVIEW, include artisan + images
- `getPendingPhotos(filter?)` — ProductImages with status PENDING_REVIEW (or filter), include product + artisan
- `getAllArtisans()` — All artisans with metrics (_count products, orderItems, reviews)
- `getAllOrders(filter?)` — All orders with items, filterable by status
- `getLateShipments()` — OrderItems with fulfillmentStatus PENDING/PREPARING and createdAt > 5 days ago
- `getOpenDisputes()` — Disputes with status OPEN or UNDER_REVIEW, include order + user
- `getPendingReturns()` — ReturnRequests with status REQUESTED/APPROVED, include order info
- `getFinanceStats()` — GMV total, commissions gross, net (gross minus estimated MP cost ~4.5%)

Commit: `git add lib/queries/admin.ts && git commit -m "feat: add admin query functions"`

---

### Task 2: Admin Server Actions

**File:** `lib/actions/admin.ts`

All admin mutations (each verifies session.user.role === "ADMIN"):

**Applications:**
- `approveApplication(applicationId)` — creates User (ARTISAN role) + Artisan (APPROVED), marks application APPROVED
- `rejectApplication(applicationId, reason)` — marks REJECTED with notes

**Products:**
- `approveProduct(productId)` — sets APPROVED + publishedAt
- `rejectProduct(productId, notes)` — sets REJECTED + adminNotes

**Photos:**
- `approvePhoto(imageId)` — sets APPROVED
- `approvePhotosBatch(imageIds[])` — batch approve
- `rejectPhoto(imageId, reason)` — sets REJECTED
- `replacePhoto(imageId, formData)` — uploads new image to R2, saves original as originalUrl, updates url, sets REPLACED

**Artisans:**
- `updateArtisanCommission(artisanId, rate)` — updates commissionRate
- `suspendArtisan(artisanId)` — sets status SUSPENDED

**Disputes:**
- `resolveDispute(disputeId, resolution, status)` — updates dispute with resolution text and status (RESOLVED_REFUND, RESOLVED_PARTIAL_REFUND, RESOLVED_NO_REFUND)

**Returns:**
- `approveReturn(returnRequestId)` — sets APPROVED
- `rejectReturn(returnRequestId, reason)` — sets REJECTED with adminNotes
- `processRefund(returnRequestId, amount)` — sets REFUNDED with refundAmount

Commit: `git add lib/actions/admin.ts && git commit -m "feat: add admin server actions"`

---

### Task 3: Admin Layout + Dashboard + Applications

**Files:**
- Modify: `app/portal/admin/layout.tsx` (create admin guard)
- Modify: `app/portal/admin/page.tsx` (dashboard with KPIs)
- Create: `app/portal/admin/postulaciones/page.tsx`

**Admin Layout:**
Server Component guard:
- `auth()` → check `session.user.role === "ADMIN"` → redirect if not
- Render children

**Dashboard:**
- Title: "Panel Administrativo"
- KPI cards grid (3x2): GMV mes (formatCLP), Comisiones, Ventas, Ticket Promedio, Orfebres Activos, Productos
- Alert banners: postulaciones pendientes (count), productos por aprobar, fotos por revisar, disputas abiertas, despachos atrasados
- Each alert links to corresponding admin page

**Applications Page:**
- Title: "Postulaciones de Orfebres"
- Queue of pending applications
- Each shows: name, email, location, specialty, bio, materials, portfolio images list
- Two buttons: "Aprobar" (green) and "Rechazar" (red, opens textarea for reason)
- On approve: calls approveApplication → creates user + artisan
- Empty state: "No hay postulaciones pendientes"

Commit: `git add app/portal/admin/ && git commit -m "feat: add admin dashboard with KPIs, alerts, and application queue"`

---

### Task 4: Product + Photo Moderation

**Files:**
- Create: `app/portal/admin/productos/page.tsx`
- Create: `app/portal/admin/fotos/page.tsx`

**Product Moderation:**
- Title: "Moderación de Productos"
- Queue of PENDING_REVIEW products
- Each: product name, artisan name, category, price, description preview, image count
- Expand to see full details: all images, full description, materials
- Buttons: "Aprobar" (green) / "Rechazar" (red, textarea for notes)
- Empty state: "No hay productos pendientes"

**Photo Review Queue:**
- Title: "Revisión de Fotos"
- Filter tabs: Pendientes / Aprobadas / Rechazadas / Reemplazadas
- Grid of image thumbnails (using ImagePlaceholder since images are on R2)
- Each: thumbnail, product name, artisan name
- Actions per image:
  - "Aprobar" → status APPROVED
  - "Rechazar" → opens input for reason, status REJECTED
  - "Descargar" → link to image URL
  - "Reemplazar" → file upload input, uploads new version, original saved
- Batch actions: select multiple (checkboxes) → "Aprobar Seleccionadas" button
- This is a more complex page — needs client interactivity for selection and batch

Commit: `git add app/portal/admin/productos/ app/portal/admin/fotos/ && git commit -m "feat: add product moderation and photo review queues"`

---

### Task 5: Artisan + Order Management

**Files:**
- Create: `app/portal/admin/orfebres/page.tsx`
- Create: `app/portal/admin/pedidos/page.tsx`

**Artisan Management:**
- Title: "Gestión de Orfebres"
- Table: name, location, rating, review count, total sales, product count, commission rate, status
- Actions: edit commission (inline number input + save), suspend button
- Late shipment flag on artisans with overdue orders

**Order Management:**
- Title: "Todos los Pedidos"
- Filter by: status, artisan, date range (simplified: select)
- Table: order number, date, buyer name, total, status, items count
- Highlight late shipments (>5 days since order, not shipped) in red/amber
- Click expands to show items with per-item fulfillment status

Commit: `git add app/portal/admin/orfebres/ app/portal/admin/pedidos/ && git commit -m "feat: add artisan and order management pages"`

---

### Task 6: Disputes + Returns + Finances

**Files:**
- Create: `app/portal/admin/disputas/page.tsx`
- Create: `app/portal/admin/devoluciones/page.tsx`
- Create: `app/portal/admin/finanzas/page.tsx`

**Disputes:**
- Title: "Disputas"
- Queue of OPEN + UNDER_REVIEW disputes
- Each: order number, buyer name, reason (Spanish), description, evidence images
- Resolution form: select status (Reembolso Total, Parcial, Sin Reembolso, Cerrar), resolution notes textarea
- Calls resolveDispute action

**Returns:**
- Title: "Devoluciones"
- Queue of REQUESTED + APPROVED returns
- Each: order item, product name, buyer, reason, who pays shipping, photos
- Actions: Aprobar / Rechazar (with reason) / Procesar Reembolso (amount input)
- Status tracking through the return flow

**Finances:**
- Title: "Finanzas"
- Summary cards: GMV Total, Comisiones Brutas, Costo Estimado MP (~4.5%), Comisiones Netas
- Table of recent OrderItems with: date, product, artisan, sale amount, commission, payout, payout status
- Monthly summary if data exists

Commit: `git add app/portal/admin/disputas/ app/portal/admin/devoluciones/ app/portal/admin/finanzas/ && git commit -m "feat: add dispute resolution, return management, and finances overview"`

---

### Task 7: Sidebar Update + Verification

**Modify:** `app/portal/layout.tsx` — add admin nav links:
- Dashboard, Postulaciones, Productos, Fotos, Orfebres, Pedidos, Disputas, Devoluciones, Finanzas

Verify all admin pages respond (expect 307 for unauthenticated).

Commit: `git add app/portal/layout.tsx && git commit -m "feat: expand admin sidebar with all management sections"`

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Admin queries |
| 2 | Admin server actions |
| 3 | Dashboard + Applications |
| 4 | Product + Photo moderation |
| 5 | Artisan + Order management |
| 6 | Disputes + Returns + Finances |
| 7 | Sidebar + Verification |
