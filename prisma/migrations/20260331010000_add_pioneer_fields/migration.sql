-- Add pioneer fields for artisans
ALTER TABLE "artisans" ADD COLUMN "isPioneer" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "artisans" ADD COLUMN "pioneerUntil" TIMESTAMP(3);
ALTER TABLE "artisans" ADD COLUMN "pioneerGrantedBy" TEXT;
