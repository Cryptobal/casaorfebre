-- CreateEnum
CREATE TYPE "ArtisanTier" AS ENUM ('EMERGENTE', 'ORFEBRE', 'MAESTRO');

-- AlterTable
ALTER TABLE "artisans" ADD COLUMN "tier" "ArtisanTier" NOT NULL DEFAULT 'ORFEBRE';
