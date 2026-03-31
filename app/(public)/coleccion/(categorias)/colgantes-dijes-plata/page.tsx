export const revalidate = 60;

import type { Metadata } from "next";
import { CategoryLanding } from "../category-landing";

export const metadata: Metadata = {
  title: "Colgantes, Dijes y Relicarios de Plata | Casa Orfebre",
  description:
    "Colgantes, dijes y relicarios de plata hechos a mano. Medallas, cruces, charms artesanales. Piezas con significado.",
  alternates: { canonical: "/coleccion/colgantes-dijes-plata" },
  openGraph: {
    title: "Colgantes, Dijes y Relicarios de Plata | Casa Orfebre",
    description:
      "Colgantes, dijes y relicarios de plata hechos a mano. Medallas, cruces, charms artesanales. Piezas con significado.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colgantes y Dijes de Plata | Casa Orfebre",
    description:
      "Colgantes, dijes y relicarios de plata artesanales. Medallas, cruces, charms hechos a mano.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const FAQS = [
  {
    question: "¿Qué es un relicario?",
    answer:
      "Un relicario es un colgante que se abre para guardar algo en su interior: una foto pequeña, un mechón de pelo, una nota o cualquier recuerdo significativo. Los relicarios artesanales de plata son una de las piezas con mayor carga emocional en la joyería. Nuestros orfebres crean relicarios con bisagras y cierres hechos a mano que funcionan perfectamente.",
  },
  {
    question: "¿Cómo elegir un dije de plata?",
    answer:
      "Considera tres factores: significado (¿qué quieres expresar?), proporción (el dije debe ser acorde al grosor de tu cadena) y peso (un dije muy pesado necesita una cadena robusta). Si es un regalo, elige algo que represente a la persona. Los dijes artesanales tienen la ventaja de ser piezas únicas —un regalo que nadie más tendrá.",
  },
  {
    question: "¿Puedo poner una foto en un relicario?",
    answer:
      "Sí. La mayoría de los relicarios aceptan fotos recortadas al tamaño de la cavidad interior. Te recomendamos imprimir la foto en papel fotográfico de buena calidad y recortarla con precisión. Algunos relicarios tienen dos compartimentos (uno a cada lado) para dos fotos. El orfebre generalmente incluye las dimensiones exactas del interior.",
  },
  {
    question: "¿Qué cadena usar con un colgante?",
    answer:
      "La regla general: un colgante pesado necesita una cadena gruesa (grumet o figaro), y un dije pequeño luce mejor en una cadena fina (veneciana o serpiente). El largo ideal es que el colgante quede justo debajo de la clavícula (45 cm) o a la mitad del pecho (55 cm). Evita cadenas que compitan visualmente con el colgante —la cadena debe ser soporte, no protagonista.",
  },
];

const RELATED_CATEGORIES = [
  { label: "Collares de Plata", href: "/coleccion/collares-de-plata" },
  { label: "Cadenas de Plata", href: "/coleccion/cadenas-de-plata" },
  { label: "Anillos de Plata", href: "/coleccion/anillos-de-plata" },
];

const RELATED_POSTS = [
  { label: "Joyas con significado: simbolismo en joyería artesanal", href: "/blog/joyas-con-significado-simbolismo-joyeria-artesanal" },
  { label: "Lapislázuli: la piedra nacional de Chile", href: "/blog/lapislazuli-piedra-nacional-chile-joyas" },
];

export default async function ColgantesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CategoryLanding
      categorySlug="colgante"
      breadcrumbLabel="Colgantes y Dijes"
      basePath="/coleccion/colgantes-dijes-plata"
      h1="Colgantes y Dijes de Plata Artesanales"
      subtitle="Colgantes, dijes y relicarios de plata hechos a mano por orfebres chilenos. Medallas, cruces, charms y piezas con significado que cuentan historias."
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
        Tipos de colgantes y dijes artesanales
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Un colgante artesanal es quizás la pieza de joyería con mayor capacidad de contar una
          historia. A diferencia de otras piezas, el colgante ocupa un lugar central en el cuerpo
          y se convierte en un punto focal que invita a la conversación. En Casa Orfebre, cada
          colgante es una obra en miniatura creada por orfebres chilenos.
        </p>
        <p>
          <strong className="text-text">Dijes figurativos:</strong> representaciones de animales,
          flores, astros y símbolos mapuche tallados o fundidos en plata. Desde copihues hasta
          cóndores, desde lunas hasta el toki —cada dije captura un fragmento de la identidad
          cultural chilena y lo convierte en una pieza portátil de significado profundo.
        </p>
        <p>
          <strong className="text-text">Relicarios:</strong> colgantes que se abren para guardar
          memorias. Los relicarios artesanales de plata son piezas con una carga emocional única:
          guardan fotos, mechones, notas o pequeños tesoros. Nuestros orfebres crean relicarios con
          bisagras manuales y grabados que los convierten en heirlooms familiares.
        </p>
        <p>
          <strong className="text-text">Medallas y cruces:</strong> piezas de devoción y protección
          con larga tradición en la orfebrería sudamericana. Desde medallas de la Virgen del Carmen
          hasta cruces contemporáneas, estas piezas combinan fe y arte en plata de la más alta
          calidad.
        </p>
        <p>
          <strong className="text-text">Charms y amuletos:</strong> pequeñas piezas para coleccionar
          y combinar. Los charms artesanales se distinguen de los industriales por su acabado manual,
          sus texturas únicas y su capacidad de representar momentos y significados personales.
          Ideales para crear pulseras o collares de charms personalizados.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-light text-text sm:text-3xl">
        El significado detrás de cada pieza
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Los colgantes artesanales son el regalo más personal que puedes hacer. Un relicario para
          una madre, un dije de toki para quien necesita fortaleza, una luna para los soñadores, un
          copihue para recordar Chile desde cualquier parte del mundo. Cada pieza de nuestra
          colección lleva consigo no solo el trabajo manual del orfebre, sino también un significado
          que conecta con quien lo porta.
        </p>
        <p>
          A diferencia de la joyería industrial, un colgante artesanal es irrepetible. Las pequeñas
          variaciones en el acabado, la textura y la forma son precisamente lo que le da carácter.
          Son las imperfecciones perfectas que solo la mano humana puede crear —y que convierten un
          objeto en un tesoro.
        </p>
      </div>
    </>
  );
}
