# Phase 2: Vitrina Pública — Design Spec

**Project:** Casa Orfebre — Marketplace curado de joyería de autor
**Phase:** 2 of 9 — Vitrina Pública
**Date:** 2026-03-26
**Status:** Approved

---

## Scope

Build the entire public-facing storefront: editorial home page, product catalog with filters, product detail page, artisan directory, and artisan profile page. This is the first impression of the marketplace — the design must be gallery-grade, not generic e-commerce.

## Out of Scope

- Cart/checkout (Phase 5)
- Functional Q&A with anti-contact filter (Phase 7)
- Functional reviews (Phase 4)
- Artisan application form (Phase 3)
- Functional favorites (Phase 4)
- Image uploads to R2 (Phase 3)

---

## Design Principles

1. **Gallery, not store** — generous whitespace, editorial typography, minimal UI chrome
2. **Cormorant Garamond dominates** — all headings, section titles, hero text use `font-serif`
3. **Outfit supports** — body text, labels, buttons, meta info use `font-sans`
4. **Warm neutrals** — `bg-background (#FAFAF8)`, `bg-surface (#FFFFFF)` for cards, `text (#1a1a18)` for headings, `text-secondary` for body, `accent (#8B7355)` for CTAs
5. **Animations** — fade-in on scroll (intersection observer), hover zoom on product images (scale 1.05, 300ms), smooth page transitions
6. **Images** — 3:4 aspect ratio for product cards, placeholder gradient when no image
7. **Mobile-first** — everything responsive, grid collapses gracefully

---

## 1. Home Page (`/`)

### Hero Section
- Full-width, min-height 80vh
- Centered content: headline in Cormorant Garamond 4xl-6xl italic light
- Headline: "Piezas únicas nacidas de manos chilenas"
- Subline: "Joyería artesanal de orfebres verificados. Cada pieza cuenta una historia." (Outfit, text-secondary)
- CTA button: "Explorar Colección" → `/coleccion` (primary, accent)
- Subtle decorative element: thin horizontal line or small diamond divider

### Trust Bar
- Horizontal strip below hero, `bg-surface` with top/bottom border
- 4 items in a row (2x2 on mobile): icon + short text
  - "Garantía de Autenticidad" (shield icon)
  - "Certificado Digital" (badge icon)
  - "Envío a Todo Chile" (truck icon)
  - "Orfebres Verificados" (checkmark icon)
- Icons: thin stroke style matching brand aesthetic, text-tertiary color
- Text: Outfit, text-sm, text-secondary

### "¿Por qué comprar en Casa Orfebre?" Section
- Section heading: Cormorant Garamond, centered, "¿Por qué comprar en Casa Orfebre?"
- Subheading: "Una experiencia superior a comprar por redes sociales"
- 6 value props in a 2x3 grid (stacked on mobile):
  1. **"Pago seguro con tarjeta"** — "No necesitas transferir a una cuenta desconocida"
  2. **"Garantía de 14 días"** — "Algo que no existe comprando por Instagram"
  3. **"Certificado de autenticidad"** — "QR verificable con cada pieza que compras"
  4. **"Tracking de envío real"** — "Sigue tu pedido en tiempo real, no promesas vagas"
  5. **"Orfebres verificados"** — "Cada artesano pasa por nuestro proceso de curaduría"
  6. **"Fotos y descripciones profesionales"** — "Sabes exactamente lo que estás comprando"
- Each card: icon (accent color), title bold, description text-secondary
- Tone: confident but not aggressive against Instagram

### Featured Artisans Section
- Section heading: "Orfebres Destacados"
- Grid of 3 artisan cards (from seed data)
- Each card: avatar placeholder (initials in circle), display name (serif), location, specialty
- Click → `/orfebres/[slug]`
- "Ver todos los orfebres →" link below

### Latest Products Section
- Section heading: "Últimas Piezas"
- Grid of 4-8 product cards (approved products from DB, newest first)
- Product card component (reusable):
  - Image container: 3:4 aspect ratio, `overflow-hidden rounded-lg`
  - On hover: image scales 1.05 over 300ms
  - Heart/favorite button (top-right, visual only — not functional yet)
  - Below image: artisan name (small, text-tertiary), product name (serif, medium), material tag, price (formatted CLP)
  - Badge: "Pieza Única" / "Ed. Limitada x/N" if applicable
- "Ver toda la colección →" link below

### CTA Section
- "¿Eres Orfebre?" heading
- "Únete a nuestra comunidad de artesanos verificados"
- Button: "Postular" → `/postular` (secondary variant)

### Scroll Animations
- All sections use intersection observer to fade-in on scroll
- Staggered entrance for grid items (50ms delay per item)
- Implementation: custom `useFadeIn` hook with IntersectionObserver

---

## 2. Catalog Page (`/coleccion`)

### Layout
- Page heading: "Colección" (Cormorant Garamond, large)
- Optional subheading: "Piezas de orfebres chilenos verificados"
- Filter bar + product grid

### Filter Bar
- Horizontal bar above the grid
- Filters as dropdown/select buttons:
  - **Categoría**: Aros, Collar, Anillo, Pulsera, Broche, Colgante (multi-select or single)
  - **Material**: extracted from products (Plata 950, Oro 18k, Cobre, etc.)
  - **Precio**: range — Hasta $50.000 / $50.000-$100.000 / $100.000-$200.000 / Más de $200.000
  - **Orfebre**: dropdown of artisan names
- Sort dropdown: Más recientes, Precio ↑, Precio ↓
- Active filters shown as removable chips below the bar
- "Limpiar filtros" link when filters active
- Filters update URL search params (shallow routing)

### Product Grid
- Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Uses the same ProductCard component from home
- If no results: "No encontramos piezas con esos filtros. Intenta con otros."
- Pagination or "Cargar más" button at bottom

### Data Fetching
- Server component, reads searchParams for filters
- Prisma query: `where: { status: "APPROVED" }` + dynamic filters
- Order by `publishedAt desc` default, or by price

---

## 3. Product Detail Page (`/coleccion/[slug]`)

### Layout — Two Column
- Left (60%): Image gallery
- Right (40%): Product info
- Below: artisan card, Q&A placeholder, reviews placeholder

### Image Gallery
- Main image: large, rounded, 3:4 aspect
- Thumbnail strip below (horizontal scroll)
- Click thumbnail → swaps main image
- If no images: styled gradient placeholder with product name
- For now: all products have no uploaded images, so use placeholder

### Product Info (right column)
- Badge: "Pieza Única" or "Edición Limitada (X/N)" or "Pieza Personalizada · Sin devolución"
- Product name: Cormorant Garamond, 2xl-3xl
- Artisan link: "por [Artisan Name]" → `/orfebres/[slug]`
- Price: large, formatted CLP ($89.000)
- Compare-at price if exists: strikethrough, text-tertiary
- Materials: inline badges/chips
- Technique, dimensions if available
- Description: body text
- Story: optional italic block with different styling
- If not unique: quantity selector (simple +/- buttons)
- "Añadir al Carrito" button: full-width, primary, large (visual only — not functional)
- Trust icons row: "Garantía 14 días" / "Certificado Digital" / "Envío 3-7 días"
  - If `isCustomMade`: replace guarantee icon with "Pieza personalizada · Sin devolución"

### Artisan Mini-Card
- Horizontal card below product info
- Avatar placeholder, name (serif), location, specialty
- "Ver perfil completo →" link

### Q&A Placeholder
- Section heading: "Preguntas sobre esta pieza"
- Message: "Las preguntas estarán disponibles próximamente"

### Reviews Placeholder
- Section heading: "Opiniones de compradores"
- Message: "Las opiniones estarán disponibles próximamente"

### SEO
- Dynamic metadata: product name, description, OG image (product image or fallback)
- JSON-LD: Product schema

---

## 4. Artisan Directory (`/orfebres`)

### Layout
- Page heading: "Nuestros Orfebres" (Cormorant Garamond)
- Subheading: "Artesanos verificados que dan vida a piezas únicas"
- Grid of artisan cards: 1 col mobile, 2 cols tablet, 3 cols desktop

### Artisan Card Component
- Avatar: large circle (128px), initials if no image
- Display name: serif, medium
- Location + specialty
- Materials: small badges (first 3)
- Rating stars + review count (if > 0)
- Total products count
- Click → `/orfebres/[slug]`

### Data
- Prisma: `where: { status: "APPROVED" }`, ordered by `totalSales desc` or `rating desc`

---

## 5. Artisan Profile Page (`/orfebres/[slug]`)

### Hero Section
- Large avatar placeholder (or profile image)
- Display name: Cormorant Garamond, 3xl-4xl
- Location + specialty
- Materials as badges
- Rating + review count + total pieces

### Bio & Story
- Bio: regular paragraph
- Story: optional, styled differently (italic, serif, slightly indented or with left border accent)

### Workshop Gallery Placeholder
- If `workshopImages` exist: horizontal scroll gallery
- For now: empty section hidden

### Products Grid
- Section: "Piezas de [Name]"
- Grid of their products (same ProductCard component)
- Only shows APPROVED products

### Reviews Placeholder
- "Opiniones sobre [Name]" — "Las opiniones estarán disponibles próximamente"

### SEO
- Dynamic metadata: artisan name, bio excerpt, OG image
- JSON-LD: LocalBusiness schema

### IMPORTANT
- NO social links, email, phone, or external website displayed
- The page only shows: name, bio, story, location, specialty, materials, products, reviews

---

## 6. Shared Components

### ProductCard
- Reused in: home (latest), catalog grid, artisan profile
- Props: product with artisan relation
- Image with hover zoom, favorite heart (visual), info below

### ArtisanCard
- Reused in: home (featured), artisan directory
- Props: artisan with product count

### SectionHeading
- Reused across all home sections
- Cormorant Garamond, centered, with optional subheading

### FadeIn Animation Wrapper
- `useFadeIn` hook or `<FadeIn>` component
- IntersectionObserver, triggers once
- Supports stagger delay for lists

### ImagePlaceholder
- Gradient placeholder for products without images
- Shows product name centered
- Aspect ratio 3:4

### PriceDisplay
- Formats CLP with `formatCLP()`
- Optional compare-at price with strikethrough

### MaterialBadge
- Small pill/chip component for materials
- Consistent styling across all uses

---

## Verification Criteria

1. Home page loads with all 5 sections, correct typography, warm aesthetic
2. Scroll animations work (fade-in on enter viewport)
3. Product cards show hover zoom effect
4. Catalog page filters work (category, material, price range, artisan)
5. URL search params update with filters (shareable URLs)
6. Product detail page shows all product info correctly
7. Artisan directory shows approved artisans
8. Artisan profile shows bio, products, NO contact info
9. All prices formatted as Chilean pesos ($89.000)
10. Responsive: looks great on mobile, tablet, desktop
11. SEO metadata renders correctly for products and artisans
12. No artisan contact info (social links, email, phone) visible anywhere
