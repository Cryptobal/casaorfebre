<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Overview
Casa Orfebre is a Chilean artisan jewelry marketplace built as a Next.js 16 + Prisma 7 + PostgreSQL monolith. Package manager is **npm** (lockfile: `package-lock.json`).

### Database
- The `DATABASE_URL` environment secret points to a Neon PostgreSQL instance with `pgvector` enabled.
- A local PostgreSQL 16 + pgvector is also installed as fallback (`postgresql://ubuntu:dev@localhost:5432/casaorfebre`).
- Start local PG if needed: `sudo pg_ctlcluster 16 main start`
- Prisma config is in `prisma.config.ts` (loads env via `dotenv/config`). The schema is at `prisma/schema.prisma`.

### Running the dev server
- `npm run dev` starts Next.js on port 3000 (Turbopack enabled).
- The app requires `DATABASE_URL` and `AUTH_SECRET` at minimum. Optional services (MercadoPago, Cloudflare R2, Resend, OpenAI, Anthropic) degrade gracefully when keys are empty.

### Seeds
- Run `npx tsx prisma/seed-catalog.ts` first (creates categories + materials), then `npx tsx prisma/seed.ts` (membership plans, demo artisans/products, buyer, reviews).
- The main seed loads env from `env.local` (not `.env.local`); Prisma config uses `dotenv/config` which reads `DATABASE_URL` from the environment or `.env`.

### Lint / Test / Build
- **Lint**: `npm run lint` — pre-existing warnings/errors exist in the codebase; these are not regressions.
- **Build**: `npm run build` (runs `prisma generate && next build`).
- **E2E tests**: `npm run test:e2e` (Playwright; requires `npx playwright install chromium` first).

### Auth
- NextAuth v5 with Google OAuth + Credentials providers. For local dev, credentials login works with seeded demo users (e.g. `comprador@demo.casaorfebre.cl` / `orfebre123`).
- Google OAuth requires valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` secrets to function.
