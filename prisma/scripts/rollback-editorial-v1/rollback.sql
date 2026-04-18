-- =============================================================================
-- ROLLBACK COMPLETO DE EDITORIAL V1
-- =============================================================================
-- Revierte las 5 migraciones aditivas aplicadas por el PR editorial-v1.
-- Se ejecuta dentro de una transacción: o se deshace todo, o nada.
--
-- Orden inverso al forward (LIFO):
--   5. add_product_featured_of_month
--   4. add_artisan_editorial_fields
--   3. add_product_editorial_rank
--   2. add_product_year
--   1. add_artisan_tier
--
-- AL TERMINAR: las columnas nuevas desaparecen y el historial de Prisma queda
-- limpio (para que migrate status no reporte "applied" sobre migraciones ausentes).
--
-- USO:
--   psql "$DATABASE_URL" -f rollback.sql
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 5. add_product_featured_of_month
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS "products_featuredOfMonth_idx";
ALTER TABLE "products" DROP COLUMN IF EXISTS "featuredOfMonth";

-- -----------------------------------------------------------------------------
-- 4. add_artisan_editorial_fields
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS "artisans_editorialRank_idx";
ALTER TABLE "artisans"
  DROP COLUMN IF EXISTS "portraitUrl",
  DROP COLUMN IF EXISTS "quote",
  DROP COLUMN IF EXISTS "signatureTechniques",
  DROP COLUMN IF EXISTS "editorialRank",
  DROP COLUMN IF EXISTS "acceptsCommissions";

-- -----------------------------------------------------------------------------
-- 3. add_product_editorial_rank
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS "products_editorialRank_idx";
ALTER TABLE "products" DROP COLUMN IF EXISTS "editorialRank";

-- -----------------------------------------------------------------------------
-- 2. add_product_year
-- -----------------------------------------------------------------------------
ALTER TABLE "products" DROP COLUMN IF EXISTS "year";

-- -----------------------------------------------------------------------------
-- 1. add_artisan_tier
-- -----------------------------------------------------------------------------
ALTER TABLE "artisans" DROP COLUMN IF EXISTS "tier";
DROP TYPE IF EXISTS "ArtisanTier";

-- -----------------------------------------------------------------------------
-- Data cleanup opcional: revierte curadurías / ranking / pieza del mes.
-- (Sólo corre si las columnas aún existieran — como ya las dropeamos arriba,
-- estas líneas se vuelven no-op pero quedan documentadas abajo para referencia.)
-- -----------------------------------------------------------------------------
-- UPDATE artisans SET tier = 'ORFEBRE' WHERE tier <> 'ORFEBRE';
-- UPDATE products SET "editorialRank" = NULL WHERE "editorialRank" IS NOT NULL;
-- UPDATE products SET "featuredOfMonth" = false WHERE "featuredOfMonth" = true;

-- -----------------------------------------------------------------------------
-- Limpiar historial de Prisma para las 5 migraciones.
-- Necesario si aplicaste con `prisma migrate deploy` — evita que `migrate status`
-- reporte inconsistencia entre _prisma_migrations y el schema real.
-- -----------------------------------------------------------------------------
DELETE FROM "_prisma_migrations"
WHERE migration_name IN (
  '20260418000000_add_artisan_tier',
  '20260418010000_add_product_year',
  '20260418020000_add_product_editorial_rank',
  '20260418030000_add_artisan_editorial_fields',
  '20260418040000_add_product_featured_of_month'
);

COMMIT;

-- Verificación rápida post-rollback:
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name IN ('products','artisans')
--     AND column_name IN ('tier','year','editorialRank','portraitUrl','quote',
--                         'signatureTechniques','acceptsCommissions','featuredOfMonth');
-- Debe devolver 0 filas.
