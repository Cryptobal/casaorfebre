# Rollback — Editorial v1

Seguro de vida para revertir las 5 migraciones aditivas del refactor editorial.

## Qué revierte

| Migración | Qué dropea |
|---|---|
| `add_artisan_tier` | Enum `ArtisanTier`, columna `artisans.tier` |
| `add_product_year` | Columna `products.year` |
| `add_product_editorial_rank` | Columna `products.editorialRank` + índice |
| `add_artisan_editorial_fields` | `artisans.portraitUrl`, `quote`, `signatureTechniques`, `editorialRank`, `acceptsCommissions` + índice |
| `add_product_featured_of_month` | Columna `products.featuredOfMonth` + índice |

También limpia `_prisma_migrations` para que `prisma migrate status` quede consistente.

## Pre-requisito de seguridad

**Antes de correr el rollback**, crea una Neon branch desde el estado actual:

```
Neon dashboard → Branches → Create branch → "pre-rollback-<fecha>"
```

Así tenés un snapshot si algo sale mal con el rollback mismo.

## Ejecución

Todo en una transacción (BEGIN/COMMIT). Si algo falla, se cancela completo.

```bash
# Con el DATABASE_URL de la Neon branch donde aplicaste las migraciones
psql "$DATABASE_URL" -f prisma/scripts/rollback-editorial-v1/rollback.sql
```

Salida esperada:
```
BEGIN
DROP INDEX
ALTER TABLE
...
DELETE 5
COMMIT
```

## Verificación

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name IN ('products','artisans')
  AND column_name IN ('tier','year','editorialRank','portraitUrl','quote',
                      'signatureTechniques','acceptsCommissions','featuredOfMonth');
-- Debe devolver 0 filas.
```

## Después del rollback

El código del branch `claude/refactor-casa-orfebre-Sax7r` seguirá **referenciando** estas columnas en `prisma/schema.prisma` y en queries.

Dos opciones según qué quieras hacer:

### Opción A — tirar también el código del refactor
```bash
git checkout main
git branch -D claude/refactor-casa-orfebre-Sax7r
# En GitHub: cerrar PR #32 sin merge.
```

### Opción B — mantener el código editorial en el branch para reconsiderarlo más tarde
No hagas nada con el branch. Solo no lo merges. Cuando quieras retomar, reaplicás las migraciones forward:
```bash
npx prisma migrate deploy
```
y las columnas vuelven.

## Cuándo NO correr esto

- Si metiste datos reales en las columnas nuevas (p. ej. asignaste `tier=MAESTRO`
  a orfebres, o `editorialRank` a piezas, o escribiste `quote`/`bio` nuevas).
  Esos datos se pierden. Exportalos primero con `pg_dump` si los querés preservar.

- Si el branch editorial ya está mergeado a `main` y deployado a producción.
  Revierte primero el código (ver README principal del PR), luego esto.
