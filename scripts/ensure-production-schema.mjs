/**
 * Runs during `npm run build` (Vercel) to guarantee that every column the
 * Prisma schema references actually exists in the live database. This project
 * deploys with `prisma db push` (the migration history is intentionally not
 * applied on Vercel), so columns added to prisma/schema.prisma without a
 * matching push land in the client but not in production, and every Prisma
 * read that auto-selects them fails with P2022 ColumnNotFound.
 *
 * That happened twice:
 *   - `artisan_applications` columns → POST /postular failed.
 *   - `order_items.shippingShare` (added with the shipping-payout feature)
 *     → the orfebre portal (pedidos, finanzas) and admin payout views threw
 *       a Server Components error, blocking artisans from their console.
 *
 * The statements use `ADD COLUMN IF NOT EXISTS`, so running this on every
 * build is a no-op once the columns are in place.
 */
import pg from "pg";

const SQL = `
ALTER TABLE "artisan_applications"
  ADD COLUMN IF NOT EXISTS "region" TEXT,
  ADD COLUMN IF NOT EXISTS "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER,
  ADD COLUMN IF NOT EXISTS "awards" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "selectedPlan" TEXT,
  ADD COLUMN IF NOT EXISTS "promoCode" TEXT,
  ADD COLUMN IF NOT EXISTS "isPioneerCandidate" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "aiReview" JSONB,
  ADD COLUMN IF NOT EXISTS "consentTerms" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentTermsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consentMarketing" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentMarketingAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consentSocialMedia" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "consentSocialMediaAt" TIMESTAMP(3);

ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "shippingShare" INTEGER NOT NULL DEFAULT 0;
`;

const url = process.env.DATABASE_URL;

if (!url) {
  console.log(
    "[ensure-production-schema] DATABASE_URL not set — skipping (local build without DB)."
  );
  process.exit(0);
}

const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  await client.query(SQL);
  console.log(
    "[ensure-production-schema] artisan_applications + order_items columns verified."
  );
} catch (err) {
  console.error("[ensure-production-schema] Failed to ensure schema:", err);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
