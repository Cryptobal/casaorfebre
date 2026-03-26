interface FilterResult {
  isClean: boolean;
  blockedReasons: string[];
}

export function checkContactInfo(text: string): FilterResult {
  const reasons: string[] = [];
  const lower = text.toLowerCase();

  // 1. Chilean phone numbers: +569, 569, 09, 56 9 with variations of spaces/dashes
  if (/(\+?56\s*9|\b09)\s*[\d\s\-\.]{7,12}/i.test(text)) {
    reasons.push("Número de teléfono detectado");
  }

  // 2. Email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(text)) {
    reasons.push("Dirección de email detectada");
  }

  // 3. URLs
  if (/https?:\/\/|www\.|\.com\b|\.cl\b|\.net\b|\.org\b|\.io\b/i.test(text)) {
    reasons.push("URL detectada");
  }

  // 4. Social media references
  if (/instagram|whatsapp|wa\.me|facebook|telegram|twitter|tiktok|linkedin|youtube/i.test(text)) {
    reasons.push("Referencia a red social detectada");
  }

  // 5. Contact keywords (Spanish)
  const keywords = [
    "mi número", "mi numero", "escríbeme", "escribeme", "contáctame", "contactame",
    "te dejo mi", "por fuera", "directo", "mi whatsapp", "mi wsp", "mi insta",
    "mi instagram", "llámame", "llamame", "mándame", "mandame", "háblame", "hablame",
    "mi correo", "mi mail", "mi teléfono", "mi telefono", "mi cel", "mi celular",
  ];
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      reasons.push("Palabra clave de contacto detectada");
      break;
    }
  }

  return { isClean: reasons.length === 0, blockedReasons: reasons };
}

export const CONTACT_FILTER_MESSAGE =
  "Tu mensaje no puede contener datos de contacto. Toda comunicación debe realizarse a través de Casa Orfebre.";
