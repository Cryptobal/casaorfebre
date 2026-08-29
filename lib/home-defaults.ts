export type HomeConcept = {
  title: string;
  text: string;
};

export const MAX_HOME_GALLERY_IMAGES = 12;
export const MAX_GALLERY_UPLOAD_BYTES = 2 * 1024 * 1024;

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
