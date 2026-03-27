/**
 * Anti-contact filter for chat messages.
 * Detects phone numbers, emails, URLs, social media handles, and direct contact attempts.
 */

export function filterMessage(content: string): {
  isBlocked: boolean;
  reason: string | null;
} {
  // Normalize: remove separating dots/dashes/spaces between letters (w.h.a.t.s.a.p.p → whatsapp)
  const stripped = content
    .toLowerCase()
    .replace(/([a-záéíóúñ])[\s.\-_]+(?=[a-záéíóúñ])/g, "$1");

  const normalized = content.toLowerCase();

  // --- Phone numbers ---
  // Chilean format +56 or patterns with 8-9 digits
  if (/\+\s*5\s*6/.test(normalized)) {
    return { isBlocked: true, reason: "Detectado: número de teléfono (+56)" };
  }
  // 8-9 consecutive digits (with optional spaces/dashes)
  const digitsOnly = normalized.replace(/[^\d]/g, "");
  if (digitsOnly.length >= 8 && /\d[\s\-]?\d[\s\-]?\d[\s\-]?\d[\s\-]?\d[\s\-]?\d[\s\-]?\d[\s\-]?\d/.test(normalized)) {
    return { isBlocked: true, reason: "Detectado: número de teléfono" };
  }

  // --- Numbers in words (4+ sequential) ---
  const numberWords =
    /(?:cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)[\s,y]+(?:cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)[\s,y]+(?:cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)[\s,y]+(?:cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/;
  if (numberWords.test(normalized)) {
    return { isBlocked: true, reason: "Detectado: números escritos en palabras" };
  }

  // --- Emails ---
  if (/@/.test(normalized) || /\barroba\b/.test(normalized)) {
    return { isBlocked: true, reason: "Detectado: dirección de email" };
  }
  if (/\b\w+\s*(at|arroba)\s*\w+\s*(punto|dot|\.)\s*(com|cl|net|org)\b/.test(normalized)) {
    return { isBlocked: true, reason: "Detectado: dirección de email ofuscada" };
  }

  // --- URLs ---
  if (/https?:\/\//.test(normalized) || /\bwww\./.test(normalized)) {
    return { isBlocked: true, reason: "Detectado: enlace URL" };
  }
  if (/\b\w+\.(com|cl|net|org|io)\b/.test(normalized)) {
    return { isBlocked: true, reason: "Detectado: dirección web" };
  }

  // --- Social media (check stripped version too) ---
  const socialPatterns = [
    { pattern: /\bwhatsapp\b|\bwsp\b|\bwapp\b|\bwhats\s*app\b/, label: "WhatsApp" },
    { pattern: /\binstagram\b|\binsta\b|\big\b/, label: "Instagram" },
    { pattern: /\bfacebook\b|\bfb\b/, label: "Facebook" },
    { pattern: /\btelegram\b/, label: "Telegram" },
    { pattern: /\btiktok\b/, label: "TikTok" },
    { pattern: /\btwitter\b|\bx\.com\b/, label: "Twitter/X" },
  ];

  for (const { pattern, label } of socialPatterns) {
    if (pattern.test(normalized) || pattern.test(stripped)) {
      return { isBlocked: true, reason: `Detectado: referencia a ${label}` };
    }
  }

  // --- Direct contact keywords ---
  const contactPatterns = [
    { pattern: /\bllamam?e?\b|\bll[aá]mame\b/, label: "intento de llamada" },
    { pattern: /\btel[ée]fono\b|\bcelular\b|\bfono\b/, label: "referencia a teléfono" },
    { pattern: /\bcontacto\s+directo\b/, label: "contacto directo" },
    { pattern: /\bpor\s+fuera\b|\bfuera\s+de\s+la\s+plataforma\b/, label: "contacto fuera de plataforma" },
    { pattern: /\bte\s+doy\s+mi\s+n[uú]mero\b|\bdame\s+tu\s+n[uú]mero\b/, label: "intercambio de número" },
    { pattern: /\bmi\s+correo\b/, label: "referencia a correo personal" },
  ];

  for (const { pattern, label } of contactPatterns) {
    if (pattern.test(normalized)) {
      return { isBlocked: true, reason: `Detectado: ${label}` };
    }
  }

  return { isBlocked: false, reason: null };
}
