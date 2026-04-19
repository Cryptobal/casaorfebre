-- Idempotent safety net: ensure every column that the Prisma schema
-- expects on `artisan_applications` actually exists in production.
--
-- Several columns were added to prisma/schema.prisma over the last
-- months without a matching migration file (e.g. region, categories,
-- yearsExperience, awards, selectedPlan, promoCode, aiReview and the
-- Ley 21.719 consent columns). If `prisma migrate deploy` is being used
-- in production, those columns would be missing, which makes every
-- POST to /postular (and to /postular?pionero=1) crash with a 500.
--
-- Using `ADD COLUMN IF NOT EXISTS` keeps this migration safe on
-- databases where the columns were already added out-of-band via
-- `prisma db push`.

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
