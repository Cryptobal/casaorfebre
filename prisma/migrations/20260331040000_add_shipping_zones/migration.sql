-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "regions" TEXT[],
    "price" INTEGER NOT NULL,
    "estimatedDays" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipping_zones_slug_key" ON "shipping_zones"("slug");

CREATE TABLE "shipping_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "freeShippingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "freeShippingThreshold" INTEGER NOT NULL DEFAULT 100000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

-- Seed shipping zones
INSERT INTO "shipping_zones" ("id", "name", "slug", "regions", "price", "estimatedDays", "position", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Santiago', 'santiago', ARRAY['Metropolitana de Santiago'], 3990, '1-2 días hábiles', 1, NOW()),
  (gen_random_uuid()::text, 'Centro', 'centro', ARRAY['Valparaíso', 'O''Higgins', 'Maule'], 4990, '2-3 días hábiles', 2, NOW()),
  (gen_random_uuid()::text, 'Centro-Sur', 'centro-sur', ARRAY['Ñuble', 'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos'], 5990, '2-4 días hábiles', 3, NOW()),
  (gen_random_uuid()::text, 'Norte', 'norte', ARRAY['Coquimbo', 'Atacama', 'Antofagasta', 'Tarapacá', 'Arica y Parinacota'], 6990, '3-5 días hábiles', 4, NOW()),
  (gen_random_uuid()::text, 'Austral', 'austral', ARRAY['Aysén', 'Magallanes'], 8990, '5-8 días hábiles', 5, NOW());

-- Seed shipping settings
INSERT INTO "shipping_settings" ("id", "freeShippingEnabled", "freeShippingThreshold", "updatedAt") VALUES
  ('default', true, 100000, NOW());
