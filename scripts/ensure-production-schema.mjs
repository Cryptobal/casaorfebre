/**
 * Runs during `npm run build` (Vercel) to guarantee that every column the
 * Prisma schema references on `artisan_applications` actually exists in the
 * live database. Several columns were added to prisma/schema.prisma over
 * time without a matching migration being applied to production, which
 * caused POST /postular to fail with Prisma P2022 ColumnNotFound.
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
  console.log("[ensure-production-schema] artisan_applications columns verified.");
} catch (err) {
  console.error("[ensure-production-schema] Failed to ensure schema:", err);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
