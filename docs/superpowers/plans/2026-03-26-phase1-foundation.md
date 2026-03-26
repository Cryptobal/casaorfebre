# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold Casa Orfebre with Next.js 16, complete Prisma schema on Neon, Auth.js v5 (Google + credentials), brand design system, and layout components.

**Architecture:** Next.js 16 App Router with route groups `(public)`, `(auth)`, and `portal/`. Auth.js v5 with JWT strategy and Prisma adapter on Neon Postgres. Tailwind CSS 4 with brand tokens via `@theme inline`. Admin auto-detection by email in JWT callback.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Turbopack, Prisma, Neon Postgres, Auth.js v5, bcryptjs

**Note on testing:** This phase is infrastructure/scaffold — no business logic to unit test. Verification is manual: dev server starts, auth flows work, pages render correctly. TDD begins in Phase 2 when we add business logic.

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/layout.tsx` | Root layout: fonts, metadata, session provider |
| `app/globals.css` | Tailwind 4 import + brand tokens + base styles |
| `app/(public)/layout.tsx` | Navbar + Footer wrapper |
| `app/(public)/page.tsx` | Placeholder home page |
| `app/(auth)/layout.tsx` | Centered auth layout |
| `app/(auth)/login/page.tsx` | Login form (Google + credentials) |
| `app/(auth)/registro/page.tsx` | Registration form |
| `app/portal/layout.tsx` | Authenticated portal layout |
| `app/portal/admin/page.tsx` | Minimal admin dashboard |
| `app/api/auth/[...nextauth]/route.ts` | Auth.js route handler |
| `components/ui/button.tsx` | Button component |
| `components/ui/input.tsx` | Input component |
| `components/ui/label.tsx` | Label component |
| `components/ui/card.tsx` | Card component |
| `components/layout/navbar.tsx` | Site navbar |
| `components/layout/footer.tsx` | Site footer |
| `components/layout/mobile-menu.tsx` | Mobile hamburger menu |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/auth.ts` | Auth.js v5 config |
| `lib/auth-provider.tsx` | Client SessionProvider wrapper |
| `lib/utils.ts` | cn(), formatCLP(), slugify() |
| `lib/actions/auth.ts` | Server actions: register, login |
| `prisma/schema.prisma` | Complete database schema |
| `prisma/seed.ts` | Admin users + demo data |
| `proxy.ts` | Route protection middleware |
| `types/next-auth.d.ts` | Auth.js type extensions |
| `.env.example` | Env template |
| `next.config.ts` | Next.js config |

---

### Task 1: Scaffold Next.js 16 Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `postcss.config.mjs`

- [ ] **Step 1: Run create-next-app**

```bash
cd /Users/caco/Desktop/Cursor/casa-orfebre
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

Note: The `.` means "use current directory". It will skip creating `public/` since it already exists. If prompted about existing files, confirm.

- [ ] **Step 2: Verify scaffold works**

```bash
npm run dev
```

Expected: Dev server starts on `localhost:3000` with default Next.js page. Stop it with Ctrl+C.

- [ ] **Step 3: Install Phase 1 dependencies**

```bash
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs clsx tailwind-merge
npm install -D @types/bcryptjs tsx
```

- [ ] **Step 4: Clean up scaffold files**

Delete the default `app/page.tsx` content (will be replaced by route group). Delete `app/favicon.ico` (we have our own in `public/`).

- [ ] **Step 5: Configure next.config.ts**

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth avatars
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 16 with Turbopack and dependencies"
```

---

### Task 2: Design System — Tailwind CSS 4 + Fonts

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Configure globals.css with brand tokens**

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
  /* Brand Colors */
  --color-text: #1a1a18;
  --color-accent: #8B7355;
  --color-accent-light: #a8956f;
  --color-accent-dark: #6e5a42;
  --color-background: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-text-secondary: #6b6860;
  --color-text-tertiary: #9e9a90;
  --color-border: #e8e5df;
  --color-error: #dc2626;
  --color-success: #16a34a;

  /* Fonts */
  --font-serif: var(--font-cormorant-garamond);
  --font-sans: var(--font-outfit);
}

/* Base styles */
body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Selection color */
::selection {
  background-color: var(--color-accent);
  color: white;
}

/* Focus ring */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Configure root layout with fonts**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/auth-provider";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Casa Orfebre — Joyería de Autor",
    template: "%s | Casa Orfebre",
  },
  description:
    "Marketplace curado de joyería artesanal chilena. Piezas únicas de orfebres verificados, con certificado de autenticidad y garantía de compra segura.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"
  ),
  openGraph: {
    title: "Casa Orfebre — Joyería de Autor",
    description:
      "Piezas únicas de orfebres chilenos verificados. Certificado de autenticidad digital con cada compra.",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    type: "website",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${cormorantGaramond.variable} ${outfit.variable}`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add brand design system — fonts, colors, Tailwind tokens"
```

---

### Task 3: Utility Functions

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: Create utils.ts**

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/utils.ts
git commit -m "feat: add utility functions — cn, formatCLP, slugify"
```

---

### Task 4: UI Components

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/label.tsx`
- Create: `components/ui/card.tsx`

- [ ] **Step 1: Create Button component**

```tsx
// components/ui/button.tsx
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-dark active:bg-accent-dark",
  secondary:
    "border border-border text-text hover:bg-background active:bg-background",
  ghost: "text-text-secondary hover:text-text hover:bg-background",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-sans font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

- [ ] **Step 2: Create Input component**

```tsx
// components/ui/input.tsx
import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
          error
            ? "border-error focus:ring-error"
            : "border-border",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
```

- [ ] **Step 3: Create Label component**

```tsx
// components/ui/label.tsx
import { cn } from "@/lib/utils";
import { type LabelHTMLAttributes, forwardRef } from "react";

export const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-text", className)}
      {...props}
    />
  );
});

Label.displayName = "Label";
```

- [ ] **Step 4: Create Card component**

```tsx
// components/ui/card.tsx
import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-border bg-surface p-6",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/
git commit -m "feat: add base UI components — Button, Input, Label, Card"
```

---

### Task 5: Navbar Component

**Files:**
- Create: `components/layout/navbar.tsx`
- Create: `components/layout/mobile-menu.tsx`

- [ ] **Step 1: Create Navbar**

```tsx
// components/layout/navbar.tsx
import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./mobile-menu";

const navLinks = [
  { href: "/coleccion", label: "Colección" },
  { href: "/orfebres", label: "Orfebres" },
  { href: "/postular", label: "Postular" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/casaorfebre-logo-compact.svg"
            alt="Casa Orfebre"
            width={140}
            height={32}
            priority
          />
        </Link>

        {/* Center nav links — desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Cart icon — placeholder */}
          <button
            aria-label="Carrito"
            className="relative text-text-secondary transition-colors hover:text-text"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </button>

          {/* Login link — desktop */}
          <Link
            href="/login"
            className="hidden text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text md:block"
          >
            Ingresar
          </Link>

          {/* Mobile menu */}
          <MobileMenu links={navLinks} />
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Create Mobile Menu**

```tsx
// components/layout/mobile-menu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-8 w-8 items-center justify-center text-text-secondary"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        )}
      </button>

      {/* Full-screen overlay */}
      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-background">
          <nav className="flex flex-col items-center gap-8 pt-16">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-serif text-2xl font-light text-text-secondary transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-md border border-accent px-8 py-3 text-sm text-accent transition-colors hover:bg-accent hover:text-white"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/navbar.tsx components/layout/mobile-menu.tsx
git commit -m "feat: add Navbar with mobile hamburger menu"
```

---

### Task 6: Footer Component

**Files:**
- Create: `components/layout/footer.tsx`

- [ ] **Step 1: Create Footer**

```tsx
// components/layout/footer.tsx
import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "Explorar",
    links: [
      { href: "/coleccion", label: "Colección" },
      { href: "/orfebres", label: "Orfebres" },
    ],
  },
  {
    title: "Para Orfebres",
    links: [
      { href: "/postular", label: "Postular" },
      { href: "/portal/orfebre", label: "Portal Orfebre" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { href: "/garantia", label: "Garantía" },
      { href: "mailto:soporte@casaorfebre.cl", label: "Contacto" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/casaorfebre-logo-compact.svg"
              alt="Casa Orfebre"
              width={120}
              height={28}
            />
            <p className="mt-3 text-sm font-light text-text-tertiary">
              Joyería de Autor
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-light text-text-secondary transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-text-tertiary sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Casa Orfebre</p>
          <p>
            Desarrollado por{" "}
            <a
              href="https://lx3.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary transition-colors hover:text-text"
            >
              LX3.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "feat: add Footer component with brand columns"
```

---

### Task 7: Prisma Schema and Migration

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env` (we already have it in `.env.local`).

- [ ] **Step 2: Create .env file for Prisma**

Prisma reads from `.env` (not `.env.local`). Create a `.env` that references the DATABASE_URL:

```bash
echo 'DATABASE_URL="postgresql://neondb_owner:npg_RLmiH3qpnWQ2@ep-little-wind-ammndczk-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"' > .env
```

Add `.env` to `.gitignore`.

- [ ] **Step 3: Write complete Prisma schema**

Replace `prisma/schema.prisma` with the full schema from the project spec. This is the exact schema from the user's prompt — all models, enums, relations, indexes. Include:

- `User`, `Account`, `Session` (Auth.js compatible)
- `Artisan`, `ArtisanStatus`
- `Product`, `ProductImage`, `ProductCategory`, `ProductStatus`, `ImageStatus`
- `CartItem`
- `Order`, `OrderItem`, `OrderStatus`, `FulfillmentStatus`, `PayoutStatus`
- `ProductQuestion`, `Review`, `Favorite`
- `Certificate`
- `Dispute`, `DisputeReason`, `DisputeStatus`
- `ReturnRequest`, `ReturnReason`, `ReturnStatus`, `ReturnShippingPayer`
- `MembershipPlan`, `MembershipSubscription`, `MembershipStatus`
- `ArtisanApplication`, `ArtisanApplicationStatus`

The schema is provided verbatim in the project spec — copy it exactly.

- [ ] **Step 4: Create Prisma client singleton**

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 5: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration applied to Neon. All tables created. Prisma Client generated.

- [ ] **Step 6: Verify with Prisma Studio**

```bash
npx prisma studio
```

Expected: Opens browser at `localhost:5555` showing all tables. Verify tables exist. Close studio.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts prisma/migrations/
git commit -m "feat: add complete Prisma schema and migrate to Neon"
```

---

### Task 8: Auth.js v5 Configuration

**Files:**
- Create: `lib/auth.ts`
- Create: `lib/auth-provider.tsx`
- Create: `types/next-auth.d.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create type extensions**

```ts
// types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
```

- [ ] **Step 2: Create Auth.js config**

```ts
// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const ADMIN_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "BUYER";
      }

      // Admin auto-detection: promote admin emails on every token refresh
      if (token.email && ADMIN_EMAILS.includes(token.email)) {
        if (token.role !== "ADMIN") {
          await prisma.user.update({
            where: { email: token.email },
            data: { role: "ADMIN" },
          });
          token.role = "ADMIN";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  trustHost: true,
});
```

- [ ] **Step 3: Create route handler**

```ts
// app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST } from "@/lib/auth";
```

- [ ] **Step 4: Create client-side SessionProvider**

```tsx
// lib/auth-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 5: Generate AUTH_SECRET**

```bash
npx auth secret
```

This appends `AUTH_SECRET=...` to `.env.local`. Verify it was added.

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts lib/auth-provider.tsx types/next-auth.d.ts app/api/auth/
git commit -m "feat: configure Auth.js v5 with Google OAuth + Credentials + admin auto-detection"
```

---

### Task 9: Route Protection (proxy.ts)

**Files:**
- Create: `proxy.ts` (at project root, same level as `app/`)

- [ ] **Step 1: Create proxy.ts**

```ts
// proxy.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const pathname = nextUrl.pathname;

  // Protect portal routes
  if (pathname.startsWith("/portal") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    (pathname.startsWith("/login") || pathname.startsWith("/registro"))
  ) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "feat: add route protection via proxy.ts — portal requires auth"
```

---

### Task 10: Route Groups and Layouts

**Files:**
- Create: `app/(public)/layout.tsx`
- Create: `app/(public)/page.tsx`
- Create: `app/(auth)/layout.tsx`
- Create: `app/portal/layout.tsx`
- Create: `app/portal/admin/page.tsx`
- Create empty directories for future phases

- [ ] **Step 1: Create public layout**

```tsx
// app/(public)/layout.tsx
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Create public home page (placeholder)**

```tsx
// app/(public)/page.tsx
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <Image
        src="/casaorfebre-logo-light.svg"
        alt="Casa Orfebre"
        width={280}
        height={64}
        priority
      />
      <p className="mt-6 font-serif text-3xl font-light italic text-text-secondary">
        Joyería de Autor
      </p>
      <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-text-tertiary">
        Piezas únicas nacidas de manos chilenas. Cada joya cuenta una historia,
        cada orfebre es un artista verificado.
      </p>
      <p className="mt-8 rounded-full border border-border px-6 py-2 text-xs tracking-widest text-text-tertiary uppercase">
        Próximamente
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create auth layout**

```tsx
// app/(auth)/layout.tsx
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/casaorfebre-logo-compact.svg"
            alt="Casa Orfebre"
            width={160}
            height={36}
            priority
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create portal layout**

```tsx
// app/portal/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-border bg-surface p-6 md:block">
        <p className="mb-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Portal
        </p>
        <nav className="space-y-2">
          {session.user.role === "ADMIN" && (
            <Link
              href="/portal/admin"
              className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
            >
              Admin
            </Link>
          )}
          {session.user.role === "ARTISAN" && (
            <Link
              href="/portal/orfebre"
              className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
            >
              Mi Taller
            </Link>
          )}
          <Link
            href="/portal/comprador"
            className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
          >
            Mis Pedidos
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Create admin page**

```tsx
// app/portal/admin/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Panel Administrativo</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Bienvenido, {session.user.name ?? session.user.email}
      </p>
      <p className="mt-6 rounded-full border border-border px-6 py-2 text-xs tracking-widest text-text-tertiary uppercase inline-block">
        Próximamente
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Delete default app/page.tsx if it exists**

The `(public)/page.tsx` serves as the home page via the route group. Remove `app/page.tsx` if the scaffold created it.

- [ ] **Step 7: Create empty directories for future phases**

```bash
mkdir -p app/\(public\)/coleccion/\[slug\]
mkdir -p app/\(public\)/orfebres/\[slug\]
mkdir -p app/\(public\)/colecciones
mkdir -p app/\(public\)/postular
mkdir -p app/\(public\)/carrito
mkdir -p app/\(public\)/checkout
mkdir -p app/\(public\)/garantia
mkdir -p app/\(auth\)/verificar
mkdir -p app/portal/orfebre/productos/\[id\]
mkdir -p app/portal/orfebre/productos/nuevo
mkdir -p app/portal/orfebre/pedidos/\[id\]
mkdir -p app/portal/orfebre/preguntas
mkdir -p app/portal/orfebre/finanzas
mkdir -p app/portal/orfebre/perfil
mkdir -p app/portal/comprador/pedidos
mkdir -p app/portal/comprador/favoritos
mkdir -p app/portal/comprador/perfil
mkdir -p app/portal/admin/postulaciones
mkdir -p app/portal/admin/productos
mkdir -p app/portal/admin/fotos
mkdir -p app/portal/admin/pedidos
mkdir -p app/portal/admin/disputas
mkdir -p app/portal/admin/orfebres
mkdir -p app/portal/admin/finanzas
mkdir -p app/portal/admin/colecciones
mkdir -p app/portal/admin/devoluciones
mkdir -p app/api/mercadopago/webhook
mkdir -p app/api/mercadopago/connect
mkdir -p app/api/upload
mkdir -p components/products
mkdir -p components/artisans
mkdir -p components/cart
mkdir -p components/checkout
mkdir -p components/admin
```

Add `.gitkeep` to empty dirs so they're tracked:

```bash
find app/\(public\)/coleccion app/\(public\)/orfebres app/\(public\)/colecciones app/\(public\)/postular app/\(public\)/carrito app/\(public\)/checkout app/\(public\)/garantia app/\(auth\)/verificar app/portal/orfebre app/portal/comprador app/portal/admin/postulaciones app/portal/admin/productos app/portal/admin/fotos app/portal/admin/pedidos app/portal/admin/disputas app/portal/admin/orfebres app/portal/admin/finanzas app/portal/admin/colecciones app/portal/admin/devoluciones app/api/mercadopago app/api/upload components/products components/artisans components/cart components/checkout components/admin -type d -empty -exec touch {}/.gitkeep \;
```

- [ ] **Step 8: Commit**

```bash
git add app/ components/
git commit -m "feat: add route groups, layouts, placeholder pages, and directory structure"
```

---

### Task 11: Auth Pages — Login and Register

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/registro/page.tsx`
- Create: `lib/actions/auth.ts`

- [ ] **Step 1: Create server actions for auth**

```ts
// lib/actions/auth.ts
"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function loginWithCredentials(
  _prevState: { error: string } | null,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
  } catch {
    return { error: "Email o contraseña incorrectos" };
  }
  redirect("/");
}

export async function register(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "Todos los campos son requeridos" };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: "BUYER",
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: "Cuenta creada. Inicia sesión manualmente." };
  }

  redirect("/");
}
```

- [ ] **Step 2: Create Login page**

```tsx
// app/(auth)/login/page.tsx
"use client";

import { useActionState } from "react";
import { loginWithGoogle, loginWithCredentials } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginWithCredentials,
    null
  );

  return (
    <div>
      <h1 className="text-center font-serif text-2xl font-light">
        Iniciar Sesión
      </h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        Bienvenido a Casa Orfebre
      </p>

      {/* Google OAuth */}
      <form action={loginWithGoogle} className="mt-8">
        <Button variant="secondary" className="w-full gap-2" type="submit">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-tertiary">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Credentials form */}
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
            {state.error}
          </p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" loading={pending}>
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-tertiary">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-accent hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create Register page**

```tsx
// app/(auth)/registro/page.tsx
"use client";

import { useActionState } from "react";
import { loginWithGoogle, register } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <div>
      <h1 className="text-center font-serif text-2xl font-light">
        Crear Cuenta
      </h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        Únete a Casa Orfebre
      </p>

      {/* Google OAuth */}
      <form action={loginWithGoogle} className="mt-8">
        <Button variant="secondary" className="w-full gap-2" type="submit">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-tertiary">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Registration form */}
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">
            {state.error}
          </p>
        )}
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="mt-1"
            placeholder="Repite tu contraseña"
          />
        </div>
        <Button type="submit" className="w-full" loading={pending}>
          Crear Cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-tertiary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/actions/auth.ts app/\(auth\)/login/ app/\(auth\)/registro/
git commit -m "feat: add login and register pages with Google OAuth + credentials"
```

---

### Task 12: Seed Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

- [ ] **Step 1: Create seed script**

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin Users ───
  const adminCarlos = await prisma.user.upsert({
    where: { email: "carlos.irigoyen@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "carlos.irigoyen@gmail.com",
      name: "Carlos Irigoyen",
      role: "ADMIN",
    },
  });

  const adminCamila = await prisma.user.upsert({
    where: { email: "camilatorrespuga@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "camilatorrespuga@gmail.com",
      name: "Camila Torres",
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin users: ${adminCarlos.email}, ${adminCamila.email}`);

  // ─── Demo Artisan Users ───
  const hashedPassword = await bcrypt.hash("orfebre123", 12);

  const userValentina = await prisma.user.upsert({
    where: { email: "valentina@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "valentina@demo.casaorfebre.cl",
      name: "Valentina Ríos",
      hashedPassword,
      role: "ARTISAN",
    },
  });

  const userMatias = await prisma.user.upsert({
    where: { email: "matias@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "matias@demo.casaorfebre.cl",
      name: "Matías Sepúlveda",
      hashedPassword,
      role: "ARTISAN",
    },
  });

  const userIsidora = await prisma.user.upsert({
    where: { email: "isidora@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "isidora@demo.casaorfebre.cl",
      name: "Isidora Navarrete",
      hashedPassword,
      role: "ARTISAN",
    },
  });

  // ─── Artisan Profiles ───
  const artisanValentina = await prisma.artisan.upsert({
    where: { userId: userValentina.id },
    update: {},
    create: {
      userId: userValentina.id,
      slug: "valentina-rios",
      displayName: "Valentina Ríos",
      bio: "Orfebre autodidacta de Valparaíso. Trabajo con plata reciclada y piedras encontradas en la costa chilena. Cada pieza es un fragmento del paisaje porteño.",
      story:
        "Empecé a trabajar la plata a los 22 años, después de encontrar un anillo oxidado en la playa de Reñaca. Ese hallazgo despertó algo en mí. Hoy, cada pieza que creo lleva un trozo de costa: una piedra pulida por el mar, una textura que imita la arena mojada.",
      location: "Valparaíso",
      specialty: "Plata & Piedras Costeras",
      materials: ["Plata 950", "Cobre", "Piedras de mar", "Cuarzo"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.18,
    },
  });

  const artisanMatias = await prisma.artisan.upsert({
    where: { userId: userMatias.id },
    update: {},
    create: {
      userId: userMatias.id,
      slug: "matias-sepulveda",
      displayName: "Matías Sepúlveda",
      bio: "Joyero de Santiago especializado en técnicas ancestrales mapuche. Fusiono la tradición con el diseño contemporáneo usando plata y cobre.",
      story:
        "Aprendí orfebrería de mi abuela en Temuco. Ella me enseñó el trarilonko y el trapelacucha. Hoy reinterpreto esos símbolos para una generación que busca identidad en lo que lleva puesto.",
      location: "Santiago",
      specialty: "Joyería Mapuche Contemporánea",
      materials: ["Plata 950", "Cobre", "Bronce", "Lapislázuli"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.18,
    },
  });

  const artisanIsidora = await prisma.artisan.upsert({
    where: { userId: userIsidora.id },
    update: {},
    create: {
      userId: userIsidora.id,
      slug: "isidora-navarrete",
      displayName: "Isidora Navarrete",
      bio: "Diseñadora de joyas en oro y piedras semipreciosas. Mi trabajo se inspira en la flora nativa del sur de Chile: copihues, araucarias, helechos.",
      story:
        "Estudié diseño en la UC y luego me formé en orfebrería en Florencia. Volví a Chile con la misión de crear alta joyería que cuente nuestra historia botánica. Cada colección es un homenaje a un ecosistema chileno.",
      location: "Pucón",
      specialty: "Alta Joyería Botánica",
      materials: ["Oro 18k", "Plata 950", "Amatista", "Turmalina", "Esmeralda"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.15,
    },
  });

  console.log(
    `✅ Artisans: ${artisanValentina.displayName}, ${artisanMatias.displayName}, ${artisanIsidora.displayName}`
  );

  // ─── Demo Products ───
  const products = [
    {
      artisanId: artisanValentina.id,
      slug: "aros-ola-de-plata",
      name: "Aros Ola de Plata",
      description:
        "Aros colgantes inspirados en las olas de Valparaíso. Plata 950 texturizada a mano con acabado mate. Cierre de gancho.",
      story:
        "Estos aros nacieron una mañana de invierno mirando las olas romper en el muelle Barón. La textura de la plata imita la espuma del mar.",
      price: 67000,
      category: "AROS" as const,
      materials: ["Plata 950"],
      technique: "Texturizado a martillo",
      dimensions: "4.5 x 1.8 cm",
      weight: 8.5,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanValentina.id,
      slug: "collar-costa-brava",
      name: "Collar Costa Brava",
      description:
        "Collar con dije de plata y piedra de mar verde encontrada en la costa de Quintay. Cadena de plata 950 de 45 cm.",
      price: 89000,
      category: "COLLAR" as const,
      materials: ["Plata 950", "Piedra de mar"],
      technique: "Engaste en bisel",
      dimensions: "Dije: 2.5 x 1.5 cm",
      weight: 12.0,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanMatias.id,
      slug: "anillo-trapelacucha",
      name: "Anillo Trapelacucha",
      description:
        "Anillo ancho en plata 950 con grabado de trapelacucha (joya pectoral mapuche). Diseño contemporáneo que honra la tradición.",
      story:
        "El trapelacucha es símbolo de fertilidad y protección. Lo reinterpreté en un anillo que puedes llevar todos los días.",
      price: 54000,
      category: "ANILLO" as const,
      materials: ["Plata 950"],
      technique: "Grabado y calado",
      dimensions: "Talla ajustable 14-18",
      weight: 10.0,
      isUnique: false,
      editionSize: 10,
      stock: 7,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanMatias.id,
      slug: "pulsera-kultrung",
      name: "Pulsera Kultrun",
      description:
        "Pulsera rígida en cobre con diseño del kultrun (tambor ceremonial mapuche). Acabado oxidado y pulido selectivo.",
      price: 42000,
      category: "PULSERA" as const,
      materials: ["Cobre", "Bronce"],
      technique: "Repujado",
      dimensions: "Diámetro interno: 6.5 cm",
      weight: 25.0,
      isUnique: false,
      editionSize: 5,
      stock: 3,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanMatias.id,
      slug: "aros-pewma",
      name: "Aros Pewma",
      description:
        'Aros circulares en plata y cobre. "Pewma" significa sueño en mapudungun. Diseño geométrico con acabado satinado.',
      price: 38000,
      category: "AROS" as const,
      materials: ["Plata 950", "Cobre"],
      technique: "Soldadura y pulido",
      dimensions: "2.2 cm diámetro",
      weight: 6.0,
      isUnique: false,
      editionSize: 15,
      stock: 11,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "collar-copihue-oro",
      name: "Collar Copihue en Oro",
      description:
        "Collar con dije de copihue tallado en oro 18k con centro de rubí. Cadena de oro de 42 cm con extensión de 5 cm.",
      story:
        "El copihue es la flor nacional de Chile. Lo tallé en oro para que dure tanto como su belleza en la naturaleza.",
      price: 320000,
      category: "COLLAR" as const,
      materials: ["Oro 18k", "Rubí"],
      technique: "Tallado en cera perdida",
      dimensions: "Dije: 3.0 x 1.8 cm",
      weight: 6.5,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "anillo-araucaria",
      name: "Anillo Araucaria",
      description:
        "Anillo en plata 950 con textura de corteza de araucaria y engaste de amatista oval. Pieza única.",
      price: 145000,
      category: "ANILLO" as const,
      materials: ["Plata 950", "Amatista"],
      technique: "Texturizado orgánico y engaste",
      dimensions: "Talla 12",
      weight: 9.0,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "broche-helecho-austral",
      name: "Broche Helecho Austral",
      description:
        "Broche en forma de helecho en plata con baño de oro. Detalle de turmalina verde en la base. Cierre de alfiler doble.",
      price: 78000,
      category: "BROCHE" as const,
      materials: ["Plata 950", "Baño de oro", "Turmalina"],
      technique: "Calado y baño galvánico",
      dimensions: "5.5 x 2.0 cm",
      weight: 7.5,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanValentina.id,
      slug: "colgante-luna-porteña",
      name: "Colgante Luna Porteña",
      description:
        "Colgante de media luna en plata 950 con textura de arena. Incluye cadena de 50 cm.",
      price: 52000,
      category: "COLGANTE" as const,
      materials: ["Plata 950"],
      technique: "Fundición y texturizado",
      dimensions: "3.0 x 2.0 cm",
      weight: 11.0,
      isUnique: false,
      editionSize: 8,
      stock: 5,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "aros-canelo-sagrado",
      name: "Aros Canelo Sagrado",
      description:
        "Aros largos inspirados en las hojas del canelo. Plata 950 con acabado espejo y esmeralda diminuta.",
      price: 185000,
      category: "AROS" as const,
      materials: ["Plata 950", "Esmeralda"],
      technique: "Laminado y engaste",
      dimensions: "5.0 x 1.2 cm",
      weight: 7.0,
      isUnique: true,
      stock: 1,
      isCustomMade: true,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`✅ Products: ${products.length} created`);

  // ─── Demo Buyer ───
  await prisma.user.upsert({
    where: { email: "comprador@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "comprador@demo.casaorfebre.cl",
      name: "María González",
      hashedPassword,
      role: "BUYER",
    },
  });

  console.log("✅ Demo buyer created");
  console.log("🌱 Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

- [ ] **Step 2: Add prisma seed config to package.json**

Add to `package.json`:

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

Expected: Output shows all admin users, artisans, and products created.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed data — 2 admins, 3 artisans, 10 products, 1 buyer"
```

---

### Task 13: Environment & Gitignore

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create .env.example**

```env
# ─── Database (Neon) ───
DATABASE_URL=""

# ─── Auth.js ───
AUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ─── Mercado Pago ───
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_PUBLIC_KEY=""
MERCADOPAGO_CLIENT_ID=""
MERCADOPAGO_CLIENT_SECRET=""
MERCADOPAGO_WEBHOOK_SECRET=""

# ─── Cloudflare R2 ───
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="casaorfebre"
R2_ENDPOINT=""
R2_PUBLIC_URL=""

# ─── Resend ───
RESEND_API_KEY=""
RESEND_FROM_EMAIL="Casa Orfebre <hola@casaorfebre.cl>"

# ─── Google Analytics ───
NEXT_PUBLIC_GA_ID=""

# ─── App ───
NEXT_PUBLIC_APP_URL="https://casaorfebre.cl"
NEXT_PUBLIC_APP_NAME="Casa Orfebre"
```

- [ ] **Step 2: Update .gitignore**

Ensure `.gitignore` includes:

```
# env files
.env
.env.local
.env*.local

# dependencies
node_modules/

# next.js
.next/
out/

# prisma
prisma/*.db

# misc
.DS_Store
*.pem
```

- [ ] **Step 3: Create manifest.json**

```json
{
  "name": "Casa Orfebre",
  "short_name": "Casa Orfebre",
  "description": "Marketplace curado de joyería artesanal chilena",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAF8",
  "theme_color": "#8B7355",
  "icons": [
    { "src": "/favicon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore public/manifest.json
git commit -m "chore: add env example, gitignore, and web manifest"
```

---

### Task 14: Final Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Starts on `localhost:3000` without errors.

- [ ] **Step 2: Verify home page**

Open `http://localhost:3000`. Verify:
- Logo renders
- Cormorant Garamond font loads (serif in "Joyería de Autor")
- Outfit font loads (sans in body text)
- Brand colors display correctly (warm whites, accent gold)
- Navbar shows with Colección, Orfebres, Postular links
- Footer renders with 4 columns and LX3.ai credit
- Mobile: hamburger menu works

- [ ] **Step 3: Verify auth flow**

1. Click "Ingresar" → navigates to `/login`
2. Auth layout shows: centered, no navbar, logo at top
3. Click "Continuar con Google" → Google OAuth flow
4. After Google login → redirected to home, session active
5. Navigate to `/portal/admin` → shows admin page (if logged in as admin email)

- [ ] **Step 4: Verify route protection**

1. Open incognito, go to `localhost:3000/portal/admin`
2. Should redirect to `/login`
3. Log in with non-admin account → go to `/portal/admin` → redirected to `/`

- [ ] **Step 5: Verify credentials registration**

1. Go to `/registro`
2. Fill form with name, email, password (8+ chars), confirm password
3. Submit → user created → logged in → redirected to home

- [ ] **Step 6: Verify Prisma data**

```bash
npx prisma studio
```

Check: users table has 2 admins + 3 artisans + 1 buyer. Products table has 10 products. Artisans table has 3 profiles.

- [ ] **Step 7: Final commit**

If any fixes were needed during verification, commit them:

```bash
git add -A
git commit -m "fix: address verification issues in Phase 1"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Scaffold Next.js 16 | package.json, next.config.ts |
| 2 | Design system (Tailwind + fonts) | globals.css, layout.tsx |
| 3 | Utility functions | lib/utils.ts |
| 4 | UI components | components/ui/* |
| 5 | Navbar | components/layout/navbar.tsx, mobile-menu.tsx |
| 6 | Footer | components/layout/footer.tsx |
| 7 | Prisma schema + migration | prisma/schema.prisma, lib/prisma.ts |
| 8 | Auth.js v5 | lib/auth.ts, auth-provider.tsx, types, route handler |
| 9 | Route protection | proxy.ts |
| 10 | Route groups + layouts | app/(public), (auth), portal layouts + pages |
| 11 | Auth pages | login, register, server actions |
| 12 | Seed data | prisma/seed.ts |
| 13 | Env + gitignore | .env.example, .gitignore, manifest.json |
| 14 | Final verification | Manual testing |
