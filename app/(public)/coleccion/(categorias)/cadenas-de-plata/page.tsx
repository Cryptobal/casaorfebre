export const revalidate = 60;
export const dynamic = "force-static";

import type { Metadata } from "next";
import { CategoryLanding } from "../category-landing";

export const metadata: Metadata = {
  title: "Cadenas de Plata Artesanales Hechas a Mano | Casa Orfebre",
  description:
    "Descubre cadenas de plata artesanales de orfebres chilenos. Cadenas 925 y 950: grumet, italiana, cuerpo, figaro. Envío a todo Chile.",
  alternates: { canonical: "/coleccion/cadenas-de-plata" },
  openGraph: {
    title: "Cadenas de Plata Artesanales Hechas a Mano | Casa Orfebre",
    description:
      "Descubre cadenas de plata artesanales de orfebres chilenos. Cadenas 925 y 950: grumet, italiana, cuerpo, figaro. Envío a todo Chile.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cadenas de Plata Artesanales | Casa Orfebre",
    description:
      "Cadenas de plata artesanales de orfebres chilenos. Grumet, italiana, cuerpo, figaro. Plata 925 y 950.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const FAQS = [
  {
    question: "¿Qué tipo de cadena de plata es más resistente?",
    answer:
      "Las cadenas de eslabón grumet y figaro son las más resistentes para uso diario. Su diseño entrelazado distribuye la tensión de manera uniforme, lo que las hace ideales para llevar colgantes pesados. Las cadenas de cuerpo y serpiente son más delicadas y se recomiendan para uso ocasional o con dijes livianos.",
  },
  {
    question: "¿Cuál es la diferencia entre cadena de plata 925 y 950?",
    answer:
      "La plata 925 (sterling silver) contiene 92,5% de plata pura y 7,5% de cobre, lo que le da mayor dureza y resistencia a los rayones. La plata 950 tiene 95% de plata pura, es más suave y tiene un brillo más blanco. Para cadenas de uso diario, la 925 suele ser más práctica; la 950 ofrece un acabado más lujoso.",
  },
  {
    question: "¿Cómo mido el largo ideal de una cadena?",
    answer:
      "Para gargantilla: 35-40 cm (queda al cuello). Cadena estándar: 45 cm (cae justo debajo de la clavícula). Cadena media: 50-55 cm (llega al pecho). Cadena larga: 60+ cm (ideal para layering). Para medir, usa un cordón alrededor del cuello y marca el largo deseado.",
  },
  {
    question: "¿Cómo limpio una cadena de plata?",
    answer:
      "Sumerge la cadena en agua tibia con unas gotas de jabón neutro durante 5 minutos. Frota suavemente con un cepillo de dientes de cerdas suaves. Enjuaga con agua limpia y seca con un paño suave. Para el oscurecimiento, usa un paño de pulir plata. Evita productos químicos agresivos y guarda la cadena en una bolsa antideslustre.",
  },
];

const RELATED_CATEGORIES = [
  { label: "Colgantes y Dijes de Plata", href: "/coleccion/colgantes-dijes-plata" },
  { label: "Collares de Plata", href: "/coleccion/collares-de-plata" },
  { label: "Pulseras de Plata", href: "/coleccion/pulseras-de-plata" },
];

const RELATED_POSTS = [
  { label: "Guía para elegir y cuidar joyas de plata", href: "/blog/guia-elegir-cuidar-joyas-artesanales-plata" },
  { label: "Joyería sustentable y slow fashion en Chile", href: "/blog/joyeria-sustentable-slow-fashion-chile" },
];

export default async function CadenasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CategoryLanding
      categorySlug="cadena"
      breadcrumbLabel="Cadenas de Plata"
      basePath="/coleccion/cadenas-de-plata"
      h1="Cadenas de Plata Artesanales"
      subtitle="Cadenas de plata hechas a mano por orfebres chilenos. Eslabones trabajados uno a uno en plata 925 y 950, con la solidez y el brillo que solo la orfebrería artesanal puede ofrecer."
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
        Tipos de cadenas de plata artesanales
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Una cadena de plata artesanal no es un accesorio más: es la columna vertebral de tu
          joyería. En Casa Orfebre encontrarás cadenas elaboradas por orfebres chilenos verificados,
          cada eslabón soldado y pulido a mano para garantizar resistencia y belleza duradera.
        </p>
        <p>
          <strong className="text-text">Cadena grumet:</strong> el clásico atemporal. Eslabones
          ovalados y aplanados que le dan un aspecto elegante y resistente. Ideal para uso diario y
          para llevar colgantes de cualquier peso. Es la cadena más versátil de nuestra colección.
        </p>
        <p>
          <strong className="text-text">Cadena italiana (veneciana):</strong> eslabones cuadrados
          que crean una superficie lisa y brillante. Su diseño geométrico la hace perfecta para
          looks modernos y minimalistas. Muy popular entre quienes buscan cadenas finas pero con
          carácter.
        </p>
        <p>
          <strong className="text-text">Cadena de cuerpo (cordón):</strong> eslabones redondos
          entrelazados que forman un tubo flexible. Su textura suave la hace cómoda al tacto y su
          forma cilíndrica refleja la luz de manera uniforme. Excelente para combinar con dijes
          delicados.
        </p>
        <p>
          <strong className="text-text">Cadena figaro:</strong> patrón alternado de eslabones cortos
          y uno largo que crea un ritmo visual interesante. Originaria de Italia, combina la
          resistencia del grumet con un diseño más elaborado. Perfecta para quienes buscan algo
          diferente sin perder la funcionalidad.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-light text-text sm:text-3xl">
        Cómo elegir el largo correcto
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          El largo de tu cadena define cómo cae la pieza y qué escotes complementa. Las gargantillas
          (35-40 cm) destacan con escotes altos y cuellos abiertos. Las cadenas estándar (45 cm) son
          las más versátiles y funcionan con prácticamente cualquier look. Para layering, combina
          cadenas de distintos largos —por ejemplo, una gargantilla con una cadena de 55 cm— para
          crear profundidad visual.
        </p>
        <p>
          Todas nuestras cadenas artesanales incluyen un cierre de mosquetón o resorte fabricado en
          el mismo tipo de plata que la cadena, asegurando un acabado coherente y duradero. Si
          necesitas un largo personalizado, muchos de nuestros orfebres pueden adaptar la pieza a tu
          medida.
        </p>
      </div>
    </>
  );
}
