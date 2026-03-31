const TRACKING_URLS: Record<string, (tn: string) => string> = {
  Chilexpress: (tn) => `https://www.chilexpress.cl/estado-de-tu-envio/?tracking-number=${tn}`,
  Starken: (tn) => `https://www.starken.cl/seguimiento?codigo=${tn}`,
  "Blue Express": (tn) => `https://www.bluex.cl/seguimiento/?n=${tn}`,
  "Correos de Chile": (tn) => `https://www.correos.cl/web/guest/seguimiento-en-linea?codigos=${tn}`,
};

export function getTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const urlFn = TRACKING_URLS[carrier];
  return urlFn ? urlFn(trackingNumber) : null;
}

export const CARRIERS = ["Chilexpress", "Starken", "Blue Express", "Correos de Chile", "Otro"];
