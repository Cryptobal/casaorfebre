# Phase 8: Certificados & Garantías — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Auto-generated authenticity certificates with PDF download and public QR verification, static guarantee page, product badges for return policy.

**Architecture:** Certificate auto-created on delivery (webhook or action). PDF via HTML-to-PDF API route. QR code via inline SVG generation. Static guarantee page. Badge logic in product detail.

**Tech Stack:** Next.js 16, Prisma 7, qrcode package (SVG), html-pdf-node or @react-pdf/renderer for PDF

---

## File Map

| File | Responsibility |
|------|---------------|
| `lib/certificates.ts` | Certificate generation logic |
| `lib/actions/certificates.ts` | Create certificate on delivery |
| `app/api/certificates/[code]/pdf/route.ts` | PDF download endpoint |
| `app/(public)/verificar/[code]/page.tsx` | Public certificate verification |
| `app/(public)/garantia/page.tsx` | Static guarantee page |
| `app/(public)/coleccion/[slug]/page.tsx` | Updated badges |

---

### Task 1: Certificate Generation + Verification Page

**Install:** `npm install qrcode @types/qrcode`

- [ ] **Step 1: Create certificate helper**

`lib/certificates.ts`:
```ts
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

function generateCertCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 for readability
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CO-CERT-${code}`;
}

export async function createCertificate(orderItemId: string) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      product: { select: { id: true, name: true, materials: true, technique: true } },
      artisan: { select: { displayName: true } },
    },
  });
  if (!item) return null;

  // Check if certificate already exists for this product
  const existing = await prisma.certificate.findUnique({
    where: { productId: item.productId },
  });
  if (existing) return existing;

  let code = generateCertCode();
  // Ensure uniqueness
  while (await prisma.certificate.findUnique({ where: { code } })) {
    code = generateCertCode();
  }

  return prisma.certificate.create({
    data: {
      productId: item.productId,
      orderItemId,
      code,
      materials: item.product.materials.join(", "),
      technique: item.product.technique,
      artisanName: item.artisan.displayName,
    },
  });
}

export async function generateQRCodeSVG(code: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/verificar/${code}`;
  return QRCode.toString(url, { type: "svg", margin: 1, width: 150 });
}
```

- [ ] **Step 2: Auto-create on delivery**

Update the webhook or order actions to create certificates when an item is marked DELIVERED. Specifically:

In `lib/actions/orders.ts` — doesn't have a "deliver" action yet (delivery is confirmed externally). Create a `markAsDelivered` action or trigger certificate creation when fulfillmentStatus changes.

Simplest approach: create a server action `markAsDelivered(orderItemId)` that:
1. Updates fulfillmentStatus to DELIVERED, deliveredAt to now()
2. Calls `createCertificate(orderItemId)`
3. Sends `sendOrderDeliveredEmail` to buyer

Also: Admin or artisan could mark as delivered. For now, add it as an admin action too.

- [ ] **Step 3: Public verification page**

`app/(public)/verificar/[code]/page.tsx`:
- Server Component
- Fetch certificate by code from DB
- If not found: "Certificado no encontrado" message
- If found: display certificate info:
  - "Certificado de Autenticidad Verificado" heading (serif, green check)
  - Code: CO-CERT-XXXXXXXX
  - Pieza: product name (link to product page)
  - Materiales: from certificate
  - Técnica: from certificate
  - Orfebre: artisan name
  - Fecha de emisión: formatted date
  - QR code SVG
  - "Este certificado confirma la autenticidad de esta pieza artesanal de Casa Orfebre."
- SEO metadata

- [ ] **Step 4: Commit**

```bash
git add lib/certificates.ts lib/actions/orders.ts app/\(public\)/verificar/ package.json package-lock.json
git commit -m "feat: add certificate generation, auto-creation on delivery, and public verification page"
```

---

### Task 2: PDF Download

- [ ] **Step 1: Create PDF API route**

`app/api/certificates/[code]/pdf/route.ts`:

GET handler:
1. Validate auth (buyer must own the order)
2. Fetch certificate by code
3. Generate HTML for the certificate PDF:
   - Casa Orfebre logo (text-based, serif)
   - "Certificado de Autenticidad" heading
   - Certificate code
   - Product name, materials, technique, artisan name
   - Date of issuance
   - QR code (inline SVG embedded in HTML)
   - Watermark: "CASA ORFEBRE" light text
   - Minimalist design, warm tones
4. Convert HTML to PDF using a simple approach:
   - Option A: Return HTML page styled for print (`@media print` CSS) and let browser PDF it
   - Option B: Use a lightweight server-side solution

For simplicity: Create an HTML page that's styled for printing. The "download" link opens this page which the user can Print → Save as PDF. This avoids heavy PDF dependencies.

Actually, simplest working approach: render a beautifully styled page at `/api/certificates/[code]/pdf` that returns HTML with `Content-Type: text/html` and print-optimized CSS. Add a print button that triggers `window.print()`.

- [ ] **Step 2: Update buyer order detail**

In `app/portal/comprador/pedidos/[id]/page.tsx`: replace the "Certificado disponible próximamente" text with an actual link to `/api/certificates/{code}/pdf` if the certificate exists.

- [ ] **Step 3: Commit**

```bash
git add app/api/certificates/ app/portal/comprador/pedidos/
git commit -m "feat: add certificate PDF download page"
```

---

### Task 3: Guarantee Page + Product Badge Updates

- [ ] **Step 1: Create guarantee page**

`app/(public)/garantia/page.tsx`:

Remove .gitkeep. Server Component, static editorial page:

Title: "Garantía Casa Orfebre" (Cormorant Garamond, large)

Sections (each with heading + body text):

1. **Garantía de Compra Segura**
   - Pago protegido vía Mercado Pago
   - Si no llega: reembolso completo
   - Si llega algo distinto: reembolso completo
   - Si llega dañado: reembolso o reposición
   - Plazo: 14 días desde entrega confirmada

2. **Garantía de Envío**
   - Seguimiento obligatorio con número de tracking
   - Plazo máximo despacho: 5 días hábiles
   - Si no despacha: cancelación + reembolso
   - Si se pierde en tránsito: reembolso completo

3. **Garantía de Calidad**
   - Orfebres verificados
   - Productos aprobados por admin
   - Materiales declarados
   - Certificado de autenticidad digital

4. **Política de Devoluciones**
   - Productos estándar: 14 días desde entrega
   - Productos personalizados (isCustomMade): NO admiten devolución — indicado antes de compra
   - Condiciones: sin uso, empaque original
   - Quién paga envío: error orfebre → plataforma / arrepentimiento → comprador
   - Flujo: solicitar → admin revisa → aprueba → envío vuelta → reembolso

5. **Soporte al Cliente**
   - Email: soporte@casaorfebre.cl
   - Tiempo de respuesta: 24 horas hábiles
   - La plataforma media entre comprador y orfebre

Design: generous whitespace, serif headings, body text text-secondary, accent dividers between sections. Match home page editorial quality.

SEO metadata: title "Garantía | Casa Orfebre"

- [ ] **Step 2: Verify product detail badges**

Check that `app/(public)/coleccion/[slug]/page.tsx` already handles:
- isCustomMade=false: shows "Garantía 14 días" trust icon
- isCustomMade=true: shows "Pieza personalizada · Sin devolución"

If not already correct, update. Also ensure /garantia is linked from the trust icons.

- [ ] **Step 3: Link guarantee page from footer**

Verify the footer already links to `/garantia` — it should from Phase 1.

- [ ] **Step 4: Commit**

```bash
git add app/\(public\)/garantia/ app/\(public\)/coleccion/ components/layout/
git commit -m "feat: add guarantee page with return policy and update product badges"
```

---

### Task 4: Verification

- [ ] Clean cache, start dev, verify:
  - `/verificar/FAKE-CODE` → "not found" message
  - `/garantia` → full guarantee page renders
  - Product detail badges correct
  - Certificate download link in buyer portal (placeholder until actual orders exist)

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Certificate generation + verification page |
| 2 | PDF download page |
| 3 | Guarantee page + badge updates |
| 4 | Verification |
