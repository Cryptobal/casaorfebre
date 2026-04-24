/**
 * URLs de fuentes para @vercel/og (ImageResponse).
 * Las rutas `/s/.../vXX/*.ttf` en gstatic cambian; si quedan obsoletas devuelven HTML y el build falla con
 * "Unsupported OpenType signature <!DO". Estas URLs provienen del CSS actual de Google Fonts (WOFF).
 */
const CORMORANT_GARAMOND_300 =
  'https://fonts.gstatic.com/l/font?kit=co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_qE6GnA&skey=a863d1376a24bd7a&v=v21';

const OUTFIT_300 =
  'https://fonts.gstatic.com/l/font?kit=QGYyz_MVcBeNP4NjuGObqx1XmO1I4W61C4I&skey=bafc0b239d492b2c&v=v15';

const OUTFIT_400 =
  'https://fonts.gstatic.com/l/font?kit=QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4I&skey=bafc0b239d492b2c&v=v15';

async function fetchFontBuffer(url: string, attempt = 1): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`OG font fetch failed ${res.status}: ${url}`);
    }
    const buf = await res.arrayBuffer();
    const prefix = new TextDecoder('latin1').decode(buf.slice(0, 5));
    if (prefix.startsWith('<!DOC') || prefix.startsWith('<html')) {
      throw new Error(`OG font URL returned HTML (bad or stale URL): ${url}`);
    }
    return buf;
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
      return fetchFontBuffer(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export type BrandOgFontBuffers = {
  cormorantGaramond300: ArrayBuffer | null;
  outfit300: ArrayBuffer | null;
  outfit400: ArrayBuffer | null;
};

async function safeFetch(url: string): Promise<ArrayBuffer | null> {
  try {
    return await fetchFontBuffer(url);
  } catch (err) {
    console.warn(`[OG fonts] falling back for ${url}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function loadBrandOgFonts(): Promise<BrandOgFontBuffers> {
  const [cormorantGaramond300, outfit300, outfit400] = await Promise.all([
    safeFetch(CORMORANT_GARAMOND_300),
    safeFetch(OUTFIT_300),
    safeFetch(OUTFIT_400),
  ]);
  return { cormorantGaramond300, outfit300, outfit400 };
}

export function brandOgImageFonts(fonts: BrandOgFontBuffers) {
  const entries: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 300 | 400;
    style: 'normal';
  }> = [];
  if (fonts.cormorantGaramond300) {
    entries.push({
      name: 'Cormorant Garamond',
      data: fonts.cormorantGaramond300,
      weight: 300,
      style: 'normal',
    });
  }
  if (fonts.outfit300) {
    entries.push({ name: 'Outfit', data: fonts.outfit300, weight: 300, style: 'normal' });
  }
  if (fonts.outfit400) {
    entries.push({ name: 'Outfit', data: fonts.outfit400, weight: 400, style: 'normal' });
  }
  return entries;
}
