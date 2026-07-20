-- Shipping cost transferred to the artisan, prorated per order item.
-- The `OrderItem.shippingShare` field was added to prisma/schema.prisma with
-- the shipping-payout feature but never applied to production, so Prisma reads
-- that auto-select every scalar column (orfebre pedidos/finanzas, admin payout
-- views) failed with P2022 ColumnNotFound. Idempotent so it is safe whether or
-- not the column was already created via `prisma db push`.
ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "shippingShare" INTEGER NOT NULL DEFAULT 0;
