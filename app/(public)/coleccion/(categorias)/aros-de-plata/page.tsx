export const revalidate = 60;

import type { Metadata } from "next";
import { CategoryLanding } from "../category-landing";

export const metadata: Metadata = {
  title: "Aros de Plata Artesanales — Argollas, Colgantes y Más | Casa Orfebre",
  description:
    "Aros de plata artesanales para mujer y hombre. Argollas, colgantes, gota, perla. Diseños únicos de orfebres verificados con envío a Chile.",
  alternates: { canonical: "/coleccion/aros-de-plata" },
  openGraph: {
    title: "Aros de Plata Artesanales — Argollas, Colgantes y Más | Casa Orfebre",
    description:
      "Aros de plata artesanales para mujer y hombre. Argollas, colgantes, gota, perla. Diseños únicos de orfebres verificados.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aros de Plata Artesanales | Casa Orfebre",
    description:
      "Aros de plata artesanales para mujer y hombre. Argollas, colgantes, gota, perla. Diseños únicos de orfebres verificados.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const FAQS = [
  {
    question: "¿Qué tipo de aros favorecen mi rostro?",
    answer:
      "Rostro redondo: aros largos y colgantes que alargan visualmente. Rostro ovalado: prácticamente cualquier estilo funciona. Rostro cuadrado: argollas y aros redondeados suavizan los ángulos. Rostro alargado: aros tipo botón o huggies anchos aportan volumen horizontal. Lo más importante es que te sientas cómoda con lo que elijas.",
  },
  {
    question: "¿Los aros de plata 925 son hipoalergénicos?",
    answer:
      "La plata 925 es generalmente bien tolerada por la mayoría de las personas. Sin embargo, contiene un 7,5% de cobre, lo que en pieles muy sensibles podría causar alguna reacción. La plata 950, con mayor pureza, es una alternativa más segura para pieles sensibles. Todos nuestros orfebres especifican el tipo de plata usado en cada pieza.",
  },
  {
    question: "¿Puedo dormir con aros de plata?",
    answer:
      "Para aros tipo huggies o botón, sí es posible dormir con ellos sin mayor problema. Los aros colgantes o de argolla grande es mejor retirarlos antes de dormir para evitar deformaciones, enganches con la almohada o molestias. Esto también ayuda a prolongar la vida útil de la pieza.",
  },
  {
    question: "¿Cómo cuidar aros de plata?",
    answer:
      "Limpia tus aros regularmente con un paño suave de microfibra. Evita el contacto con perfumes, cremas y productos químicos. Guárdalos en una bolsa antideslustre o en un joyero con separaciones para evitar rayones. Si se oscurecen, usa un paño especial para plata o sumérgelos brevemente en agua tibia con bicarbonato.",
  },
];

const RELATED_CATEGORIES = [
  { label: "Colgantes y Dijes de Plata", href: "/coleccion/colgantes-dijes-plata" },
  { label: "Anillos de Plata", href: "/coleccion/anillos-de-plata" },
  { label: "Cadenas de Plata", href: "/coleccion/cadenas-de-plata" },
];

const RELATED_POSTS = [
  { label: "Guía para elegir y cuidar joyas de plata", href: "/blog/guia-elegir-cuidar-joyas-artesanales-plata" },
  { label: "Joyas con significado: simbolismo en joyería artesanal", href: "/blog/joyas-con-significado-simbolismo-joyeria-artesanal" },
];

export default async function ArosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CategoryLanding
      categorySlug="aros"
      breadcrumbLabel="Aros de Plata"
      basePath="/coleccion/aros-de-plata"
      h1="Aros de Plata Hechos a Mano"
      subtitle="Aros artesanales de plata creados por orfebres chilenos. Cada par es una pieza de autor —desde argollas clásicas hasta diseños contemporáneos con piedras naturales."
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
        Tipos de aros de plata artesanales
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Los aros son la pieza de joyería más versátil de tu colección. En Casa Orfebre, cada par
          nace de las manos de un orfebre chileno verificado, garantizando calidad artesanal y
          diseños irrepetibles que no encontrarás en joyería industrial.
        </p>
        <p>
          <strong className="text-text">Argollas:</strong> el aro por excelencia. Desde pequeñas
          argollas de uso diario hasta aros de aro grande para ocasiones especiales. Nuestras
          argollas artesanales tienen acabados únicos: texturizadas a martillo, con filigrana,
          oxidadas selectivamente o con incrustaciones de piedras naturales chilenas.
        </p>
        <p>
          <strong className="text-text">Aros colgantes:</strong> piezas que se mueven con gracia
          y capturan la luz desde distintos ángulos. Ideales para dar un toque de elegancia a
          cualquier look. Los diseños van desde gotas simples en plata pulida hasta composiciones
          elaboradas con lapislázuli, cuarzo o turquesa.
        </p>
        <p>
          <strong className="text-text">Huggies:</strong> aros pequeños que abrazan el lóbulo.
          Perfectos para el día a día, para dormir con ellos o para combinaciones de múltiples
          perforaciones. La tendencia más fuerte en joyería actual, y en versión artesanal ofrecen
          texturas y detalles que los huggies industriales simplemente no tienen.
        </p>
        <p>
          <strong className="text-text">Aros de gota y perla:</strong> diseños que combinan la
          plata con elementos orgánicos como perlas de agua dulce, piedras de río o resinas con
          inclusiones botánicas. Cada pieza cuenta una historia del territorio chileno donde fue
          creada.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-light text-text sm:text-3xl">
        Aros para cada forma de rostro
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          La elección de aros puede realzar tus facciones de forma sutil pero poderosa. Los aros
          colgantes alargan visualmente los rostros redondos, mientras que las argollas medianas
          suavizan los ángulos de rostros cuadrados. Para rostros ovalados, prácticamente cualquier
          estilo funciona —es el momento de experimentar con formas más atrevidas.
        </p>
        <p>
          Más allá de las reglas, lo más importante es que los aros te hagan sentir bien. Nuestros
          orfebres crean piezas con carácter propio que invitan a ser llevadas con confianza,
          independiente de guías de estilo. Esa es la magia de la joyería de autor: cada pieza
          encuentra a su persona.
        </p>
      </div>
    </>
  );
}
