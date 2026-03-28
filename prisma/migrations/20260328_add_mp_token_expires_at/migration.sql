-- AlterTable: Add mpTokenExpiresAt to artisans
ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "mpTokenExpiresAt" TIMESTAMP(3);
