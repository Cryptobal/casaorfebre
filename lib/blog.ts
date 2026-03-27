export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "joyeria-de-autor-chile-renacimiento-orfebreria-artesanal",
    title:
      "Joyería de Autor en Chile: El Renacimiento de la Orfebrería Artesanal",
    excerpt:
      "Descubre cómo el movimiento de joyería de autor está transformando la escena artesanal chilena, recuperando técnicas ancestrales y creando piezas únicas con identidad.",
    category: "Cultura Orfebre",
    tags: ["joyería de autor", "orfebrería chilena", "artesanía", "plata"],
    author: "Casa Orfebre",
    publishedAt: "2026-03-26",
    coverImage: "/blog/joyeria-autor-chile.jpg",
    seoTitle:
      "Joyería de Autor en Chile: El Renacimiento de la Orfebrería Artesanal | Casa Orfebre",
    seoDescription:
      "Explora el movimiento de joyería de autor en Chile. Historia, técnicas, materiales nobles y el rol de los orfebres independientes en la escena artesanal contemporánea.",
  },
  {
    slug: "guia-elegir-cuidar-joyas-artesanales-plata",
    title:
      "Guía Completa: Cómo Elegir y Cuidar Joyas Artesanales de Plata",
    excerpt:
      "Todo lo que necesitas saber sobre plata 950 vs 925, cómo reconocer autenticidad, cuidados esenciales y por qué la plata artesanal envejece de forma única.",
    category: "Guías",
    tags: ["plata", "cuidado de joyas", "plata 950", "guía"],
    author: "Casa Orfebre",
    publishedAt: "2026-03-26",
    coverImage: "/blog/guia-plata-artesanal.jpg",
    seoTitle:
      "Cómo Elegir y Cuidar Joyas de Plata Artesanal | Guía Completa | Casa Orfebre",
    seoDescription:
      "Guía definitiva para elegir y cuidar joyas artesanales de plata. Diferencias entre plata 950 y 925, limpieza, almacenamiento y autenticidad.",
  },
  {
    slug: "anillo-compromiso-artesanal-hecho-a-mano-chile",
    title:
      "Anillos de Compromiso Artesanales: Por Qué Elegir una Pieza Hecha a Mano",
    excerpt:
      "Descubre por qué cada vez más parejas en Chile eligen anillos de compromiso hechos a mano por orfebres locales en vez de joyerías industriales.",
    category: "Guías",
    tags: ["anillos de compromiso", "hecho a mano", "matrimonio", "oro 18k"],
    author: "Casa Orfebre",
    publishedAt: "2026-04-02",
    coverImage: "/blog/anillo-compromiso-artesanal.jpg",
    seoTitle:
      "Anillo de Compromiso Hecho a Mano en Chile | Guía para Elegir | Casa Orfebre",
    seoDescription:
      "Guía para elegir un anillo de compromiso artesanal hecho a mano en Chile. Materiales, estilos, presupuestos y cómo trabajar con un orfebre para crear tu pieza única.",
  },
  {
    slug: "joyeria-sustentable-slow-fashion-chile",
    title:
      "Joyería Sustentable y Slow Fashion: El Futuro de las Joyas en Chile",
    excerpt:
      "La joyería artesanal es inherentemente sustentable. Conoce cómo el movimiento slow fashion está transformando la forma en que compramos y valoramos las joyas.",
    category: "Cultura Orfebre",
    tags: ["joyería sustentable", "slow fashion", "consumo consciente"],
    author: "Casa Orfebre",
    publishedAt: "2026-04-09",
    coverImage: "/blog/joyeria-sustentable-chile.jpg",
    seoTitle:
      "Joyería Sustentable Chile: Slow Fashion y Joyas con Historia | Casa Orfebre",
    seoDescription:
      "Descubre la joyería sustentable en Chile. Cómo el slow fashion y el consumo consciente están impulsando la joyería artesanal hecha a mano por orfebres locales.",
  },
  {
    slug: "lapislazuli-piedra-nacional-chile-joyas",
    title:
      "Lapislázuli: La Piedra Nacional de Chile y su Magia en la Joyería",
    excerpt:
      "El lapislázuli chileno es una de las gemas más especiales del mundo. Conoce su historia, dónde se extrae y por qué es la piedra favorita de los orfebres nacionales.",
    category: "Materiales",
    tags: ["lapislázuli", "piedras naturales", "piedras chilenas", "gemas"],
    author: "Casa Orfebre",
    publishedAt: "2026-04-16",
    coverImage: "/blog/lapislazuli-chile.jpg",
    seoTitle:
      "Lapislázuli Chileno: Historia, Propiedades y Joyería Artesanal | Casa Orfebre",
    seoDescription:
      "Todo sobre el lapislázuli chileno: origen, extracción en la Cordillera de los Andes, propiedades y cómo los orfebres lo transforman en joyas únicas.",
  },
  {
    slug: "guia-regalar-joyeria-artesanal-mujer-chile",
    title:
      "Guía para Regalar Joyería Artesanal: Ideas para Cada Ocasión",
    excerpt:
      "¿Buscas un regalo significativo? Te ayudamos a elegir la joya artesanal perfecta según la ocasión, el estilo y el presupuesto.",
    category: "Guías",
    tags: ["regalo joyería", "joyería para regalar", "ideas regalo mujer"],
    author: "Casa Orfebre",
    publishedAt: "2026-04-23",
    coverImage: "/blog/regalar-joyeria-artesanal.jpg",
    seoTitle:
      "Regalo Joyería Artesanal Mujer Chile: Guía por Ocasión | Casa Orfebre",
    seoDescription:
      "Ideas para regalar joyería artesanal en Chile. Guía por ocasión: aniversario, cumpleaños, día de la madre. Cómo elegir la pieza perfecta hecha a mano.",
  },
  {
    slug: "joyas-con-significado-simbolismo-joyeria-artesanal",
    title:
      "Joyas con Significado: El Simbolismo Detrás de la Joyería Artesanal",
    excerpt:
      "Cada pieza artesanal cuenta una historia. Explora los símbolos, materiales y formas que los orfebres chilenos usan para crear joyas cargadas de significado.",
    category: "Cultura Orfebre",
    tags: [
      "joyas con significado",
      "joyas con historia",
      "joyas con piedras",
      "joyería artesanal",
      "simbolismo",
    ],
    author: "Casa Orfebre",
    publishedAt: "2026-04-30",
    coverImage: "/blog/joyas-significado.jpg",
    seoTitle:
      "Joyas con Significado y Historia | Simbolismo en Joyería Artesanal | Casa Orfebre",
    seoDescription:
      "Descubre el significado detrás de las joyas artesanales. Símbolos en piedras naturales, formas orgánicas y la historia que cada orfebre chileno plasma en sus creaciones.",
  },
  {
    slug: "como-vender-joyeria-artesanal-online-chile",
    title:
      "Cómo Vender Joyería Artesanal Online en Chile: Guía para Orfebres",
    excerpt:
      "Si eres orfebre y quieres llevar tus piezas a más personas, esta guía te enseña cómo vender joyería artesanal en internet de forma profesional.",
    category: "Para Orfebres",
    tags: ["vender joyas online", "plataforma para orfebres", "emprendimiento"],
    author: "Casa Orfebre",
    publishedAt: "2026-05-07",
    coverImage: "/blog/vender-joyeria-online.jpg",
    seoTitle:
      "Vender Joyería Artesanal Online Chile: Guía Completa para Orfebres | Casa Orfebre",
    seoDescription:
      "Guía paso a paso para vender joyería artesanal online en Chile. Fotografía de producto, precios, plataformas, envíos y cómo construir tu marca como orfebre.",
  },
  {
    slug: "piedras-naturales-chilenas-joyeria-cuarzo-turquesa",
    title:
      "Piedras Naturales Chilenas en la Joyería: Cuarzo, Turquesa y Más",
    excerpt:
      "Chile posee una riqueza mineral extraordinaria. Conoce las piedras naturales que nuestros orfebres engastan en sus creaciones y sus propiedades únicas.",
    category: "Materiales",
    tags: ["piedras naturales", "cuarzo", "turquesa", "piedras chilenas"],
    author: "Casa Orfebre",
    publishedAt: "2026-05-14",
    coverImage: "/blog/piedras-naturales-chile.jpg",
    seoTitle:
      "Piedras Naturales Chilenas para Joyería: Cuarzo, Turquesa, Ágata | Casa Orfebre",
    seoDescription:
      "Guía de piedras naturales chilenas usadas en joyería artesanal. Cuarzo, turquesa, ágata, amatista: propiedades, significado y cómo se engastan a mano.",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return blogPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
