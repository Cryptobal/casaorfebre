/**
 * Textos editoriales para el hero del listado /coleccion.
 * - La clave es el slug de categoría (cuando se filtra por una), "default" cuando no.
 * - Contenido aprobado en el brief editorial v1 de Carlos.
 * - Si falta copy para un slug específico, se muestra el default.
 *
 * TODO CONTENIDO: completar intros por categoría cuando Camila/Carlos los redacten.
 */
export interface CollectionIntro {
  /** Tipografía display principal (Cormorant). */
  heading: string;
  /** Subtítulo Outfit italic. El HTML puede incluir <em> en segmentos clave. */
  subheading: string;
  /** Párrafo editorial (3-4 líneas). */
  paragraph: string;
}

const INTROS: Record<string, CollectionIntro> = {
  default: {
    heading: "Colección",
    subheading: "Piezas de <em>autor</em> hechas a mano en Chile.",
    paragraph:
      "Cada pieza está firmada por su orfebre, verificada por nuestra curaduría, y acompañada de un certificado digital de autenticidad. Lo que ves es lo que recibes — y lo que recibes está hecho para durar.",
  },
  anillos: {
    heading: "Anillos",
    subheading: "Piezas únicas y ediciones limitadas.",
    paragraph:
      "Cada anillo es una obra terminada en su propio tiempo. Algunos nacen de la cera perdida, otros del martillado en frío, otros de la unión precisa de dos superficies. Todos vienen firmados.",
  },
  aros: {
    heading: "Aros",
    subheading: "Presencia en el contorno del rostro.",
    paragraph:
      "Aros que sostienen luz y movimiento. Algunos diminutos, otros arquitectónicos. Cada par pensado pieza por pieza y hecho a mano por un orfebre chileno.",
  },
  collares: {
    heading: "Collares",
    subheading: "Piezas para llevar cerca del pecho.",
    paragraph:
      "Del dije íntimo al collar como declaración. Platas trabajadas a mano, piedras con procedencia clara, composiciones que buscan durar generaciones.",
  },
  pulseras: {
    heading: "Pulseras",
    subheading: "Presencia discreta en la muñeca.",
    paragraph:
      "Desde la pulsera apenas visible hasta el brazalete firme. Cada una es una conversación silenciosa con el cuerpo, hecha a mano por orfebres independientes.",
  },
  colgantes: {
    heading: "Colgantes",
    subheading: "Dijes con historia propia.",
    paragraph:
      "Pequeñas esculturas que se llevan cerca. Iconografía chilena, naturaleza, geometría contemporánea. Cada pieza única, cada autoría reconocida.",
  },
};

/**
 * Retorna el intro editorial para un slug dado. Si no hay uno específico,
 * retorna el default.
 */
export function getCollectionIntro(slug?: string): CollectionIntro {
  if (!slug) return INTROS.default;
  return INTROS[slug] ?? INTROS.default;
}
