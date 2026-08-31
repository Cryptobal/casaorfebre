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

CREATE TABLE IF NOT EXISTS "home_content" (
  "id" TEXT NOT NULL,
  "heroPhrase" TEXT,
  "manifesto" TEXT,
  "concepts" JSONB,
  "galleryIntro" TEXT,
  "contactInstagramText" TEXT,
  "contactWhatsappText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "home_content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "home_gallery_images" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "caption" TEXT,
  "sortOrder" INTEGER NOT NULL,
  "focalX" INTEGER NOT NULL DEFAULT 50,
  "productImageId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "home_gallery_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "home_gallery_images_sortOrder_idx"
  ON "home_gallery_images"("sortOrder");

ALTER TABLE "home_gallery_images"
  ADD COLUMN IF NOT EXISTS "focalX" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "productImageId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "home_gallery_images_productImageId_key"
  ON "home_gallery_images"("productImageId");

DO $$ BEGIN
  ALTER TABLE "home_gallery_images"
    ADD CONSTRAINT "home_gallery_images_productImageId_fkey"
    FOREIGN KEY ("productImageId") REFERENCES "product_images"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
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
    "[ensure-production-schema] artisan_applications + order_items + home_content tables verified."
  );
} catch (err) {
  console.error("[ensure-production-schema] Failed to ensure schema:", err);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
