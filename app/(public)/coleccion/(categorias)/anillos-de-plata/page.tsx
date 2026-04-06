export const revalidate = 60;
export const dynamic = "force-static";

import type { Metadata } from "next";
import { CategoryLanding } from "../category-landing";

export const metadata: Metadata = {
  title: "Anillos de Plata Artesanales para Mujer y Hombre | Casa Orfebre",
  description:
    "Anillos de plata artesanales únicos. Diseños de autor en plata 925 y 950 para mujer y hombre. Con certificado de autenticidad.",
  alternates: { canonical: "/coleccion/anillos-de-plata" },
  openGraph: {
    title: "Anillos de Plata Artesanales para Mujer y Hombre | Casa Orfebre",
    description:
      "Anillos de plata artesanales únicos. Diseños de autor en plata 925 y 950 para mujer y hombre. Con certificado de autenticidad.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anillos de Plata Artesanales | Casa Orfebre",
    description:
      "Anillos de plata artesanales únicos. Diseños de autor en plata 925 y 950 para mujer y hombre.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const FAQS = [
  {
    question: "¿Cómo saber mi talla de anillo?",
    answer:
      "Envuelve un hilo o tira de papel alrededor del dedo donde usarás el anillo. Marca donde se cruza y mide la longitud en milímetros. Divide entre 3,14 para obtener el diámetro. Consulta una tabla de tallas: 15,7 mm = talla 10, 16,5 mm = talla 12, 17,3 mm = talla 14, 18,2 mm = talla 16. Mide al final del día cuando tus dedos están ligeramente más anchos.",
  },
  {
    question: "¿Los anillos de plata se oscurecen?",
    answer:
      "Sí, es natural. La plata reacciona con el azufre presente en el aire, la transpiración y ciertos alimentos, formando una pátina oscura llamada sulfuro de plata. Esto no es un defecto —muchos orfebres lo usan como recurso estético (oxidación selectiva). Para mantener el brillo, limpia regularmente con un paño de pulir plata y guarda el anillo en un lugar seco.",
  },
  {
    question: "¿Puedo usar mi anillo de plata todos los días?",
    answer:
      "Absolutamente. La plata 925 y 950 son lo suficientemente resistentes para uso diario. Es recomendable retirarlo al lavar platos, aplicar cremas o hacer ejercicio intenso para prolongar su vida útil. Con el tiempo, el uso diario le dará una pátina natural que muchos consideran parte del encanto de la plata artesanal.",
  },
  {
    question: "¿La plata 925 es buena para anillos?",
    answer:
      "Sí, la plata 925 (sterling silver) es el estándar internacional para joyería de calidad. Su aleación con cobre le da la dureza necesaria para soportar el uso cotidiano sin deformarse. Es hipoalergénica para la mayoría de las personas y mantiene su brillo con un cuidado mínimo. Es el material ideal para anillos artesanales.",
  },
];

const RELATED_CATEGORIES = [
  { label: "Pulseras de Plata", href: "/coleccion/pulseras-de-plata" },
  { label: "Aros de Plata", href: "/coleccion/aros-de-plata" },
  { label: "Cadenas de Plata", href: "/coleccion/cadenas-de-plata" },
];

const RELATED_POSTS = [
  { label: "Anillo de compromiso artesanal hecho a mano", href: "/blog/anillo-compromiso-artesanal-hecho-a-mano-chile" },
  { label: "Joyas con significado: simbolismo en joyería artesanal", href: "/blog/joyas-con-significado-simbolismo-joyeria-artesanal" },
];

export default async function AnillosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CategoryLanding
      categorySlug="anillo"
      breadcrumbLabel="Anillos de Plata"
      basePath="/coleccion/anillos-de-plata"
      h1="Anillos de Plata de Autor"
      subtitle="Anillos artesanales en plata 925 y 950, diseñados y forjados a mano por orfebres chilenos. Cada anillo es una pieza única con certificado de autenticidad."
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
        Tipos de anillos de plata artesanales
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Un anillo de plata artesanal lleva consigo la huella del orfebre que lo creó. A diferencia
          de la joyería industrial, cada anillo de Casa Orfebre es moldeado, soldado y pulido a mano,
          lo que le da un carácter único e irrepetible. Nuestros orfebres trabajan con plata 925 y
          950, garantizando piezas de la más alta calidad.
        </p>
        <p>
          <strong className="text-text">Anillos lisos y texturizados:</strong> bandas de plata con
          acabados variados —pulido espejo, mate satinado, martillado o con texturas orgánicas
          inspiradas en la naturaleza chilena. Son los más versátiles: funcionan como alianzas,
          anillos de uso diario o como complemento de un stack de anillos.
        </p>
        <p>
          <strong className="text-text">Anillos con piedras naturales:</strong> engastes en bisel o
          garra con piedras chilenas como lapislázuli, cuarzo rosado, turquesa, amatista o ágata.
          Cada piedra es seleccionada por el orfebre por su color, claridad y energía. El resultado
          es una pieza donde el metal y la piedra dialogan en armonía.
        </p>
        <p>
          <strong className="text-text">Anillos de diseño contemporáneo:</strong> piezas que rompen
          con lo convencional. Formas orgánicas, geometrías inesperadas, anillos abiertos y ajustables.
          El territorio donde la orfebrería tradicional chilena se encuentra con la joyería de
          vanguardia.
        </p>
      </div>

      <h2 className="mt-12 font-serif text-2xl font-light text-text sm:text-3xl">
        Guía de tallas y cuidado
      </h2>
      <div className="mt-2 h-px w-12 bg-accent" />
      <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
        <p>
          Elegir la talla correcta es crucial para la comodidad de un anillo. Te recomendamos medir
          al final del día, cuando tus dedos están en su tamaño máximo natural. Si estás entre dos
          tallas, elige la mayor. Muchos de nuestros anillos artesanales son ajustables, lo que
          facilita encontrar el calce perfecto.
        </p>
        <p>
          Para mantener tus anillos de plata en óptimas condiciones, retíralos al manipular productos
          químicos de limpieza, al cocinar con alimentos ácidos o al hacer deporte. Guárdalos
          separados entre sí para evitar rayones. Un paño de pulir plata y almacenamiento en lugar
          seco son todo lo que necesitas para que tu anillo luzca como el primer día.
        </p>
      </div>
    </>
  );
}
