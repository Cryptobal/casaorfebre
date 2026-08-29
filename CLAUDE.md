# CASA ORFEBRE — REPOSITORY INSTRUCTIONS

> Nota de compatibilidad: `AGENTS.md` (instrucciones para Cursor Cloud) sigue vigente y no contradice este archivo. Ante duda sobre entorno Cursor Cloud, prima `AGENTS.md`; para todo lo demás, este archivo.

## 1. Project overview

Casa Orfebre (casaorfebre.cl) es un marketplace chileno de joyería de autor: conecta orfebres/diseñadores aprobados con compradores. Monolito Next.js 16 (App Router) + Prisma 7 + PostgreSQL (Neon, con `pgvector`), desplegado en Vercel. Moneda: CLP. Idioma de UI y contenido: español de Chile.

**Modo atelier (activo).** El sitio público opera como one-pager de Camila. Ver sección «Modo atelier» más abajo.

**IMPORTANTE — Next.js 16 no es el Next.js de tu entrenamiento.** Tiene breaking changes en APIs, convenciones y estructura. Antes de escribir código de framework, lee la guía relevante en `node_modules/next/dist/docs/` y respeta avisos de deprecación. Nota: el middleware vive en `proxy.ts` (raíz), no en `middleware.ts`.

## 2. Business and product principles

Marketplace **curado y premium** de joyería de autor. Toda decisión debe proteger:

- identidad editorial y exclusividad (curaduría: orfebres postulan y son aprobados; productos e imágenes pasan por revisión admin);
- confianza y conversión (certificados de autenticidad, garantía, reseñas);
- calidad visual y experiencia móvil primero;
- claridad comercial y facilidad de compra;
- identidad propia de cada orfebre (perfil, historia, Instagram).

Evita interfaces genéricas o cambios que abaraten la percepción de marca.

## 3. Verified technology stack

Verificado en `package.json` y código:

- **Frontend/Backend**: Next.js 16.2.1 (App Router, Turbopack, Server Actions con `bodySizeLimit: 6mb`), React 19.2, TypeScript 5.
- **Estilos**: Tailwind CSS v4 (`@import "tailwindcss"` + tokens de marca en `@theme` dentro de `app/globals.css`); `clsx` + `tailwind-merge` (`lib/utils.ts`).
- **ORM/BD**: Prisma 7 (`@prisma/adapter-pg` + `pg`) sobre PostgreSQL con extensión `vector`. Schema: `prisma/schema.prisma`; config: `prisma.config.ts` (carga env vía `dotenv/config`).
- **Auth**: NextAuth v5 beta (`lib/auth.ts`) — Google OAuth + Credentials (bcryptjs), `@auth/prisma-adapter`, sesión JWT.
- **Pagos**: MercadoPago SDK v2 (Checkout Pro por preferencias + OAuth de vendedores; sandbox con `MP_SANDBOX=true`).
- **Almacenamiento**: Cloudflare R2 vía `@aws-sdk/client-s3` (`lib/r2.ts`); videos en Cloudflare Stream.
- **Email**: Resend (`lib/resend.ts`, plantillas en `lib/emails/`).
- **Rate limiting**: Upstash Redis + `@upstash/ratelimit` (`lib/rate-limit.ts`).
- **IA**: OpenAI (embeddings de productos, pgvector) y Anthropic SDK; módulo amplio en `lib/ai/` (blog, insights, asistentes, detección de fraude, búsqueda visual). Degradan con gracia si faltan las keys.
- **Analítica**: Google Analytics (`NEXT_PUBLIC_GA_ID`) + `@vercel/analytics`.
- **Otros**: Pinterest API (publicación automática), Google Maps (`@react-google-maps/api`), recharts, qrcode, marked, driver.js (tours guiados).
- **Testing**: Playwright (`tests/e2e/`, foco en flujo MercadoPago).
- Monitoreo de errores (Sentry u otro): **No identificado en el repositorio**.

## 4. Repository structure

- `app/(public)/` — sitio público: catálogo (`coleccion`, `colecciones`), producto, orfebres, blog, landings SEO (regalos, materiales, ocasión, joyerías por ciudad), carrito, checkout, legal.
- `app/(auth)/` — login, registro, verificación, recuperación de contraseña.
- `app/portal/` — portales autenticados: `admin/`, `orfebre/`, `comprador/`.
- `app/api/` — route handlers: `mercadopago/webhook`, `webhook/resend`, `cron/*` (≈28 crons de Vercel, ver `vercel.json`), `upload`, `search`, `cart`, `admin`, `oauth/mercadopago`, etc.
- `lib/actions/` — Server Actions por dominio (checkout, cart, products, orders, returns, disputes, membership, admin…). Aquí vive la lógica de negocio.
- `lib/queries/` — consultas de lectura por dominio.
- `lib/` — clientes e infraestructura: `prisma.ts`, `auth.ts`, `mercadopago.ts`, `r2.ts`, `resend.ts`, `rate-limit.ts`, `credits.ts`, `gift-cards.ts`, `payout-schedule.ts`, `plan-limits.ts`, `seo/`, `ai/`, `emails/`.
- `components/` — por dominio (`products`, `cart`, `checkout`, `portal`, `admin`, `reviews`…); base compartida en `components/ui/` y `components/shared/` (ej. `price-display.tsx`).
- `prisma/` — schema, `migrations/`, seeds (`seed-catalog.ts`, `seed.ts`, seeds de blog).
- `scripts/` — utilidades one-off (backfills, verificación); `scripts/ensure-production-schema.mjs` corre en el build.
- `tests/e2e/` — Playwright + `seed-test-data.ts`.
- `proxy.ts` — middleware de auth para `/portal/*`.
- `docs/superpowers/` — planes y specs; `content/blog/` — blog legacy en TSX (DEPRECADO: el blog vive en BD).

## 5. Main commands

Verificados en `package.json`:

- Instalación: `npm install` (package manager: **npm**).
- Desarrollo: `npm run dev` (puerto 3000, Turbopack). Requiere mínimo `DATABASE_URL` y `AUTH_SECRET`.
- Lint: `npm run lint` — hay warnings/errores preexistentes; no son regresiones tuyas.
- Typecheck: no hay script dedicado; usar `npx tsc --noEmit`.
- Build: `npm run build` (= `prisma generate` + `ensure-production-schema.mjs` + `next build`).
- E2E: `npm run test:e2e` (antes: `npx playwright install chromium` y `npm run test:seed`; ver `tests/e2e/README.md`). Variantes: `test:e2e:ui`, `test:e2e:headed`.
- Prisma: `npx prisma generate`, `npx prisma migrate dev` (solo local; ver §18).
- Seeds (en orden): `npx tsx prisma/seed-catalog.ts` → `npx tsx prisma/seed.ts`. El seed principal lee env desde `env.local` (sin punto).
- No hay tests unitarios configurados: **No identificado en el repositorio**.

## 6. Architecture

- **Frontend**: React Server Components por defecto; client components para interactividad. Sin librería de estado global: el estado vive en el servidor (BD) y se muta con Server Actions + `revalidatePath`. Carrito de invitado en localStorage (`lib/guest-cart-storage.ts`) que se fusiona al iniciar sesión.
- **Backend**: mismo monolito. Mutaciones → Server Actions (`lib/actions/*`); integraciones entrantes y jobs → route handlers en `app/api/*`. Crons de Vercel protegidos con `CRON_SECRET`.
- **Datos**: PostgreSQL vía Prisma singleton (`lib/prisma.ts`). Embeddings de búsqueda semántica en pgvector.
- **Auth**: NextAuth v5, JWT. Roles `BUYER | ARTISAN | ADMIN` (enum `UserRole`). Admins con role-switcher (`activeRole`) definidos por email en `lib/auth.ts` y `proxy.ts`.
- **Pagos**: checkout crea preferencia de MercadoPago (`lib/actions/checkout.ts`); la confirmación llega por webhook firmado (`app/api/mercadopago/webhook`). Los orfebres conectan su cuenta MP por OAuth (tokens refrescados por cron).
- **Almacenamiento**: imágenes en R2 (subida vía `app/api/upload`), servidas con `next/image` (AVIF/WebP, `remotePatterns` en `next.config.ts`); videos en Cloudflare Stream.
- **Despliegue**: Vercel (crons en `vercel.json`, headers de seguridad y redirects en `next.config.ts`).

## 7. Sources of truth

Todas en PostgreSQL vía `prisma/schema.prisma`, salvo lo indicado:

| Dato | Fuente de verdad |
|---|---|
| Usuarios y roles | `User` (+ `Account`/`Session` de NextAuth) |
| Orfebres/diseñadores | `Artisan` (estado, comisión, tokens MP, membresía) |
| Productos | `Product` (+ catálogos `Category`, `Material`, `Occasion`, `Specialty`) |
| Variantes/tallas | `ProductVariant` (stock por talla) o `Product.stock` si no hay variantes |
| Precios | `Product.price` (CLP entero); histórico congelado en `OrderItem.productPrice` |
| Inventario | `ProductVariant.stock` / `Product.stock` (decremento al pagar) |
| Carrito | `CartItem` (autenticado) / localStorage (invitado) |
| Órdenes | `Order` + `OrderItem` (estados: `OrderStatus`, `FulfillmentStatus`, `PayoutStatus`) |
| Pagos | MercadoPago es la fuente externa; el estado local se fija solo vía webhook verificado |
| Contenido/blog | `BlogPost` en BD (`content/blog/` está deprecado) |
| Imágenes | R2 (URLs en `ProductImage`, con estado de moderación `ImageStatus`) |
| Configuración | env vars + `SystemSetting`, `ShippingSettings`, `ShippingZone`, `MembershipPlan` |

## 8. Working protocol

Para cada tarea: 1) entiende el objetivo comercial; 2) lee el brief/spec si existe (`docs/superpowers/`); 3) revisa solo los archivos relevantes; 4) identifica la causa raíz; 5) haz un plan interno compacto; 6) implementa el cambio mínimo completo; 7) valida (§19); 8) corrige errores; 9) revisa el diff; 10) informa resultados con el formato de §23.

## 9. Context and token efficiency

- Empieza por los archivos mencionados explícitamente; luego sigue dependencias directas (imports).
- Usa búsquedas dirigidas (Grep/Glob) en vez de recorrer el repositorio.
- No releas archivos ya leídos; no leas generados (`.next/`, `node_modules/`, `package-lock.json`, migraciones antiguas salvo necesidad).
- El schema Prisma es grande (~1.400 líneas): grep por modelo en vez de leerlo entero.
- No consultes servicios externos que no aporten a la tarea.
- Minimiza contexto sin sacrificar calidad: mejor 5 archivos correctos que 50 superficiales.

## 10. Coding standards

Convenciones observadas: TypeScript estricto con alias `@/*`; Server Actions con `"use server"` que retornan `{ error }` en fallos de validación; textos de UI y mensajes en español; comentarios mixtos español/inglés; dinero en **CLP entero** formateado con `formatCLP` (`lib/utils.ts`) y `price-display.tsx`.

Además:
- mantén type safety (nada de `any` gratuito);
- respeta patrones existentes (mira un action/componente vecino antes de crear uno);
- no agregues dependencias sin necesidad real;
- no refactorices ni reformatees código ajeno a la tarea;
- evita duplicación: reutiliza `lib/` y `components/ui|shared`;
- resuelve causas raíz, no síntomas;
- maneja errores explícitamente (try/catch en actions, `console.error` con prefijo de contexto);
- mantén compatibilidad de datos y URLs (los redirects de `next.config.ts` existen por eso).

## 11. Marketplace rules

- Distingue siempre comprador, orfebre, admin y procesos del sistema (crons/webhooks). No asumas un único vendedor: una orden puede contener ítems de **varios orfebres** (`OrderItem.artisanId`, envío prorrateado por ítem).
- Autorización **en servidor** en cada action/route: sesión + rol + **propiedad del recurso** (ej. un orfebre solo edita sus productos; un comprador solo ve sus órdenes). El `proxy.ts` solo protege rutas de `/portal`, no reemplaza la validación por recurso.
- Preserva comisiones y liquidaciones: `commissionRate` se congela por ítem en `OrderItem` junto con `commissionAmount` y `artisanPayout`; los payouts siguen el ciclo `PayoutStatus` (HELD → RELEASED → PAID) liberados por cron (`release-payouts`, `lib/payout-schedule.ts`). No alteres montos históricos.
- Preserva trazabilidad de órdenes, pagos, estados y devoluciones (`Dispute`, `ReturnRequest`); los cambios de estado son auditables, no destructivos.
- Respeta la curaduría: productos e imágenes requieren aprobación admin (`ProductStatus`, `ImageStatus`); no publiques contenido saltándose ese flujo.
- Membresías (`MembershipPlan/Subscription`) limitan capacidades del orfebre (`lib/plan-limits.ts`); créditos en `ArtisanCredits`/`CreditTransaction`.

## 12. Jewelry domain rules

Implementado en el schema y UI — respétalo al tocar productos:

- **Tallas**: `Product.tallas[]`, `tallaUnica`, ajuste de anillos (`tallaAjusteArriba/Abajo`), guía (`guiaTallas`), stock por talla en `ProductVariant`; utilidades en `lib/ring-sizes.ts`.
- **Materiales y piedras**: catálogos `Material` y `ProductStone`; precios de material del orfebre (`MaterialPrice`, `ArtisanMaterial`).
- **Cadenas/largos**: `largoCadenaCm`, `tieneCadena` (colgantes).
- **Fabricación**: `ProductionType` (pieza única vs a pedido), `isCustomizable`, `elaborationDays`. Piezas únicas suelen tener `stock = 1`.
- **Variación artesanal**: piezas hechas a mano pueden variar; el copy y las políticas lo reflejan (garantía, devoluciones).
- Grabados/personalización más allá de `isCustomizable`, venta por par: **No identificado en el repositorio** como campos dedicados — no los declares como existentes.

## 13. Pricing and financial integrity

- Precios y totales se calculan y validan **en servidor** leyendo la BD; nunca confíes en montos enviados por el cliente.
- Todo el dinero es **CLP entero** (`Int`) — sin decimales ni punto flotante en cálculos financieros. `commissionRate` es `Float` solo como tasa; los montos derivados se guardan como enteros.
- Los precios históricos se congelan en `OrderItem` (`productPrice`, `commissionAmount`, `artisanPayout`, `shippingShare`); nunca se recalculan desde el producto actual.
- Descuentos (`PromoCode`), gift cards, comisiones, reembolsos y payouts deben ser deterministas y auditables (`PromoCodeRedemption`, `GiftCardUsage`, `CreditTransaction`).
- Cambios en lógica financiera exigen prueba dirigida (E2E de MP o script de verificación) antes de darse por terminados.

## 14. Cart, checkout and payments

Flujo real verificado (`lib/actions/checkout.ts`, `app/api/mercadopago/webhook/route.ts`):

1. Checkout revalida en servidor: producto `APPROVED`, variante/talla existente, stock suficiente, precios desde BD; aplica promo/gift card y prorratea envío.
2. Se crea la `Order` en `PENDING_PAYMENT` y una preferencia de MercadoPago (`init_point`; `sandbox_init_point` si `MP_SANDBOX=true`).
3. **La orden se marca pagada solo vía webhook** con firma HMAC verificada (`x-signature`, `MERCADOPAGO_WEBHOOK_SECRET`; sin secreto, se rechaza). El retorno del navegador nunca confirma pago.
4. Al confirmar pago: decremento de stock (variante o producto), emails (comprador, orfebre, admin), recompensas de referidos, gift cards.
5. Órdenes pendientes se limpian por cron (`cleanup-pending-orders`); no envíos → auto-cancelación (`auto-cancel-unshipped`).

Reglas: mantén idempotencia en el webhook (reintenta MP), previene dobles decrementos de stock y dobles confirmaciones; preserva `mpPaymentId`/referencias para trazabilidad; rate limit del webhook ya existe (`webhookLimiter`).

## 15. Security and permissions

- **Auth**: NextAuth v5 JWT; credenciales con bcrypt; verificación de email.
- **Autorización**: valida sesión + rol + propiedad en **cada** Server Action y route handler. `/portal/admin` solo `ADMIN`; `/portal/orfebre` solo `ARTISAN`/`ADMIN` (proxy + layouts).
- **Entradas**: valida y sanitiza todo input de usuario en servidor; los filtros anti-fuga de contacto existen (`lib/chat-filter.ts`, `lib/contact-filter.ts`) — no los debilites: evitan desintermediación del marketplace.
- **Secretos**: solo en env vars; jamás en código, logs, commits o respuestas. `.env.example` documenta las claves necesarias sin valores.
- **Webhooks**: siempre verificar firma (MP HMAC; Resend con `RESEND_WEBHOOK_SECRET`). Crons exigen `CRON_SECRET`.
- **Archivos**: subidas pasan por `app/api/upload` hacia R2; imágenes con moderación previa.
- **Datos personales**: minimiza exposición (direcciones, emails, teléfonos); no logs con datos sensibles ni tokens.
- **Límite de confianza**: todo lo que venga del cliente (precios, IDs, roles, cantidades) es no confiable hasta revalidarse en servidor.

## 16. Frontend and UX

- Preserva el sistema de diseño: tokens de `app/globals.css` (colores de marca, tipografía) y componentes de `components/ui|shared`. Nada de estilos genéricos tipo bootstrap-AI.
- Mobile-first: la mayoría del tráfico es móvil; verifica breakpoints.
- Cubre loading / empty / error / success states (hay `skeleton.tsx`, `toast.tsx`, modales de error).
- Mantén accesibilidad (labels, focus — existe `lib/use-focus-trap.ts`, alt text en imágenes).
- Evita regresiones visuales: no toques estilos globales para arreglar un caso puntual.
- Imágenes siempre con `next/image` (AVIF/WebP ya configurado); minimiza JavaScript de cliente — usa Server Components salvo necesidad de interactividad.

## 17. SEO and performance

El SEO es un activo central del negocio (landings programáticas, blog IA, crons de indexación):

- Metadata por página con `generateMetadata`; canonical y OG (helper en `lib/seo.ts`, imágenes OG en `app/api/og`).
- Slugs únicos y estables para productos, orfebres, colecciones y blog — no rompas URLs; si cambias rutas, agrega redirect en `next.config.ts`.
- Datos estructurados y sitemaps segmentados (`app/sitemap-*.xml`, `app/robots.ts`); rutas privadas llevan `X-Robots-Tag: noindex` vía headers.
- Crons SEO existentes: `gsc-indexing`, `seo-audit`, `schema-validator`, `alt-texts`, `internal-links`, `blog-auto-generate` — no dupliques su lógica.
- Rendimiento: evita N+1 (usa `include/select` de Prisma en `lib/queries/*`), pagina listados, cachea donde el patrón ya lo hace, optimiza imágenes (TTL 1 año ya configurado).

## 18. Database and migrations

- Revisa `prisma/schema.prisma` y `prisma/migrations/` antes de tocar el modelo de datos.
- Cambios aditivos y compatibles hacia atrás; evita drops/renames destructivos; preserva datos existentes (la BD de producción está viva).
- Nueva migración: `npx prisma migrate dev --name <nombre>` **solo en local**. Nunca ejecutes migraciones contra producción sin instrucción explícita del usuario (`ensure-production-schema.mjs` corre en build de Vercel; no lo conviertas en mecanismo de migraciones ad hoc).
- Revisa índices y constraints (`@@unique`, `@@index`) al agregar consultas nuevas.
- Usa `prisma.$transaction` para operaciones multi-tabla críticas (órdenes, stock, pagos).

## 19. Testing and validation

Herramientas reales: ESLint 9, TypeScript, Playwright (E2E de MercadoPago). No hay framework de tests unitarios.

Orden recomendado por tarea:
1. prueba dirigida del cambio (manual o script);
2. `npx tsc --noEmit`;
3. `npm run lint` (compara contra warnings preexistentes);
4. verificación de integración si toca pagos/órdenes (`npm run test:e2e` con seed);
5. `npm run build`;
6. E2E completos cuando el cambio toca checkout/webhook.

**Ninguna tarea está terminada sin validación.** Si un paso no puede ejecutarse (p. ej. sin BD), decláralo explícitamente.

## 20. External tools and integrations

Verificadas: MercadoPago (pagos + OAuth vendedores), Cloudflare R2 y Stream, Resend (email + webhook), Upstash Redis (rate limit), OpenAI (embeddings), Anthropic (contenido), Google Analytics, Google Search Console (crons `gsc-*`), Pinterest API, Google Maps, Vercel (hosting + crons).

Úsalas solo cuando la tarea lo requiera; todas degradan con gracia sin API keys en dev. No consultes automáticamente servicios externos no relacionados con la tarea.

## 21. Destructive actions

Antes de eliminar datos, ejecutar migraciones destructivas, tocar producción, cambiar lógica de pagos, DNS, infraestructura, secretos o hacer force push, verifica: **entorno** (¿local o producción?), **objetivo**, **alcance**, **reversibilidad** y **plan de rollback** — y pide confirmación explícita al usuario. Los scripts de `scripts/` que mutan datos (backfills, remediaciones) solo se ejecutan bajo instrucción explícita.

## 22. Definition of done

Una tarea termina solo cuando: el comportamiento solicitado está implementado; se atacó la causa raíz; se respetaron las reglas de negocio (§11–§14); se ejecutaron las validaciones (§19); se revisó el diff completo; no hay cambios no relacionados; se revisaron seguridad, responsive y datos cuando corresponde; y se informaron los riesgos materiales.

## 23. Final response format

Responde con estas secciones (breves; omite ruido):

### Implementado
### Validación
### Archivos principales
### Riesgos o pendientes

## 24. Verified project facts

| Área | Implementación verificada | Fuente |
|---|---|---|
| Framework | Next.js 16.2.1 App Router + React 19.2 + TS 5 | `package.json` |
| Middleware | `proxy.ts` en raíz (protege `/portal/*`) | `proxy.ts` |
| Estilos | Tailwind CSS v4 con tokens en `@theme` | `app/globals.css` |
| BD | PostgreSQL (Neon) + pgvector, Prisma 7 + adapter-pg | `prisma/schema.prisma`, `lib/prisma.ts` |
| Auth | NextAuth v5 beta: Google + Credentials, JWT, roles BUYER/ARTISAN/ADMIN | `lib/auth.ts`, enum `UserRole` |
| Pagos | MercadoPago Checkout Pro + webhook HMAC + OAuth orfebres | `lib/actions/checkout.ts`, `app/api/mercadopago/webhook` |
| Dinero | CLP entero (`Int`); histórico congelado en `OrderItem` | schema, `formatCLP` en `lib/utils.ts` |
| Comisiones | `commissionRate` por orfebre (default 0.18), congelada por ítem; payouts por cron | schema, `lib/payout-schedule.ts` |
| Archivos | Cloudflare R2 (S3 SDK) + Cloudflare Stream | `lib/r2.ts`, `.env.example` |
| Email | Resend + plantillas propias | `lib/resend.ts`, `lib/emails/` |
| CMS/Blog | `BlogPost` en BD, generación IA por cron | schema, `app/api/cron/blog-auto-generate` |
| Búsqueda | Texto (`lib/search/product-text-search.ts`) + embeddings OpenAI/pgvector | `lib/ai/embeddings.ts`, cron `embeddings` |
| Hosting | Vercel con 28 crons | `vercel.json` |
| Tests | Playwright E2E (flujo MP) | `tests/e2e/` |
| Comandos | `npm run dev / lint / build / test:e2e`; typecheck: `npx tsc --noEmit` | `package.json` |
| Seeds | `seed-catalog.ts` → `seed.ts` (demo: `comprador@demo.casaorfebre.cl` / `orfebre123`) | `prisma/`, `AGENTS.md` |
| Env vars | Ver `.env.example` (sin secretos); mínimo `DATABASE_URL` + `AUTH_SECRET` | `.env.example` |
| Monitoreo de errores | No identificado en el repositorio | — |
| Tests unitarios | No identificado en el repositorio | — |

## 25. Modo atelier

Casa Orfebre opera temporalmente como **one-pager de artista** (Camila): video hero, manifiesto, conceptos, galería y contacto por Instagram/WhatsApp. El marketplace público queda oculto; nada se borra.

**Fuente de verdad del modo:** `lib/site-config.ts` (`SITE_MODE = "atelier"`). El mockup visual está en `docs/mockup-onepager.html`.

**Contenido de la home:** vive en BD (`HomeContent`, `HomeGalleryImage`) con fallback en `lib/home-defaults.ts` y `GALLERY_IMAGES` de `lib/site-config.ts`. Se edita desde `/portal/admin/home`. El video y el poster del hero siguen siendo assets R2 gestionados en código.

**Público accesible:** `/`, `/blog/**`, `/verificar/**`, `/terminos`, `/privacidad`, `/politica-devoluciones`, `/acuerdo-orfebre`, `/checkout/success`, `/checkout/failure`, `/gift-cards/success`, auth y `/portal/**`.

**Oculto (307 a `/`):** catálogo, orfebres, landings SEO comerciales, carrito, checkout, gift-cards, favoritos, postulaciones y páginas de captación. El bloque está comentado en `next.config.ts` como `// Modo atelier — borrar este bloque para revertir`.

**Gates de servidor:** postulaciones (`lib/actions/application.ts`, upload de foto) y creación de preferencias Mercado Pago (`lib/actions/checkout.ts`, `lib/actions/gift-cards.ts`, `lib/subscription-payment.ts`). El webhook MP no se toca.

**Sitemaps:** el índice solo emite `sitemap-static.xml` ( `/`, `/blog`, `/terminos`, `/privacidad`) y `sitemap-blog.xml`. Las otras rutas de sitemap siguen en el repo.

**Layout público:** sin `MobileTabBar`, sin `ShoppingChatbot`, sin WhatsApp flotante. Navbar/footer mínimos según el mockup.

### Cómo revertir

1. En `lib/site-config.ts`, `SITE_MODE = "marketplace"`.
2. En `next.config.ts`, borrar el bloque de redirects «Modo atelier».
3. Restaurar montajes del layout público (`MobileTabBar`, `ShoppingChatbot`, padding de la tab bar) y las versiones marketplace de navbar/footer/home (revertir el commit de atelier o recuperar esos archivos de `main`).
4. Restaurar el índice de sitemaps y `generateOrganizationJsonLd` a `OnlineStore` si se vuelve a vender en el sitio.

