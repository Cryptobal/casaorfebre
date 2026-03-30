-- Step 1: Ensure categories exist for each enum value (skip if already present)
INSERT INTO "categories" ("id", "name", "slug", "position", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Aros', 'aros', 0, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Collar', 'collar', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Anillo', 'anillo', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pulsera', 'pulsera', 3, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Broche', 'broche', 4, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Colgante', 'colgante', 5, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Otro', 'otro', 6, true, NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- Step 2: Create implicit many-to-many join table
CREATE TABLE "_CategoryToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey"
  FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey"
  FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 3: Migrate existing enum data to the join table
-- Map enum values to category slugs (enum is uppercase, slug is lowercase)
INSERT INTO "_CategoryToProduct" ("A", "B")
SELECT c."id", p."id"
FROM "products" p
JOIN "categories" c ON LOWER(c."slug") = LOWER(p."category"::text)
WHERE p."category" IS NOT NULL;

-- Step 4: Drop the category index, column, and enum
DROP INDEX IF EXISTS "products_category_idx";
ALTER TABLE "products" DROP COLUMN "category";
DROP TYPE IF EXISTS "ProductCategory";
