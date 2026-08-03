import type { Prisma } from "@prisma/client";

/**
 * Productos visibles en el sitio público / APIs / feeds.
 * Un producto APPROVED de un orfebre SUSPENDED (u otro estado no activo)
 * no debe aparecer en catálogo, regalar, búsqueda, etc.
 */
export const PUBLIC_PRODUCT_WHERE = {
  status: "APPROVED",
  artisan: { status: "APPROVED" },
} satisfies Prisma.ProductWhereInput;

/**
 * Combina filtros adicionales con la regla de visibilidad pública.
 * Si ya viene un filtro `artisan`, se fusiona preservando `status: APPROVED`.
 */
export function publicProductWhere(
  extra: Prisma.ProductWhereInput = {},
): Prisma.ProductWhereInput {
  const { artisan: artisanExtra, status: _status, ...rest } = extra;

  let artisan: Prisma.ArtisanWhereInput = { status: "APPROVED" };
  if (artisanExtra && typeof artisanExtra === "object") {
    artisan = { status: "APPROVED", ...artisanExtra };
  }

  return {
    ...rest,
    status: "APPROVED",
    artisan,
  };
}

/** Condición SQL cruda equivalente a PUBLIC_PRODUCT_WHERE (alias de producto `p`). */
export const PUBLIC_PRODUCT_SQL = `p."status" = 'APPROVED' AND EXISTS (
  SELECT 1 FROM "artisans" a
  WHERE a."id" = p."artisanId" AND a."status" = 'APPROVED'
)`;
