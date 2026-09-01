import { HOME_DEFAULTS } from "@/lib/home-defaults";

export type SiteMode = "atelier" | "marketplace";

/** Cambia a `"marketplace"` para revertir el one-pager y reactivar catálogo/pagos. */
export const SITE_MODE: SiteMode = "atelier";

export const isMarketplaceMode = (): boolean =>
  (SITE_MODE as SiteMode) === "marketplace";

export const ATELIER_APPLICATIONS_MESSAGE =
  "Las postulaciones están pausadas por ahora.";

export const ATELIER_PAYMENTS_MESSAGE =
  "Las compras en línea están pausadas. Escríbeme por Instagram o WhatsApp.";

// TODO Carlos: confirmar número definitivo antes del deploy
export const PORTAL_WHATSAPP_URL =
  "https://wa.me/56968780089?text=Hola%20Camila%2C%20vi%20tu%20trabajo%20en%20Casa%20Orfebre";

export const PORTAL_INSTAGRAM_USERNAME = "camila.orfebreria";
export const PORTAL_INSTAGRAM_URL = `https://www.instagram.com/${PORTAL_INSTAGRAM_USERNAME}/`;

const ASSETS_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
  "https://assets.casaorfebre.cl"; // pragma: allowlist secret

export const HERO_VIDEO_URL = `${ASSETS_BASE}/home/hero-camila.mp4`;
export const HERO_POSTER_URL = `${ASSETS_BASE}/home/hero-camila-poster.webp`;

export const HERO_POSTER_ALT =
  "Camila de espaldas trabajando metal en su banco de orfebre, luz cálida en penumbra";

export const HERO_PHRASE = HOME_DEFAULTS.heroPhrase;

export const MANIFIESTO_KICKER = "Sobre mi trabajo";

export const MANIFIESTO_LEAD = HOME_DEFAULTS.manifestoLead;

export const MANIFIESTO_PARAGRAPHS = HOME_DEFAULTS.manifestoParagraphs;

export const CONCEPTS = HOME_DEFAULTS.concepts.map((concept) => ({
  title: concept.title,
  body: concept.text,
}));

export const GALLERY_QUOTE = HOME_DEFAULTS.galleryIntro;

export type GalleryImage = {
  id?: string;
  src: string;
  alt: string;
  caption: string;
  aspectClass: string;
  offsetClass?: string;
  focalX?: number;
  focalY?: number;
  zoom?: number;
};

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: `${ASSETS_BASE}/home/galeria/01.webp`,
    alt: "Anillo de plata orgánico sobre piedra",
    caption: "plata 950",
    aspectClass: "aspect-[3/4]",
  },
  {
    src: `${ASSETS_BASE}/home/galeria/02.webp`,
    alt: "Aros de bronce martillado sobre lino",
    caption: "bronce",
    aspectClass: "aspect-[4/5]",
    offsetClass: "pt-[clamp(0px,4vw,56px)]",
  },
  {
    src: `${ASSETS_BASE}/home/galeria/03.webp`,
    alt: "Colgante de forma irregular, luz natural",
    caption: "plata 950",
    aspectClass: "aspect-square",
  },
  {
    src: `${ASSETS_BASE}/home/galeria/04.webp`,
    alt: "Pulsera texturada en banco de trabajo",
    caption: "plata y bronce",
    aspectClass: "aspect-[4/5]",
    offsetClass: "pt-[clamp(0px,3vw,40px)]",
  },
  {
    src: `${ASSETS_BASE}/home/galeria/05.webp`,
    alt: "Anillo con detalle de oro, fondo neutro",
    caption: "plata y oro",
    aspectClass: "aspect-[3/4]",
  },
  {
    src: `${ASSETS_BASE}/home/galeria/06.webp`,
    alt: "Pieza única sobre piedra gris",
    caption: "bronce",
    aspectClass: "aspect-square",
    offsetClass: "pt-[clamp(0px,4vw,56px)]",
  },
];

export const CONTACT_INSTAGRAM_TEXT = HOME_DEFAULTS.contactInstagramText;

export const CONTACT_WHATSAPP_TEXT = HOME_DEFAULTS.contactWhatsappText;
