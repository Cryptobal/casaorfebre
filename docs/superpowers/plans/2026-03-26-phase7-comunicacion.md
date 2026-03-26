# Phase 7: Comunicación — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Anti-contact filter for all user messages + 20 Resend email templates integrated into all marketplace flows.

**Architecture:** Contact filter as pure function in `lib/contact-filter.ts`. Resend client + email functions in `lib/resend.ts`. Email templates as React components (Resend supports JSX). Filter + emails integrated into existing server actions.

**Tech Stack:** Resend SDK, React Email components, regex-based content filter

---

## File Map

| File | Responsibility |
|------|---------------|
| `lib/contact-filter.ts` | Anti-contact content filter |
| `lib/resend.ts` | Resend client singleton |
| `lib/emails/base-layout.tsx` | Shared email layout (branding) |
| `lib/emails/templates.ts` | All 20 email send functions |
| Existing `lib/actions/*.ts` | Updated with filter + email calls |

---

### Task 1: Contact Filter (`lib/contact-filter.ts`)

- [ ] **Step 1: Create the filter**

Pure function, no dependencies:

```ts
interface FilterResult {
  isClean: boolean;
  blockedReasons: string[];
}

export function checkContactInfo(text: string): FilterResult {
  const reasons: string[] = [];
  const lower = text.toLowerCase();

  // 1. Chilean phone numbers: +569, 569, 09, 56 9, with variations
  if (/(\+?56\s*9|\b09)\s*[\d\s\-\.]{7,12}/i.test(text)) {
    reasons.push("Número de teléfono detectado");
  }

  // 2. Email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(text)) {
    reasons.push("Dirección de email detectada");
  }

  // 3. URLs
  if (/https?:\/\/|www\.|\.com|\.cl|\.net|\.org|\.io/i.test(text)) {
    reasons.push("URL detectada");
  }

  // 4. Social media references
  const socialPatterns = /instagram|whatsapp|wa\.me|facebook|telegram|twitter|tiktok|linkedin|youtube/i;
  if (socialPatterns.test(text)) {
    reasons.push("Referencia a red social detectada");
  }

  // 5. Contact keywords (Spanish)
  const keywords = [
    "mi número", "mi numero", "escríbeme", "escribeme", "contáctame", "contactame",
    "te dejo mi", "por fuera", "directo", "mi whatsapp", "mi wsp", "mi insta",
    "mi instagram", "llámame", "llamame", "mándame", "mandame", "háblame", "hablame",
    "mi correo", "mi mail", "mi teléfono", "mi telefono", "mi cel", "mi celular",
  ];
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      reasons.push("Palabra clave de contacto detectada");
      break;
    }
  }

  return { isClean: reasons.length === 0, blockedReasons: reasons };
}

export const CONTACT_FILTER_MESSAGE = "Tu mensaje no puede contener datos de contacto. Toda comunicación debe realizarse a través de Casa Orfebre.";
```

- [ ] **Step 2: Commit**

```bash
git add lib/contact-filter.ts && git commit -m "feat: add anti-contact content filter"
```

---

### Task 2: Resend Client + Email Templates

**Install:** `npm install resend`

- [ ] **Step 1: Create Resend client**

`lib/resend.ts`:
```ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Casa Orfebre <onboarding@resend.dev>";
```

- [ ] **Step 2: Create email base layout**

`lib/emails/base-layout.tsx`:
A simple React component that wraps email content with Casa Orfebre branding:
- Header: "casa orfebre" text (serif style via inline CSS since email clients are limited)
- Accent line/divider
- Content slot (children)
- Footer: "Casa Orfebre · Joyería de Autor" + "casaorfebre.cl"
- Colors: inline styles matching brand (#1a1a18 text, #8B7355 accent, #FAFAF8 bg)
- Simple HTML table layout for email compatibility

- [ ] **Step 3: Create all email send functions**

`lib/emails/templates.ts`:

All functions follow pattern: `async function sendXxxEmail(to: string, data: {...})` → calls `resend.emails.send()`.

Since Resend on test domain only sends to verified emails, wrap all sends in try/catch with console.log fallback.

**20 functions:**

1. `sendBuyerWelcomeEmail(to, { name })` — "Bienvenido a Casa Orfebre"
2. `sendArtisanWelcomeEmail(to, { name })` — "¡Tu postulación fue aprobada!"
3. `sendApplicationRejectedEmail(to, { name, reason })` — "Sobre tu postulación"
4. `sendPurchaseConfirmationEmail(to, { name, orderNumber, items, total })` — "Confirmación de compra"
5. `sendNewOrderToArtisanEmail(to, { artisanName, orderNumber, items, shippingName, shippingAddress, shippingCity, shippingRegion })` — **NO buyer email/phone**
6. `sendOrderShippedEmail(to, { name, orderNumber, trackingNumber, trackingCarrier })` — "Tu pedido fue despachado"
7. `sendOrderDeliveredEmail(to, { name, orderNumber })` — "Tu pedido fue entregado" + invitación review
8. `sendNewQuestionEmail(to, { artisanName, productName, question })` — "Nueva pregunta"
9. `sendQuestionAnsweredEmail(to, { buyerName, productName, answer })` — "Tu pregunta fue respondida"
10. `sendProductApprovedEmail(to, { artisanName, productName })` — "Tu pieza fue aprobada"
11. `sendProductRejectedEmail(to, { artisanName, productName, reason })` — "Sobre tu pieza"
12. `sendShipmentAlertEmail(to, { artisanName, orderNumber, daysSince })` — "Alerta de despacho" (day 3 and 5)
13. `sendDisputeOpenedEmail(to, { artisanName, orderNumber, reason })` — "Disputa abierta"
14. `sendDisputeResolvedEmail(to, { name, orderNumber, resolution })` — "Disputa resuelta"
15. `sendPayoutReleasedEmail(to, { artisanName, amount })` — "Pago liberado"
16. `sendReturnRequestedEmail(to, { name, productName, reason })` — "Devolución solicitada" (to admin + artisan)
17. `sendReturnApprovedEmail(to, { buyerName, productName })` — "Devolución aprobada"
18. `sendReturnRejectedEmail(to, { buyerName, productName, reason })` — "Devolución rechazada"
19. `sendReturnReceivedEmail(to, { buyerName, productName })` — "Devolución recibida"
20. `sendRefundProcessedEmail(to, { buyerName, amount })` — "Reembolso procesado"

Each email: subject in Spanish, simple HTML body using base layout, relevant data displayed cleanly.

For MVP: use `resend.emails.send({ from: FROM_EMAIL, to, subject, html })` with HTML strings (simpler than React Email components, works immediately).

- [ ] **Step 4: Commit**

```bash
git add lib/resend.ts lib/emails/ package.json package-lock.json && git commit -m "feat: add Resend email client and 20 transactional email templates"
```

---

### Task 3: Integrate Contact Filter

Update these server actions to apply `checkContactInfo()` before saving:

- [ ] **Step 1: `lib/actions/questions.ts`** — in `answerQuestion`: check answer text
- [ ] **Step 2: `lib/actions/reviews.ts`** — in `createReview`: check comment text
- [ ] **Step 3: Create question submission action** — in the Q&A section, buyers need to submit questions too. Add `submitQuestion(formData)` to questions.ts: check question text with filter.

For each: if `!result.isClean`, return `{ error: CONTACT_FILTER_MESSAGE }` instead of saving.

- [ ] **Step 4: Commit**

```bash
git add lib/actions/questions.ts lib/actions/reviews.ts && git commit -m "feat: integrate anti-contact filter into questions and reviews"
```

---

### Task 4: Integrate Emails into Flows

Update existing server actions to send emails at the right moments:

- [ ] **Step 1: Registration** (`lib/actions/auth.ts`) — after register: `sendBuyerWelcomeEmail`
- [ ] **Step 2: Admin applications** (`lib/actions/admin.ts`) — after approveApplication: `sendArtisanWelcomeEmail`; after rejectApplication: `sendApplicationRejectedEmail`
- [ ] **Step 3: Admin products** (`lib/actions/admin.ts`) — after approveProduct: `sendProductApprovedEmail`; after rejectProduct: `sendProductRejectedEmail`
- [ ] **Step 4: Checkout webhook** (`app/api/mercadopago/webhook/route.ts`) — after payment approved: `sendPurchaseConfirmationEmail` to buyer + `sendNewOrderToArtisanEmail` to each artisan (NO buyer contact info)
- [ ] **Step 5: Order fulfillment** (`lib/actions/orders.ts`) — after markAsShipped: `sendOrderShippedEmail`
- [ ] **Step 6: Questions** (`lib/actions/questions.ts`) — after answerQuestion: `sendQuestionAnsweredEmail`; after submitQuestion: `sendNewQuestionEmail`
- [ ] **Step 7: Disputes** (`lib/actions/disputes.ts`) — after createDispute: `sendDisputeOpenedEmail` to artisan; admin resolveDispute: `sendDisputeResolvedEmail`
- [ ] **Step 8: Returns** (`lib/actions/returns.ts` + `lib/actions/admin.ts`) — after createReturnRequest: `sendReturnRequestedEmail`; after approveReturn: `sendReturnApprovedEmail`; after rejectReturn: `sendReturnRejectedEmail`; after processRefund: `sendRefundProcessedEmail`

All email calls wrapped in try/catch — email failure should NEVER block the primary action. Use `console.error` on failure.

Pattern for each integration:
```ts
try {
  await sendXxxEmail(email, { ... });
} catch (e) {
  console.error("Email send failed:", e);
}
```

- [ ] **Step 9: Commit**

```bash
git add lib/actions/ app/api/mercadopago/ && git commit -m "feat: integrate transactional emails into all marketplace flows"
```

---

### Task 5: Verification

- [ ] **Step 1: Clean and start**
```bash
rm -rf .next && npm run dev
```

- [ ] **Step 2: Verify pages still work**
All public and portal pages respond correctly.

- [ ] **Step 3: Commit any fixes**

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Anti-contact filter (regex-based) |
| 2 | Resend client + 20 email templates |
| 3 | Filter integration in questions + reviews |
| 4 | Email integration in all flows |
| 5 | Verification |
