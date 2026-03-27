/**
 * Imagen de hero de la portada (R2 / Cloudflare).
 * Subir o actualizar: `npx tsx scripts/upload-home-hero.ts [ruta.jpg]`
 */
export const HOME_HERO_IMAGE_URL =
  process.env.NEXT_PUBLIC_HOME_HERO_IMAGE_URL ??
  "https://assets.casaorfebre.cl/site/home-hero-orfebre.jpg";
