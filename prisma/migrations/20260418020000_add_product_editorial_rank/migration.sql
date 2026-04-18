-- AlterTable
ALTER TABLE "products" ADD COLUMN "editorialRank" INTEGER;

-- Index para ordenamiento "Selección del Curador" (menor rank primero, NULL al final).
CREATE INDEX "products_editorialRank_idx" ON "products" ("editorialRank" ASC NULLS LAST);
