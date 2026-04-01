-- Add review highlights fields to products
ALTER TABLE "products" ADD COLUMN "reviewHighlights" JSONB;
ALTER TABLE "products" ADD COLUMN "reviewHighlightsAt" TIMESTAMP(3);
