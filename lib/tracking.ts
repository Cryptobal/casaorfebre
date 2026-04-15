const TRACKING_URLS: Record<string, (tn: string) => string> = {
  Chilexpress: (tn) => `https://centrodeayuda.chilexpress.cl/seguimiento/${encodeURIComponent(tn)}`,
  Starken: (tn) => `https://www.starken.cl/seguimiento?codigo=${encodeURIComponent(tn)}`,
  "Blue Express": (tn) => `https://tracking-unificado.blue.cl/?os=${encodeURIComponent(tn)}`,
  "Correos de Chile": (tn) => `https://www.correos.cl/web/guest/seguimiento-en-linea?codigos=${encodeURIComponent(tn)}`,
};

export function getTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const urlFn = TRACKING_URLS[carrier];
  return urlFn ? urlFn(trackingNumber) : null;
}

export const CARRIERS = ["Chilexpress", "Starken", "Blue Express", "Correos de Chile", "Otro"];

/**
 * Basic format validation per carrier.
 * Returns null if valid, or an error message if invalid.
 */
export function validateTrackingNumber(carrier: string, raw: string): string | null {
  const tn = raw.trim().replace(/[\s-]/g, "");
  if (tn.length < 5) return "El número de seguimiento es muy corto";
  if (tn.length > 30) return "El número de seguimiento es muy largo";

  switch (carrier) {
    case "Chilexpress":
      if (!/^\d{9,12}$/.test(tn)) return "Chilexpress usa números de 9 a 12 dígitos";
      break;
    case "Blue Express":
      if (!/^\d{8,12}$/.test(tn)) return "Blue Express usa números de 8 a 12 dígitos";
      break;
    case "Correos de Chile":
      if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(tn) && !/^\d{10,13}$/.test(tn))
        return "Formato inválido para Correos de Chile (ej: RR123456789CL)";
      break;
    // Starken and "Otro" accept any alphanumeric format
  }

  return null;
}

/** Sanitize tracking number: trim whitespace and remove spaces/dashes */
export function sanitizeTrackingNumber(raw: string): string {
  return raw.trim().replace(/[\s-]/g, "");
}
