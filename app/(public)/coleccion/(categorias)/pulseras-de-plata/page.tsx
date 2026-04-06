export const revalidate = 60;
export const dynamic = "force-static";

import type { Metadata } from "next";
import { CategoryLanding } from "../category-landing";

export const metadata: Metadata = {
  title: "Pulseras de Plata para Mujer y Hombre | Casa Orfebre",
  description:
    "Pulseras de plata artesanales. Cadena, brazalete, esclava, con dijes. Diseños únicos para mujer y hombre. Plata 925 con envío a Chile.",
  alternates: { canonical: "/coleccion/pulseras-de-plata" },
  openGraph: {
    title: "Pulseras de Plata para Mujer y Hombre | Casa Orfebre",
    description:
      "Pulseras de plata artesanales. Cadena, brazalete, esclava, con dijes. Diseños únicos para mujer y hombre.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulseras de Plata Artesanales | Casa Orfebre",
    description:
      "Pulseras de plata artesanales para mujer y hombre. Cadena, brazalete, esclava, con dijes.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const FAQS = [
  {
    question: "¿Cómo mido mi muñeca para una pulsera?",
    answer:
      "Envuelve una cinta métrica flexible alrededor de tu muñeca justo encima del hueso. A esa medida, agrega 1-2 cm para una pulsera cómoda con algo de holgura. Para un ajuste ceñido, agrega solo 0,5 cm. La medida promedio de muñeca femenina es 15-17 cm y masculina es 18-20 cm.",
  },
  {
    question: "¿Las pulseras de plata se pueden mojar?",
    answer:
      "El contacto ocasional con agua no daña la plata, pero la exposición prolongada (piscina, mar, ducha diaria) puede acelerar el oscurecimiento. El cloro y el agua salada son particularmente agresivos. Lo ideal es retirar la pulsera antes de nadar o ducharse y secarla bien si se moja accidentalmente.",
  },
  {
    question: "¿Qué pulsera de plata es mejor para hombre?",
    answer:
      "Las pulseras de eslabón grueso tipo grumet o figaro son las más populares entre hombres. Los brazaletes rígidos en plata oxidada también tienen una estética muy masculina. En nuestra colección encontrarás pulseras diseñadas específicamente para muñecas masculinas, con eslabones más grandes y proporciones más robustas.",
  },
  {
    question: "¿Pulsera de cadena vs brazalete rígido?",
    answer:
      "La pulsera de cadena es más flexible, cómoda para uso diario y se adapta mejor a distintas muñecas. El brazalete rígido hace un statement más fuerte, es más resistente a golpes y no se enreda con la ropa. Muchas personas combinan ambos estilos en la misma muñeca para un look de stacking.",
  },
];

const RELATED_CATEGORIES = [
  { label: "Cadenas de Plata", href: "/coleccion/cadenas-de-plata" },
  { label: "Anillos de Plata", href: "/coleccion/anillos-de-plata" },
  { label: "Aros de Plata", href: "/coleccion/aros-de-plata" },
];

const RELATED_POSTS = [
  { label: "Guía para elegir y cuidar joyas de plata", href: "/blog/guia-elegir-cuidar-joyas-artesanales-plata" },
  { label: "Guía para regalar joyería artesanal", href: "/blog/guia-regalar-joyeria-artesanal-mujer-chile" },
];

export default async function PulserasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CategoryLanding
      categorySlug="pulsera"
      breadcrumbLabel="Pulseras de Plata"
      basePath="/coleccion/pulseras-de-plata"
      h1="Pulseras de Plata Artesanales"
      subtitle="Pulseras de plata para mujer y hombre, forjadas a mano por orfebres chilenos. Desde cadenas de eslabón hasta brazaletes rígidos con texturas únicas."
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
        Tipos de pulseras de plata artesanales
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Una pulsera artesanal de plata es una pieza que acompaña cada gesto de tu mano. En Casa
          Orfebre, nuestros orfebres crean pulseras que equilibran estética y funcionalidad, con
          materiales nobles y técnicas que honran la tradición orfebre chilena.
        </p>
        <p>
          <strong className="text-text">Pulseras de cadena:</strong> eslabones soldados uno a uno
          en plata 925 o 950. Desde cadenas finas tipo veneciana hasta eslabones gruesos estilo
          grumet. Son las más cómodas para uso diario y permiten agregar dijes personalizados.
          Perfectas tanto para mujer como para hombre.
        </p>
        <p>
          <strong className="text-text">Brazaletes rígidos:</strong> piezas forjadas o fundidas que
          mantienen su forma. Pueden ser lisos, texturizados a martillo o con grabados artesanales.
          Los brazaletes abiertos son ajustables y se adaptan a distintas muñecas. Un clásico
          atemporal que funciona como pieza única o en combinación.
        </p>
        <p>
          <strong className="text-text">Esclavas:</strong> la pulsera clásica con placa central,
          ideal para grabados personalizados. Nuestros orfebres ofrecen esclavas en plata 925 con
          eslabones robustos, perfectas como regalo significativo. Muchas pueden grabarse con
          nombres, fechas o mensajes.
        </p>
        <p>
          <strong className="text-text">Pulseras para hombre:</strong> un nicho en crecimiento.
          Eslabones más anchos, plata oxidada, combinaciones con cuero o cobre. Las pulseras
          masculinas artesanales son el accesorio perfecto para quienes buscan carácter sin
          excesos. En nuestra colección encontrarás piezas diseñadas pensando en la muñeca
          masculina.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-light text-text sm:text-3xl">
        Cómo medir tu muñeca y elegir el largo
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Para medir tu muñeca, usa una cinta métrica flexible justo encima del hueso prominente.
          Agrega entre 1 y 2 cm a esa medida para un calce cómodo. Si prefieres un ajuste más
          ceñido (estilo pulsera de reloj), agrega solo medio centímetro. Los brazaletes rígidos
          necesitan un diámetro interno mayor que la parte más ancha de tu mano para poder
          deslizarlos.
        </p>
        <p>
          Muchos de nuestros orfebres ofrecen ajustes de largo sin costo adicional. Si tienes dudas
          sobre el tamaño, contacta al artesano a través de nuestra plataforma antes de comprar
          —estarán encantados de ayudarte a encontrar el calce perfecto.
        </p>
      </div>
    </>
  );
}
