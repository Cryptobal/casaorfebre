export type SiteMode = "atelier" | "marketplace";

/** Cambia a `"marketplace"` para revertir el one-pager y reactivar catálogo/pagos. */
export const SITE_MODE: SiteMode = "atelier";

export const isMarketplaceMode = () => SITE_MODE === "marketplace";

export const ATELIER_APPLICATIONS_MESSAGE =
  "Las postulaciones están pausadas por ahora.";

export const ATELIER_PAYMENTS_MESSAGE =
  "Las compras en línea están pausadas. Escríbeme por Instagram o WhatsApp.";

// TODO Carlos: confirmar número definitivo antes del deploy
export const PORTAL_WHATSAPP_URL =
  "https://wa.me/56968780089?text=Hola%20Camila%2C%20vi%20tu%20trabajo%20en%20Casa%20Orfebre";

// TODO Carlos: confirmar handle exacto antes del deploy
export const PORTAL_INSTAGRAM_URL = "https://www.instagram.com/camilaorfebreria";

const ASSETS_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
  "https://assets.casaorfebre.cl"; // pragma: allowlist secret

export const HERO_VIDEO_URL = `${ASSETS_BASE}/home/hero-camila.mp4`;
export const HERO_POSTER_URL = `${ASSETS_BASE}/home/hero-camila-poster.webp`;

export const HERO_POSTER_ALT =
  "Camila de espaldas trabajando metal en su banco de orfebre, luz cálida en penumbra";

export const HERO_PHRASE =
  "Joyas creadas desde el instinto, la materia y el proceso.";

export const MANIFIESTO_KICKER = "Sobre mi trabajo";

export const MANIFIESTO_LEAD = "Trabajo la joyería como un proceso de exploración.";

export const MANIFIESTO_PARAGRAPHS = [
  "Muchas de mis piezas nacen desde una idea, una textura o simplemente desde lo que ocurre mientras trabajo. Por eso, la mayoría son piezas únicas: no busco repetir exactamente una misma forma, sino dejar espacio para que cada pieza encuentre su propio carácter.",
  "Me atraen las formas orgánicas, las imperfecciones y aquello que no se puede reproducir de manera idéntica.",
  "Trabajo principalmente con plata, bronce y oro, explorando distintas técnicas y materiales. Poco a poco, este proceso también irá dando forma a nuevas colecciones y universos inspirados en distintas temáticas.",
  "Actualmente no trabajo principalmente a pedido ni realizo reproducciones exactas de diseños. Mi intención es crear piezas desde mi propio lenguaje y proceso. Sin embargo, si tienes una idea que conecte con mi estilo, podemos conversar y ver qué podemos crear.",
] as const;

export const CONCEPTS = [
  {
    title: "Piezas únicas",
    body: "La mayoría de mis joyas son irrepetibles. Cada una nace desde el proceso y conserva sus propias formas y detalles.",
  },
  {
    title: "Formas orgánicas",
    body: "Me interesa lo imperfecto, lo irregular y aquello que parece haber sido encontrado más que fabricado.",
  },
  {
    title: "Materiales",
    body: "Trabajo principalmente con plata, bronce y oro, explorando distintas técnicas y formas.",
  },
  {
    title: "En proceso",
    body: "Estoy constantemente explorando nuevas ideas, técnicas y temáticas que poco a poco darán vida a futuras colecciones.",
  },
] as const;

export const GALLERY_QUOTE =
  "Algunas pertenecen a futuras colecciones, otras simplemente existen una sola vez.";

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  aspectClass: string;
  offsetClass?: string;
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

export const CONTACT_INSTAGRAM_TEXT =
  "Puedes seguir mi proceso, ver nuevas piezas y próximos proyectos en Instagram.";

export const CONTACT_WHATSAPP_TEXT =
  "¿Te interesa alguna pieza o tienes una idea que conecte con mi estilo?";
