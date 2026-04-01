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

async function fetchFontBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OG font fetch failed ${res.status}: ${url}`);
  }
  const buf = await res.arrayBuffer();
  const prefix = new TextDecoder('latin1').decode(buf.slice(0, 5));
  if (prefix.startsWith('<!DOC') || prefix.startsWith('<html')) {
    throw new Error(`OG font URL returned HTML (bad or stale URL): ${url}`);
  }
  return buf;
}

export type BrandOgFontBuffers = {
  cormorantGaramond300: ArrayBuffer;
  outfit300: ArrayBuffer;
  outfit400: ArrayBuffer;
};

export async function loadBrandOgFonts(): Promise<BrandOgFontBuffers> {
  const [cormorantGaramond300, outfit300, outfit400] = await Promise.all([
    fetchFontBuffer(CORMORANT_GARAMOND_300),
    fetchFontBuffer(OUTFIT_300),
    fetchFontBuffer(OUTFIT_400),
  ]);
  return { cormorantGaramond300, outfit300, outfit400 };
}

export function brandOgImageFonts(fonts: BrandOgFontBuffers) {
  return [
    {
      name: 'Cormorant Garamond',
      data: fonts.cormorantGaramond300,
      weight: 300 as const,
      style: 'normal' as const,
    },
    {
      name: 'Outfit',
      data: fonts.outfit300,
      weight: 300 as const,
      style: 'normal' as const,
    },
    {
      name: 'Outfit',
      data: fonts.outfit400,
      weight: 400 as const,
      style: 'normal' as const,
    },
  ];
}
