import type { CSSProperties } from "react";

export type HomeConcept = {
  title: string;
  text: string;
};

export const MAX_GALLERY_UPLOAD_BYTES = 2 * 1024 * 1024;
export const DEFAULT_GALLERY_FOCAL_X = 50;
export const DEFAULT_GALLERY_FOCAL_Y = 50;
export const DEFAULT_GALLERY_ZOOM = 100;
export const MIN_GALLERY_ZOOM = 100;
export const MAX_GALLERY_ZOOM = 300;

function clampPercent(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function clampGalleryFocalX(value: number): number {
  return clampPercent(value, DEFAULT_GALLERY_FOCAL_X);
}

export function clampGalleryFocalY(value: number): number {
  return clampPercent(value, DEFAULT_GALLERY_FOCAL_Y);
}

export function clampGalleryZoom(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_GALLERY_ZOOM;
  return Math.min(
    MAX_GALLERY_ZOOM,
    Math.max(MIN_GALLERY_ZOOM, Math.round(value))
  );
}

export type GalleryCrop = {
  focalX: number;
  focalY: number;
  zoom: number;
};

export function galleryCropStyle(crop: GalleryCrop): CSSProperties {
  const origin = `${crop.focalX}% ${crop.focalY}%`;
  return {
    objectPosition: origin,
    transform: crop.zoom > DEFAULT_GALLERY_ZOOM ? `scale(${crop.zoom / 100})` : undefined,
    transformOrigin: origin,
  };
}

export function suggestedGalleryCaption(
  materialNames: readonly string[],
  productName: string
): string {
  const names = materialNames.map((name) => name.trim()).filter(Boolean);
  if (names.length === 0) return productName.trim();
  return names.map((name) => name.toLowerCase()).join(" y ");
}

export const HOME_DEFAULTS = {
  heroPhrase: "Joyas creadas desde el instinto, la materia y el proceso.",
  manifestoLead: "Trabajo la joyería como un proceso de exploración.",
  manifestoParagraphs: [
    "Muchas de mis piezas nacen desde una idea, una textura o simplemente desde lo que ocurre mientras trabajo. Por eso, la mayoría son piezas únicas: no busco repetir exactamente una misma forma, sino dejar espacio para que cada pieza encuentre su propio carácter.",
    "Me atraen las formas orgánicas, las imperfecciones y aquello que no se puede reproducir de manera idéntica.",
    "Trabajo principalmente con plata, bronce y oro, explorando distintas técnicas y materiales. Poco a poco, este proceso también irá dando forma a nuevas colecciones y universos inspirados en distintas temáticas.",
    "Actualmente no trabajo principalmente a pedido ni realizo reproducciones exactas de diseños. Mi intención es crear piezas desde mi propio lenguaje y proceso. Sin embargo, si tienes una idea que conecte con mi estilo, podemos conversar y ver qué podemos crear.",
  ],
  concepts: [
    {
      title: "Piezas únicas",
      text: "La mayoría de mis joyas son irrepetibles. Cada una nace desde el proceso y conserva sus propias formas y detalles.",
    },
    {
      title: "Formas orgánicas",
      text: "Me interesa lo imperfecto, lo irregular y aquello que parece haber sido encontrado más que fabricado.",
    },
    {
      title: "Materiales",
      text: "Trabajo principalmente con plata, bronce y oro, explorando distintas técnicas y formas.",
    },
    {
      title: "En proceso",
      text: "Estoy constantemente explorando nuevas ideas, técnicas y temáticas que poco a poco darán vida a futuras colecciones.",
    },
  ] satisfies HomeConcept[],
  galleryIntro:
    "Algunas pertenecen a futuras colecciones, otras simplemente existen una sola vez.",
  contactInstagramText:
    "Puedes seguir mi proceso, ver nuevas piezas y próximos proyectos en Instagram.",
  contactWhatsappText:
    "¿Te interesa alguna pieza o tienes una idea que conecte con mi estilo?",
} as const;

export function joinManifesto(
  lead: string,
  paragraphs: readonly string[]
): string {
  return [lead, ...paragraphs].join("\n\n");
}

export const HOME_DEFAULT_MANIFESTO = joinManifesto(
  HOME_DEFAULTS.manifestoLead,
  HOME_DEFAULTS.manifestoParagraphs
);

export function splitManifesto(manifesto: string): {
  lead: string;
  paragraphs: string[];
} {
  const parts = manifesto
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return {
      lead: HOME_DEFAULTS.manifestoLead,
      paragraphs: [...HOME_DEFAULTS.manifestoParagraphs],
    };
  }

  return { lead: parts[0], paragraphs: parts.slice(1) };
}

export function emptyConcepts(): HomeConcept[] {
  return HOME_DEFAULTS.concepts.map(() => ({ title: "", text: "" }));
}
