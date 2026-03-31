-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "artisanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_artisanId_slug_key" ON "collections"("artisanId", "slug");

-- CreateIndex
CREATE INDEX "collections_artisanId_idx" ON "collections"("artisanId");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "artisans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add collectionId to products
ALTER TABLE "products" ADD COLUMN "collectionId" TEXT;

-- CreateIndex
CREATE INDEX "products_collectionId_idx" ON "products"("collectionId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing coleccion text data to collections
-- For each unique (artisanId, coleccion) pair, create a collection record
INSERT INTO "collections" ("id", "artisanId", "name", "slug", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    p."artisanId",
    p."coleccion",
    LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(
            TRANSLATE(
                LOWER(p."coleccion"),
                'áéíóúüñ',
                'aeiouun'
            ),
            '[^a-z0-9]+', '-', 'g'
        ),
        '^-+|-+$', '', 'g'
    )),
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT "artisanId", "coleccion"
    FROM "products"
    WHERE "coleccion" IS NOT NULL AND "coleccion" != ''
) p
ON CONFLICT ("artisanId", "slug") DO NOTHING;

-- Link products to their newly created collections
UPDATE "products" p
SET "collectionId" = c."id"
FROM "collections" c
WHERE p."artisanId" = c."artisanId"
  AND p."coleccion" IS NOT NULL
  AND p."coleccion" != ''
  AND c."name" = p."coleccion";

-- Drop the old coleccion column
ALTER TABLE "products" DROP COLUMN "coleccion";
