-- AlterTable
ALTER TABLE "products" ADD COLUMN "isCuratorPick" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "curatorPickAt" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "curatorNote" TEXT;
