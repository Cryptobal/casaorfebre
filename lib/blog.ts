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
