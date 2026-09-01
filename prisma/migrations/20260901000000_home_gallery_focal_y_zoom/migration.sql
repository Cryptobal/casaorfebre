-- Encuadre vertical y zoom (agrandar) para recortar cada foto de la galería.
-- Idempotente: el build de Vercel también aplica estas columnas vía ensure-production-schema.mjs.
ALTER TABLE "home_gallery_images"
  ADD COLUMN IF NOT EXISTS "focalY" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS "zoom" INTEGER NOT NULL DEFAULT 100;
