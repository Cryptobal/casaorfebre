-- AlterTable
ALTER TABLE "promo_codes" ADD COLUMN "phone" TEXT;
ALTER TABLE "promo_codes" ADD COLUMN "whatsappSentAt" TIMESTAMP(3);
ALTER TABLE "promo_codes" ADD COLUMN "whatsappClickedAt" TIMESTAMP(3);
