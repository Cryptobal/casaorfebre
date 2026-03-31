export const revalidate = 60;

import type { Metadata } from "next";
import { CategoryLanding } from "../category-landing";

export const metadata: Metadata = {
  title: "Collares de Plata Artesanales para Mujer | Casa Orfebre",
  description:
    "Collares de plata artesanales. Gargantillas, cadenas con dije, collares personalizados. Hechos a mano por orfebres chilenos.",
  alternates: { canonical: "/coleccion/collares-de-plata" },
  openGraph: {
    title: "Collares de Plata Artesanales para Mujer | Casa Orfebre",
    description:
      "Collares de plata artesanales. Gargantillas, cadenas con dije, collares personalizados. Hechos a mano por orfebres chilenos.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collares de Plata Artesanales | Casa Orfebre",
    description:
      "Collares de plata artesanales de orfebres chilenos. Gargantillas, cadenas con dije, collares personalizados.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const FAQS = [
  {
    question: "¿Qué largo de collar me favorece?",
    answer:
      "Gargantilla (35-40 cm): ideal con escotes en V y cuellos abiertos, alarga el cuello. Cadena princesa (45 cm): la más versátil, funciona con cualquier escote. Cadena matinée (50-60 cm): perfecta sobre blusas y suéteres. Cadena larga (70+ cm): ideal para looks bohemios y layering. Escotes cerrados van mejor con cadenas largas; escotes amplios con gargantillas.",
  },
  {
    question: "¿Puedo personalizar un collar de plata?",
    answer:
      "Muchos de nuestros orfebres ofrecen personalización: grabado de iniciales o nombres, elección de piedra, ajuste de largo o diseños por encargo. Puedes contactar al artesano directamente a través de su perfil en Casa Orfebre para consultar opciones de personalización y plazos.",
  },
  {
    question: "¿Cómo combinar collares?",
    answer:
      "El layering o apilado de collares es una de las tendencias más fuertes en joyería. La clave es variar largos (por ejemplo, gargantilla + cadena de 50 cm + cadena larga) y grosores (una cadena fina con una más gruesa). Mezcla estilos: una cadena lisa con un collar con dije. Mantén el mismo tono de metal para coherencia visual.",
  },
  {
    question: "¿Se puede grabar un collar de plata?",
    answer:
      "Sí, los dijes y placas de plata son ideales para grabado. Los métodos incluyen grabado a buril (manual, artesanal), grabado láser (más preciso para textos largos) y estampado (letras en relieve). Consulta con el orfebre qué tipo de grabado ofrece. Los grabados artesanales a buril tienen un carácter único que el láser no puede replicar.",
  },
];

const RELATED_CATEGORIES = [
  { label: "Colgantes y Dijes de Plata", href: "/coleccion/colgantes-dijes-plata" },
  { label: "Cadenas de Plata", href: "/coleccion/cadenas-de-plata" },
  { label: "Aros de Plata", href: "/coleccion/aros-de-plata" },
];

const RELATED_POSTS = [
  { label: "Lapislázuli: la piedra nacional de Chile", href: "/blog/lapislazuli-piedra-nacional-chile-joyas" },
  { label: "Piedras naturales chilenas en joyería", href: "/blog/piedras-naturales-chilenas-joyeria-cuarzo-turquesa" },
];

export default async function CollaresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CategoryLanding
      categorySlug="collar"
      breadcrumbLabel="Collares de Plata"
      basePath="/coleccion/collares-de-plata"
      h1="Collares de Plata de Autor"
      subtitle="Collares artesanales de plata creados por orfebres chilenos. Gargantillas, cadenas con dije y collares statement con piedras naturales —cada pieza cuenta una historia."
      seoContent={<SeoContent />}
      faqs={FAQS}
      relatedCategories={RELATED_CATEGORIES}
      relatedPosts={RELATED_POSTS}
      searchParams={params}
    />
  );
}

function SeoContent() {
  return (
    <>
      <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
        Tipos de collares de plata artesanales
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Un collar de plata artesanal es mucho más que un accesorio: es una pieza de arte portátil.
          En Casa Orfebre, cada collar es creado íntegramente a mano por orfebres chilenos
          verificados, combinando técnicas ancestrales con diseño contemporáneo para crear piezas
          que trascienden las temporadas.
        </p>
        <p>
          <strong className="text-text">Gargantillas:</strong> collares cortos que abrazan el cuello
          (35-40 cm). Desde bandas de plata minimalistas hasta piezas statement con piedras
          engastadas. Las gargantillas artesanales de nuestra colección incluyen diseños con
          lapislázuli, turquesa y cuarzo rosado —piedras seleccionadas a mano por cada orfebre.
        </p>
        <p>
          <strong className="text-text">Cadenas con dije:</strong> la combinación más versátil.
          Una cadena artesanal de plata 925 o 950 con un dije que puede ser figurativo (animales,
          flores, símbolos), geométrico o una piedra natural engastada. Muchos de nuestros orfebres
          permiten elegir la cadena y el dije por separado.
        </p>
        <p>
          <strong className="text-text">Collares statement:</strong> piezas de presencia que
          transforman cualquier outfit. Diseños elaborados que combinan técnicas como la filigrana,
          el calado, la fundición a la cera perdida y el engaste de múltiples piedras. Son las
          piezas insignia de nuestros orfebres más experimentados.
        </p>
        <p>
          <strong className="text-text">Collares personalizados:</strong> desde iniciales grabadas
          hasta diseños por encargo. La personalización es una de las grandes ventajas de la joyería
          artesanal: puedes trabajar directamente con el orfebre para crear un collar único que
          cuente tu historia.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-light text-text sm:text-3xl">
        Largos de collar y cómo elegir
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          El largo del collar define el punto focal de tu look. Una gargantilla dirige la atención
          al cuello y el rostro; un collar princesa (45 cm) es el punto dulce entre elegancia y
          versatilidad; los largos matinée (50-60 cm) y ópera (70+ cm) crean verticalidad y son
          ideales para layering.
        </p>
        <p>
          La tendencia actual de combinar múltiples collares de distintos largos permite jugar con
          texturas y brillos. Te recomendamos empezar con una pieza base (gargantilla o princesa) y
          agregar capas gradualmente. Nuestros orfebres diseñan muchas piezas pensando precisamente
          en esta estética de apilado, con grosores y texturas que se complementan entre sí.
        </p>
      </div>
    </>
  );
}
