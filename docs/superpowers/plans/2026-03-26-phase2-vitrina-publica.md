# Phase 2: Vitrina Pública — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the entire public storefront — editorial home, catalog with filters, product detail, artisan directory, and artisan profiles — with gallery-grade design quality.

**Architecture:** Server Components for all data-fetching pages. Client Components only for interactivity (filters, animations, image gallery). Prisma queries in page components. Shared product/artisan cards. Scroll animations via IntersectionObserver.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, Prisma 7, next/image

**Note on testing:** This phase is UI/presentation. Verification is visual — pages render correctly, filters work, animations are smooth, responsive layout is correct.

---

## File Map

| File | Responsibility |
|------|---------------|
| `components/shared/section-heading.tsx` | Reusable section heading (serif + sub) |
| `components/shared/fade-in.tsx` | Scroll animation wrapper |
| `components/shared/image-placeholder.tsx` | Gradient placeholder for products without images |
| `components/shared/price-display.tsx` | CLP price formatter with compare-at |
| `components/shared/material-badge.tsx` | Material pill/chip |
| `components/products/product-card.tsx` | Product card for grids |
| `components/artisans/artisan-card.tsx` | Artisan card for grids |
| `lib/queries/products.ts` | Prisma queries for products |
| `lib/queries/artisans.ts` | Prisma queries for artisans |
| `app/(public)/page.tsx` | Home page (5 sections) |
| `app/(public)/coleccion/page.tsx` | Catalog with filters |
| `app/(public)/coleccion/[slug]/page.tsx` | Product detail |
| `app/(public)/orfebres/page.tsx` | Artisan directory |
| `app/(public)/orfebres/[slug]/page.tsx` | Artisan profile |

---

### Task 1: Shared UI Components

**Files:**
- Create: `components/shared/section-heading.tsx`
- Create: `components/shared/fade-in.tsx`
- Create: `components/shared/image-placeholder.tsx`
- Create: `components/shared/price-display.tsx`
- Create: `components/shared/material-badge.tsx`

- [ ] **Step 1: Create SectionHeading**

```tsx
// components/shared/section-heading.tsx
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <h2 className="font-serif text-3xl font-light tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm font-light text-text-secondary sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create FadeIn**

```tsx
// components/shared/fade-in.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  delay?: number; // ms
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create ImagePlaceholder**

```tsx
// components/shared/image-placeholder.tsx
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  name: string;
  className?: string;
}

export function ImagePlaceholder({ name, className }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-border to-background",
        className
      )}
    >
      <span className="px-4 text-center font-serif text-lg font-light italic text-text-tertiary">
        {name}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Create PriceDisplay**

```tsx
// components/shared/price-display.tsx
import { formatCLP } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
}

export function PriceDisplay({ price, compareAtPrice, className }: PriceDisplayProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-medium text-text">{formatCLP(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-sm text-text-tertiary line-through">
          {formatCLP(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create MaterialBadge**

```tsx
// components/shared/material-badge.tsx
import { cn } from "@/lib/utils";

interface MaterialBadgeProps {
  material: string;
  className?: string;
}

export function MaterialBadge({ material, className }: MaterialBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border border-border px-2.5 py-0.5 text-xs font-light text-text-secondary",
        className
      )}
    >
      {material}
    </span>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/shared/
git commit -m "feat: add shared UI components — SectionHeading, FadeIn, ImagePlaceholder, PriceDisplay, MaterialBadge"
```

---

### Task 2: ProductCard and ArtisanCard Components

**Files:**
- Create: `components/products/product-card.tsx`
- Create: `components/artisans/artisan-card.tsx`

- [ ] **Step 1: Create ProductCard**

```tsx
// components/products/product-card.tsx
import Link from "next/link";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { PriceDisplay } from "@/components/shared/price-display";
import type { Product, Artisan, ProductImage } from "@prisma/client";

type ProductWithRelations = Product & {
  artisan: Pick<Artisan, "displayName" | "slug">;
  images: ProductImage[];
};

interface ProductCardProps {
  product: ProductWithRelations;
}

export function ProductCard({ product }: ProductCardProps) {
  const badge = product.isCustomMade
    ? "Personalizada"
    : product.isUnique
      ? "Pieza Única"
      : product.editionSize
        ? `Ed. Limitada ${product.stock}/${product.editionSize}`
        : null;

  return (
    <Link href={`/coleccion/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background">
        <ImagePlaceholder name={product.name} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />

        {/* Favorite heart (visual only) */}
        <button
          className="absolute right-3 top-3 rounded-full bg-surface/80 p-2 text-text-tertiary backdrop-blur-sm transition-colors hover:text-accent"
          onClick={(e) => e.preventDefault()}
          aria-label="Guardar en favoritos"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Badge */}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <p className="text-xs font-light text-text-tertiary">
          {product.artisan.displayName}
        </p>
        <h3 className="font-serif text-base font-medium text-text">
          {product.name}
        </h3>
        <p className="text-xs text-text-tertiary">
          {product.materials[0]}
        </p>
        <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
      </div>
    </Link>
  );
}
```

Note: The ProductCard uses `ImagePlaceholder` for now. In future phases when R2 is integrated, it will use `next/image` with the actual product image URL.

- [ ] **Step 2: Create ArtisanCard**

```tsx
// components/artisans/artisan-card.tsx
import Link from "next/link";
import { MaterialBadge } from "@/components/shared/material-badge";
import type { Artisan } from "@prisma/client";

type ArtisanWithCount = Artisan & { _count: { products: number } };

interface ArtisanCardProps {
  artisan: ArtisanWithCount;
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  const initials = artisan.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <Link
      href={`/orfebres/${artisan.slug}`}
      className="group block rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/30"
    >
      {/* Avatar */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background">
        <span className="font-serif text-2xl font-light text-text-secondary">
          {initials}
        </span>
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <h3 className="font-serif text-xl font-medium text-text">
          {artisan.displayName}
        </h3>
        <p className="mt-1 text-sm text-text-tertiary">
          {artisan.location} · {artisan.specialty}
        </p>

        {/* Materials */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {artisan.materials.slice(0, 3).map((m) => (
            <MaterialBadge key={m} material={m} />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-tertiary">
          {artisan.rating > 0 && (
            <span>★ {artisan.rating.toFixed(1)}</span>
          )}
          <span>{artisan._count.products} piezas</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/products/product-card.tsx components/artisans/artisan-card.tsx
git commit -m "feat: add ProductCard and ArtisanCard components"
```

---

### Task 3: Data Query Functions

**Files:**
- Create: `lib/queries/products.ts`
- Create: `lib/queries/artisans.ts`

- [ ] **Step 1: Create product queries**

```ts
// lib/queries/products.ts
import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@prisma/client";

interface ProductFilters {
  category?: ProductCategory;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  artisanSlug?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
}

export async function getApprovedProducts(filters: ProductFilters = {}) {
  const where: Record<string, unknown> = { status: "APPROVED" as const };

  if (filters.category) where.category = filters.category;
  if (filters.material) where.materials = { has: filters.material };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.artisanSlug) {
    where.artisan = { slug: filters.artisanSlug };
  }

  const orderBy =
    filters.sort === "price_asc"
      ? { price: "asc" as const }
      : filters.sort === "price_desc"
        ? { price: "desc" as const }
        : { publishedAt: "desc" as const };

  return prisma.product.findMany({
    where,
    orderBy,
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      artisan: {
        select: {
          id: true,
          displayName: true,
          slug: true,
          location: true,
          specialty: true,
          materials: true,
          profileImage: true,
        },
      },
      images: { orderBy: { position: "asc" } },
    },
  });
}

export async function getLatestProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "APPROVED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
}

export async function getAllMaterials() {
  const products = await prisma.product.findMany({
    where: { status: "APPROVED" },
    select: { materials: true },
  });
  const materials = new Set(products.flatMap((p) => p.materials));
  return Array.from(materials).sort();
}
```

- [ ] **Step 2: Create artisan queries**

```ts
// lib/queries/artisans.ts
import { prisma } from "@/lib/prisma";

export async function getApprovedArtisans() {
  return prisma.artisan.findMany({
    where: { status: "APPROVED" },
    orderBy: { totalSales: "desc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getFeaturedArtisans(limit = 3) {
  return prisma.artisan.findMany({
    where: { status: "APPROVED" },
    orderBy: { rating: "desc" },
    take: limit,
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getArtisanBySlug(slug: string) {
  return prisma.artisan.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      products: {
        where: { status: "APPROVED" },
        orderBy: { publishedAt: "desc" },
        include: {
          artisan: { select: { displayName: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
      _count: { select: { products: true, reviews: true } },
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/queries/
git commit -m "feat: add Prisma query functions for products and artisans"
```

---

### Task 4: Home Page

**Files:**
- Modify: `app/(public)/page.tsx` (replace placeholder)

- [ ] **Step 1: Build the complete home page**

The home page is a Server Component that fetches featured artisans and latest products, then renders 5 sections:

1. **Hero** — Full-width centered text with headline, subline, CTA button
2. **Trust Bar** — 4 trust items in horizontal strip
3. **Why Buy Here** — 6 value props in 2x3 grid
4. **Featured Artisans** — 3 ArtisanCards in grid
5. **Latest Products** — Up to 8 ProductCards in grid
6. **CTA** — "¿Eres Orfebre?" call to action

Each section is wrapped in `<FadeIn>` for scroll animations. Grid items use staggered `delay` prop.

The page imports: `SectionHeading`, `FadeIn`, `ProductCard`, `ArtisanCard`, `Button`, `getLatestProducts`, `getFeaturedArtisans`.

Key design details:
- Hero: `min-h-[80vh]`, serif italic heading, thin divider line
- Trust bar: icons as inline SVGs (shield, badge, truck, checkmark), thin stroke style
- Why section: each card has an SVG icon in accent color, title, description
- All sections: `max-w-7xl mx-auto px-4`
- Generous vertical spacing between sections: `py-20 sm:py-28`

Write the complete page with all 5 sections. This is a large file (~300 lines) because it's the editorial home page.

- [ ] **Step 2: Verify home renders**

```bash
npm run dev
# Open localhost:3000 — verify all sections, fonts, colors, animations
```

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/page.tsx
git commit -m "feat: build editorial home page with hero, trust bar, value props, featured artisans, latest products"
```

---

### Task 5: Catalog Page with Filters

**Files:**
- Create: `app/(public)/coleccion/page.tsx`
- Create: `app/(public)/coleccion/catalog-filters.tsx` (client component)

- [ ] **Step 1: Create CatalogFilters client component**

A `"use client"` component that renders the filter bar and updates URL search params using `useRouter` and `useSearchParams`.

Filters:
- Category dropdown (from ProductCategory enum values)
- Material dropdown (from `materials` prop passed by server)
- Price range dropdown (preset ranges)
- Artisan dropdown (from `artisans` prop passed by server)
- Sort dropdown

Active filters shown as removable chips. "Limpiar filtros" link.

- [ ] **Step 2: Create catalog page (Server Component)**

```tsx
// app/(public)/coleccion/page.tsx
```

The page:
1. Reads `searchParams` (async in Next.js 16)
2. Calls `getApprovedProducts(filters)` and `getAllMaterials()` and `getApprovedArtisans()`
3. Renders page heading, CatalogFilters (passing materials and artisans), product grid
4. Wraps products in FadeIn with stagger
5. Shows empty state if no results

SEO: metadata with title "Colección | Casa Orfebre"

- [ ] **Step 3: Verify filters work**

Open `/coleccion`, test each filter type, verify URL params update, verify grid filters correctly.

- [ ] **Step 4: Commit**

```bash
git add app/\(public\)/coleccion/
git commit -m "feat: add catalog page with filterable product grid"
```

---

### Task 6: Product Detail Page

**Files:**
- Create: `app/(public)/coleccion/[slug]/page.tsx`
- Create: `app/(public)/coleccion/[slug]/image-gallery.tsx` (client component)

- [ ] **Step 1: Create ImageGallery client component**

A `"use client"` component that shows:
- Main image area (large, 3:4 aspect)
- Thumbnail strip below
- Click thumbnail to swap main image
- For now: uses ImagePlaceholder since no real images exist
- Prepared for future: accepts `images` array prop

- [ ] **Step 2: Create product detail page**

The page:
1. Gets `slug` from params (async)
2. Calls `getProductBySlug(slug)` — if not found, `notFound()`
3. Two-column layout (stack on mobile):
   - Left: ImageGallery
   - Right: badge, name, artisan link, price, materials, description, story, quantity selector (if not unique), add-to-cart button (visual), trust icons
4. Below: artisan mini-card, Q&A placeholder, reviews placeholder

SEO: `generateMetadata` with product name, description, JSON-LD Product schema

- [ ] **Step 3: Verify product page**

Open `/coleccion/aros-ola-de-plata` — verify all info displays, layout is correct, responsive.

- [ ] **Step 4: Commit**

```bash
git add app/\(public\)/coleccion/\[slug\]/
git commit -m "feat: add product detail page with gallery, info, and artisan card"
```

---

### Task 7: Artisan Directory and Profile Pages

**Files:**
- Create: `app/(public)/orfebres/page.tsx`
- Create: `app/(public)/orfebres/[slug]/page.tsx`

- [ ] **Step 1: Create artisan directory page**

The page:
1. Calls `getApprovedArtisans()`
2. Renders heading "Nuestros Orfebres" with subtitle
3. Grid of ArtisanCards with FadeIn stagger
4. SEO metadata

- [ ] **Step 2: Create artisan profile page**

The page:
1. Gets `slug` from params
2. Calls `getArtisanBySlug(slug)` — if not found, `notFound()`
3. Renders:
   - Hero: avatar, name, location, specialty, materials, stats
   - Bio section
   - Story section (if exists, italic serif styling)
   - Products grid: "Piezas de [Name]" with ProductCards
   - Reviews placeholder
4. **NO social links, email, phone, external website**
5. SEO: `generateMetadata` with artisan name, bio excerpt

- [ ] **Step 3: Verify both pages**

Open `/orfebres` — verify grid of 3 artisans. Click one → verify profile with bio, products, no contact info.

- [ ] **Step 4: Commit**

```bash
git add app/\(public\)/orfebres/
git commit -m "feat: add artisan directory and profile pages"
```

---

### Task 8: Final Polish and Verification

- [ ] **Step 1: Fix the Turbopack warning** (if not already done)

Ensure `next.config.ts` has `turbopack: { root: __dirname }`.

- [ ] **Step 2: Clean `.next` cache and start fresh**

```bash
rm -rf .next && npm run dev
```

- [ ] **Step 3: Full verification checklist**

Test every page:
1. `/` — all 5 sections, scroll animations, hover zoom on products, correct fonts
2. `/coleccion` — filter by category, material, price, artisan; sort works; URL params update
3. `/coleccion/[slug]` — product info correct, price formatted, artisan link works
4. `/orfebres` — grid of 3 artisans, cards link to profiles
5. `/orfebres/[slug]` — bio, story, products grid, NO contact info
6. Mobile: test all pages at 375px width
7. Check that `<title>` and `<meta>` tags render for SEO

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish Phase 2 vitrina pública"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Shared UI components | components/shared/* |
| 2 | ProductCard + ArtisanCard | components/products/, components/artisans/ |
| 3 | Data query functions | lib/queries/* |
| 4 | Home page (editorial) | app/(public)/page.tsx |
| 5 | Catalog page with filters | app/(public)/coleccion/ |
| 6 | Product detail page | app/(public)/coleccion/[slug]/ |
| 7 | Artisan directory + profile | app/(public)/orfebres/ |
| 8 | Final polish + verification | Various |
