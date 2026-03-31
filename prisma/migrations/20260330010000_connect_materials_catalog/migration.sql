-- Step 1: Insert materials from products that don't exist in the catalog
INSERT INTO "materials" ("id", "name", "position", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  sub.mat_name,
  (SELECT COALESCE(MAX("position"), 0) + ROW_NUMBER() OVER () FROM "materials"),
  true,
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT TRIM(mat_name) AS mat_name
  FROM "products", unnest("materials") AS mat_name
  WHERE TRIM(mat_name) <> ''
) AS sub
WHERE NOT EXISTS (
  SELECT 1 FROM "materials" WHERE LOWER(TRIM("name")) = LOWER(sub.mat_name)
);

-- Step 2: Create implicit many-to-many join table
CREATE TABLE "_MaterialToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_MaterialToProduct_AB_unique" ON "_MaterialToProduct"("A", "B");
CREATE INDEX "_MaterialToProduct_B_index" ON "_MaterialToProduct"("B");

ALTER TABLE "_MaterialToProduct" ADD CONSTRAINT "_MaterialToProduct_A_fkey"
  FOREIGN KEY ("A") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_MaterialToProduct" ADD CONSTRAINT "_MaterialToProduct_B_fkey"
  FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 3: Migrate existing data — connect products to matching catalog materials
INSERT INTO "_MaterialToProduct" ("A", "B")
SELECT DISTINCT m."id", p."id"
FROM "products" p,
     unnest(p."materials") AS mat_name
JOIN "materials" m ON LOWER(TRIM(mat_name)) = LOWER(TRIM(m."name"))
WHERE TRIM(mat_name) <> '';

-- Step 4: Drop the old String[] column
ALTER TABLE "products" DROP COLUMN "materials";
