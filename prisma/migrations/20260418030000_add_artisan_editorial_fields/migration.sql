-- AlterTable: campos editoriales del orfebre
ALTER TABLE "artisans"
  ADD COLUMN "portraitUrl" TEXT,
  ADD COLUMN "quote" TEXT,
  ADD COLUMN "signatureTechniques" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "editorialRank" INTEGER,
  ADD COLUMN "acceptsCommissions" BOOLEAN NOT NULL DEFAULT false;

-- Index para orden del directorio (NULL al final).
CREATE INDEX "artisans_editorialRank_idx" ON "artisans" ("editorialRank" ASC NULLS LAST);
