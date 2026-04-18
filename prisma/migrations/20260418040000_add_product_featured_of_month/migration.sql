-- AlterTable
ALTER TABLE "products" ADD COLUMN "featuredOfMonth" BOOLEAN NOT NULL DEFAULT false;

-- Índice parcial: sólo indexa la pieza activa del mes (típicamente 1 fila).
CREATE INDEX "products_featuredOfMonth_idx" ON "products" ("featuredOfMonth") WHERE "featuredOfMonth" = true;
