# Phase 1: Foundation — Design Spec

**Project:** Casa Orfebre — Marketplace curado de joyería de autor
**Phase:** 1 of 9 — Foundation
**Date:** 2026-03-26
**Status:** Approved

---

## Scope

Set up the full project skeleton: Next.js 16 scaffold, complete Prisma schema with Neon migration, Auth.js v5 with Google OAuth + credentials, design system (fonts, colors, Tailwind CSS 4), layout components (navbar, footer), route group structure, and seed data. No business logic, no product pages, no payments.

## Out of Scope

- Product CRUD, catalog, search, filters
- Cart, checkout, MercadoPago integration
- Image uploads to R2
- Email sending via Resend
- Admin moderation workflows
- Certificates, disputes, returns
- Google Analytics integration

---

## 1. Scaffold & Tooling

### Next.js 16

- `create-next-app` with: TypeScript (strict), Tailwind CSS 4, App Router, Turbopack (default bundler), ESLint
- **No `src/` directory** — `app/`, `components/`, `lib/`, `prisma/` at project root
- `next.config.ts` — minimal, Turbopack is default in Next.js 16

### Dependencies (Phase 1 only)

| Package | Purpose |
|---------|---------|
| `prisma` | CLI for migrations |
| `@prisma/client` | ORM runtime |
| `next-auth@beta` | Auth.js v5 for Next.js |
| `@auth/prisma-adapter` | Prisma adapter for Auth.js |
| `bcryptjs` | Password hashing |
| `@types/bcryptjs` | TypeScript types |

### Project Structure

All directories created upfront. Only files marked ✅ are implemented in Phase 1; the rest are empty placeholder directories.

```
casaorfebre/
├── app/
│   ├── layout.tsx                    ✅ Root layout (fonts, metadata, body)
│   ├── globals.css                   ✅ Tailwind 4 + CSS variables + brand tokens
│   ├── (public)/
│   │   ├── layout.tsx                ✅ Navbar + Footer wrapper
│   │   ├── page.tsx                  ✅ Placeholder home (logo + "Próximamente")
│   │   ├── coleccion/
│   │   ├── orfebres/
│   │   ├── colecciones/
│   │   ├── postular/
│   │   ├── carrito/
│   │   ├── checkout/
│   │   └── garantia/
│   ├── (auth)/
│   │   ├── layout.tsx                ✅ Centered auth layout
│   │   ├── login/page.tsx            ✅ Login form (Google + credentials)
│   │   ├── registro/page.tsx         ✅ Registration form
│   │   └── verificar/
│   ├── portal/
│   │   ├── layout.tsx                ✅ Authenticated layout with sidebar placeholder
│   │   ├── orfebre/
│   │   ├── comprador/
│   │   └── admin/
│   │       └── page.tsx              ✅ Minimal admin dashboard (confirms role)
│   └── api/
│       └── auth/[...nextauth]/
│           └── route.ts              ✅ Auth.js handler
├── components/
│   ├── ui/
│   │   ├── button.tsx                ✅
│   │   ├── input.tsx                 ✅
│   │   ├── label.tsx                 ✅
│   │   └── card.tsx                  ✅
│   ├── layout/
│   │   ├── navbar.tsx                ✅
│   │   └── footer.tsx                ✅
│   ├── products/
│   ├── artisans/
│   ├── cart/
│   ├── checkout/
│   └── admin/
├── lib/
│   ├── prisma.ts                     ✅ Prisma client singleton
│   ├── auth.ts                       ✅ Auth.js config
│   ├── auth-client.ts                ✅ Client-side session provider
│   └── utils.ts                      ✅ cn() helper, formatCLP(), etc.
├── prisma/
│   ├── schema.prisma                 ✅ Complete schema (all models)
│   └── seed.ts                       ✅ Admin users + demo artisans/products
├── public/                           ✅ (already exists with brand assets)
├── proxy.ts                          ✅ Next.js 16 middleware (route protection)
├── .env.local                        ✅ (already exists with credentials)
├── .env.example                      ✅ Template without secrets
├── .gitignore                        ✅
├── next.config.ts                    ✅
├── tsconfig.json                     ✅ (from scaffold)
└── package.json                      ✅
```

---

## 2. Prisma Schema

The **complete** schema from the project spec is implemented in Phase 1. All models, enums, relations, and indexes. This includes:

- User, Account, Session (Auth.js compatible)
- Artisan, ArtisanApplication, ArtisanStatus
- Product, ProductImage, ProductCategory, ProductStatus, ImageStatus
- CartItem
- Order, OrderItem, OrderStatus, FulfillmentStatus, PayoutStatus
- ProductQuestion, Review, Favorite
- Certificate
- Dispute, DisputeReason, DisputeStatus
- ReturnRequest, ReturnReason, ReturnStatus, ReturnShippingPayer
- MembershipPlan, MembershipSubscription, MembershipStatus

**MercadoPago fields** on Artisan: `mpAccessToken`, `mpUserId`, `mpOnboarded`, `commissionRate`.
**MercadoPago fields** on Order: `mpPaymentId`, `mpMerchantOrderId`.
**MercadoPago fields** on OrderItem: `mpTransactionId`.

Migration: `npx prisma migrate dev --name init` against Neon.

---

## 3. Auth.js v5

### Configuration (`lib/auth.ts`)

- **PrismaAdapter** connected to Neon via `lib/prisma.ts`
- **Providers:**
  - `Google` — using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
  - `Credentials` — email + password, lookup user by email, verify with `bcryptjs.compare()`
- **Session strategy:** JWT (required for credentials provider)
- **Callbacks:**
  - `jwt`: attach `user.id` and `user.role` to token
  - `session`: expose `token.id` and `token.role` on `session.user`
- **Pages:** custom sign-in at `/login`

### Admin Auto-Detection

In the `jwt` callback, after a user signs in via Google OAuth, check if their email matches the admin list:

```
ADMIN_EMAILS = ["carlos.irigoyen@gmail.com", "camilatorrespuga@gmail.com"]
```

If the user's email is in the list and their role is not ADMIN, update the database role to ADMIN. This ensures these two users are always recognized as ADMIN regardless of how they were created.

### Route Protection (`proxy.ts`)

Next.js 16 uses `proxy.ts` (not `middleware.ts`). It:
- Allows all public routes: `/`, `/coleccion/*`, `/orfebres/*`, `/login`, `/registro`, etc.
- Requires authentication for `/portal/*`
- Redirects unauthenticated users to `/login`
- Does NOT enforce role-based access at the proxy level (that's done in page components)

### Session Provider (`lib/auth-client.ts`)

A `"use client"` `SessionProvider` wrapper that wraps the app in Auth.js's `SessionProvider` for `useSession()` access in client components.

### Auth Pages

**Login (`app/(auth)/login/page.tsx`):**
- Logo centered at top
- "Iniciar Sesión" heading (Cormorant Garamond)
- Google OAuth button (styled, prominent)
- Divider "o"
- Email + password form
- Link to "/registro"
- Server action for credentials login

**Register (`app/(auth)/registro/page.tsx`):**
- Logo centered at top
- "Crear Cuenta" heading
- Google OAuth button
- Divider "o"
- Name + email + password + confirm password form
- Server action: hash password with bcryptjs, create user with role BUYER
- Link to "/login"

---

## 4. Design System

### Fonts

Loaded via `next/font/google` in `app/layout.tsx`:
- `Cormorant Garamond`: weights 300, 400, 500, 600 + italic variants
- `Outfit`: weights 200, 300, 400, 500

Assigned to CSS variables `--font-serif` and `--font-sans`. Tailwind references these.

### Colors (CSS Custom Properties in `globals.css`)

```css
@theme {
  --color-text: #1a1a18;
  --color-accent: #8B7355;
  --color-background: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-text-secondary: #6b6860;
  --color-text-tertiary: #9e9a90;
  --color-border: #e8e5df;
  --font-family-serif: var(--font-serif);
  --font-family-sans: var(--font-sans);
}
```

### UI Components

All hand-built (no shadcn dependency for now — keeping it minimal):

**Button:** Variants `primary` (accent bg), `secondary` (border), `ghost` (text only). Sizes `sm`, `md`, `lg`. Includes loading state with spinner.

**Input:** Styled text input with brand border color, focus ring in accent. Supports `error` state.

**Label:** Simple styled label tied to form fields.

**Card:** Container with surface bg, subtle border, rounded corners, optional padding.

---

## 5. Layout Components

### Navbar

- **Left:** Logo compact SVG (`casaorfebre-logo-compact.svg`), links to `/`
- **Center:** Nav links — "Colección" (`/coleccion`), "Orfebres" (`/orfebres`), "Postular" (`/postular`)
- **Right:** Cart icon (placeholder, no functionality), Login button or user avatar dropdown
- **Behavior:** `sticky top-0`, `backdrop-blur-md`, `bg-background/80`, subtle bottom border
- **Mobile:** Hamburger menu → full-screen overlay with nav links

### Footer

- **4 columns:**
  - Col 1: Logo + "Joyería de Autor" tagline
  - Col 2: "Explorar" — Colección, Orfebres, Nuevas Piezas
  - Col 3: "Para Orfebres" — Postular, Portal Orfebre
  - Col 4: "Soporte" — Garantía, Contacto
- **Bottom bar:** "© 2026 Casa Orfebre" left, "Desarrollado por LX3.ai" right
- **Background:** slightly darker than page (`bg-surface` with border-top)

---

## 6. Route Groups & Layouts

### `(public)` group
- Layout: Navbar at top, `<main>` in center, Footer at bottom
- Home page: editorial placeholder with logo, tagline, "Próximamente" message

### `(auth)` group
- Layout: Centered vertically and horizontally, no navbar/footer, subtle background
- Max-width container for auth forms

### `portal/` segment
- Layout: requires authenticated session (checked server-side with `auth()`)
- Sidebar placeholder (text links to sub-sections)
- If unauthenticated: redirect handled by `proxy.ts`

### `portal/admin/page.tsx`
- Minimal page: checks `session.user.role === "ADMIN"`, shows "Panel Admin — Próximamente"
- If not ADMIN: shows "No autorizado" or redirects

---

## 7. Seed Data (`prisma/seed.ts`)

### Admin Users (2)

| Email | Name | Role |
|-------|------|------|
| carlos.irigoyen@gmail.com | Carlos Irigoyen | ADMIN |
| camilatorrespuga@gmail.com | Camila Torres | ADMIN |

Both created with `role: ADMIN`, no password (Google OAuth only). When they sign in with Google, the Auth.js callback detects their email and ensures role is ADMIN.

### Demo Artisans (3-4)

Fictional Chilean artisans with complete profiles:
- Slugs, display names, bios, locations, specialties, materials
- Status: APPROVED
- Each linked to a User with role ARTISAN and a hashed password for testing

### Demo Products (8-10)

Variety across categories (AROS, COLLAR, ANILLO, PULSERA, etc.):
- Realistic names, descriptions, Chilean prices (CLP)
- Mix of `isUnique: true` and edition pieces
- Status: APPROVED
- Placeholder image URLs (can point to `/placeholder.jpg` or empty array)

### Seed Execution

Configured in `package.json`:
```json
"prisma": { "seed": "npx tsx prisma/seed.ts" }
```

Run with `npx prisma db seed`.

---

## 8. Utilities (`lib/utils.ts`)

- `cn(...inputs)` — class name merger using `clsx` + `tailwind-merge`
- `formatCLP(amount: number)` — formats integer to Chilean peso: `$89.000`
- `slugify(text: string)` — URL-safe slug from Spanish text

Dependencies to add: `clsx`, `tailwind-merge`.

---

## 9. Environment & Git

### `.env.example`
Copy of all env var keys from `.env.local` with empty values and comments.

### `.gitignore`
Standard Next.js gitignore + `.env*.local`, `node_modules`, `.next`, `prisma/*.db`.

### Git Init
Initialize repo, initial commit with all Phase 1 files.

---

## Verification Criteria

Phase 1 is complete when:

1. `npm run dev` starts without errors on `localhost:3000`
2. Home page renders with correct fonts, colors, navbar, footer
3. Google OAuth login works → session created → user in DB
4. Credentials registration works → user created with hashed password
5. Credentials login works → session created
6. Admin emails auto-promoted to ADMIN role on first login
7. `/portal/admin` accessible only to ADMIN users
8. `/portal/*` redirects to `/login` when unauthenticated
9. Prisma schema migrated to Neon with all tables
10. `npx prisma db seed` populates admin users + demo data
11. Mobile navbar works (hamburger menu)
12. All brand colors and fonts render correctly
