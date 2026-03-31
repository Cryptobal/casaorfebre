-- Add ring size adjustment fields for unique pieces
ALTER TABLE "products" ADD COLUMN "tallaUnica" TEXT;
ALTER TABLE "products" ADD COLUMN "tallaAjusteArriba" INTEGER;
ALTER TABLE "products" ADD COLUMN "tallaAjusteAbajo" INTEGER;
