# Buyer Activity Hub — Design Spec

**Date:** 2026-04-13
**Status:** Approved
**Approach:** Enfoque 1 — Modelo `ContactSubmission` nuevo + extender `Conversation` existente

---

## Problem

The admin buyers page (`/portal/admin/compradores`) shows basic buyer data (name, email, orders, spending) but no visibility into buyer interactions: product questions, conversations with artisans, and contact form submissions. Contact form submissions are email-only and not persisted in the database. There is no way for admins to have direct 1:1 conversations with buyers.

## Goals

1. Persist contact form submissions in the database with optional user linking.
2. Enable admin↔buyer 1:1 conversations using the existing messaging system.
3. Centralize all buyer interactions in the buyer detail page.
4. Add an "Activity" column to the buyers table for at-a-glance prioritization.
5. Handle contact forms from unregistered visitors gracefully.

---

## 1. Model: `ContactSubmission`

New Prisma model to persist every contact form submission.

```prisma
model ContactSubmission {
  id        String        @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String
  status    ContactStatus @default(PENDING)

  userId         String?
  user           User?         @relation(fields: [userId], references: [id])

  conversationId String?       @unique
  conversation   Conversation? @relation(fields: [conversationId], references: [id])

  createdAt DateTime @default(now())

  @@index([email])
  @@index([userId])
}

enum ContactStatus {
  PENDING
  REPLIED
  CLOSED
}
```

### Linking logic

- On save, look up `User` by email. If found, set `userId`.
- If no user exists, `userId` stays null.
- Future improvement (out of scope): auto-link when a visitor registers with a matching email.

### Changes to existing contact form action

`lib/actions/contact.ts` (`sendContactForm`):
- After validation, create a `ContactSubmission` record in the database.
- Continue sending the email to all admins as today.
- If the sender is a logged-in user, pass their `userId` directly. Otherwise, look up by email.

---

## 2. Extend `Conversation` for admin↔buyer chat

### Schema changes

```prisma
model Conversation {
  // Existing fields unchanged...
  artisanId  String?        // Was required, now optional
  artisan    Artisan?       // Was required, now optional

  // New fields
  adminId    String?
  admin      User?          @relation("AdminConversations", fields: [adminId], references: [id])

  contactSubmission ContactSubmission?

  // Remove @@unique([buyerId, artisanId])
  // Enforce uniqueness via application logic:
  //   - buyer+artisan: max 1 conversation
  //   - buyer+admin: max 1 conversation
}
```

### Conversation types

| `artisanId` | `adminId` | Type |
|-------------|-----------|------|
| present     | null      | Buyer↔Artisan (existing, unchanged) |
| null        | present   | Admin↔Buyer (new) |

### Initiation flows

1. **From buyer detail page:** "Iniciar conversación" button creates a `Conversation` with `adminId` (current admin user) + `buyerId`.
2. **From a ContactSubmission:** "Responder" button creates the conversation and links it via `conversationId` on the `ContactSubmission`. Status changes to `REPLIED`.

### Buyer experience

- Admin↔buyer conversations appear in the buyer's existing message inbox (`/portal/comprador/mensajes`).
- Displayed with a "Casa Orfebre" badge instead of an artisan name.
- Same chat UI, same message component.

### Email notification

- When admin sends a message, buyer receives an email: "Casa Orfebre te ha escrito" with a link to `/portal/comprador/mensajes/[conversationId]`.
- Uses the existing 5-minute throttle system.
- When buyer replies, admin gets notified (same system).

---

## 3. Buyer detail page: enriched with activity tabs

Page: `/portal/admin/compradores/[id]/page.tsx`

### New tabs/sections

#### Tab: Preguntas de productos
- All `ProductQuestion` records for this buyer.
- Columns: Product name, question text, answer (if any), date.
- Each row links to the product or admin question moderation page.

#### Tab: Conversaciones
- All `Conversation` records where `buyerId` matches.
- Includes both artisan conversations and admin conversations.
- Columns: Counterpart (artisan name or "Casa Orfebre"), last message preview, date, status.
- Each row links directly to the conversation thread in the admin messages view.

#### Tab: Formularios de contacto
- All `ContactSubmission` records linked by `userId` OR by email match.
- Columns: Subject, message (truncated), status badge (pending/replied/closed), date.
- If status is PENDING: "Responder" button that creates an admin↔buyer conversation and links it.
- If status is REPLIED: link to the associated conversation.

#### Tab: Chat directo
- If an admin↔buyer conversation already exists, show it inline or link to it.
- If not, "Iniciar conversación" button to create one.

---

## 4. Buyers table: Activity column

Page: `/portal/admin/compradores/page.tsx`

### New column: "Actividad"

Badge showing the count of pending interactions:
- Unanswered product questions (where `answer` is null)
- Pending contact submissions (status = PENDING)
- Unread messages in admin↔buyer conversations

### Sorting/filtering
- New filter option: "Con actividad pendiente" to surface buyers that need attention first.

---

## 5. Admin contact submissions view

### New page: `/portal/admin/contacto/page.tsx`

Lists all `ContactSubmission` records (both linked and unlinked to users).

### Filters
- Status: Pendientes / Respondidos / Cerrados / Todos

### Columns
- Name, email, subject, message (truncated), status, date.
- If `userId` is set: link to buyer detail page.
- If `userId` is null: shows name + email only.

### Actions
- **For linked submissions:** "Responder" button → creates admin↔buyer conversation + links it.
- **For unlinked submissions:** "Marcar respondido" / "Cerrar" buttons for manual status management (admin replies via email externally).

### Sidebar entry
- New entry "Contacto" in admin sidebar, with badge showing count of PENDING submissions.

---

## What does NOT change

- Buyer↔artisan chat: unchanged.
- Product questions system: unchanged (just surfaced in buyer detail).
- Order messages: untouched.
- Contact form public UI: unchanged (still sends email to admins, now also saves to DB).

## Out of scope (future improvements)

- Auto-link `ContactSubmission` when a visitor registers with matching email.
- Real-time/push notifications (currently email + portal only).
- Bulk actions on contact submissions.
