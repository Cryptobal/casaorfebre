import type { ProductionType } from "@prisma/client";

interface ProductEditionInput {
  productionType: ProductionType;
  /** Tamaño total de la edición (si LIMITED y se conoce). */
  cantidadEdicion?: number | null;
  /** Número específico de esta pieza dentro de la edición (si aplica). */
  numeroEdicion?: number | null;
}

/**
 * Etiqueta editorial derivada del tipo de producción.
 * - UNIQUE          → "Pieza única"
 * - MADE_TO_ORDER   → "Hecha por encargo"
 * - LIMITED con n/total → "Ed. 9/12"
 * - LIMITED con total   → "Ed. limitada de 12"
 * - LIMITED sin datos   → "Edición limitada"
 *
 * La fuente de verdad sigue siendo productionType en DB; no hay campo
 * editionLabel (evita duplicación y mantiene consistencia).
 */
export function getEditionLabel(product: ProductEditionInput): string {
  switch (product.productionType) {
    case "UNIQUE":
      return "Pieza única";
    case "MADE_TO_ORDER":
      return "Hecha por encargo";
    case "LIMITED":
      if (product.numeroEdicion && product.cantidadEdicion) {
        return `Ed. ${product.numeroEdicion}/${product.cantidadEdicion}`;
      }
      if (product.cantidadEdicion) {
        return `Ed. limitada de ${product.cantidadEdicion}`;
      }
      return "Edición limitada";
    default:
      return "";
  }
}
