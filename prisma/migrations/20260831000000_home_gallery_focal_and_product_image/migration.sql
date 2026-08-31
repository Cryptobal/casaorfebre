-- Encuadre horizontal (object-position) y origen opcional desde una foto de producto.
-- Idempotente: el build de Vercel también aplica estas columnas vía ensure-production-schema.mjs.
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
