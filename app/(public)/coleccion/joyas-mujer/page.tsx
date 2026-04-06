export const revalidate = 60;
export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { getProductsByGender } from "@/lib/queries/products";
import { generateItemListJsonLd, generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Joyería de Plata para Mujer — Aros, Anillos, Collares, Pulseras",
  description:
    "Joyería de plata artesanal para mujer. Aros, anillos, collares, pulseras y colgantes hechos a mano. Diseños femeninos únicos con envío a Chile.",
  alternates: { canonical: "/coleccion/joyas-mujer" },
  openGraph: {
    title: "Joyería de Plata para Mujer | Casa Orfebre",
    description:
      "Joyería de plata artesanal para mujer. Aros de plata, pulseras, collares y anillos hechos a mano por orfebres chilenos.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

const FAQS = [
  {
    question: "¿Cuáles son los mejores aros de plata para mujer?",
    answer:
      "Los aros de plata para mujer ofrecen infinitas opciones: aretes largos y delicados, huggies pequeños, aros de aro tipo argolla, y studs con piedras naturales. Para uso diario, los huggies de plata 925 son ideales por su comodidad. Para ocasiones especiales, los aros largos con colgantes añaden elegancia y movimiento.",
  },
  {
    question: "¿Cómo combinar pulseras de plata de diferentes estilos?",
    answer:
      "El layering de pulseras es tendencia. Combina una pulsera de cadena fina con un brazalete rígido, o apila varias pulseras delgadas de diferentes texturas. La clave es mantener el mismo metal (plata 925 o 950) y variar el ancho y el tipo de eslabón. Para un look bohemio, mezcla pulseras de cadena con pulseras de cuero con detalles en plata.",
  },
  {
    question: "¿Qué collares de plata son versátiles para diario?",
    answer:
      "Los collares de cadena fina en diferentes largos son los más versátiles: largas (60-70 cm) para usar sobre camisetas, medianas (45-50 cm) para usar solos, o cortas (35-40 cm) para un look más delicado. Los collares con pequeños colgantes como cruces, medallas o piedras naturales añaden personaje sin ser excesivos.",
  },
  {
    question: "¿Cuál es la diferencia entre aros de plata 925 y 950?",
    answer:
      "La plata 925 contiene 92.5% de plata pura y es más resistente al uso diario por tener más aleación de cobre. La plata 950 es más pura (95% de plata) y tiene un brillo más intenso, pero es ligeramente más blanda. Ambas son excelentes; elige 925 para aros de uso constante y 950 para piezas especiales.",
  },
  {
    question: "¿Las pulseras de plata con piedras naturales como cuarzo rosa necesitan cuidados especiales?",
    answer:
      "Sí, las piedras naturales como el cuarzo rosa, la amatista y el lapislázuli requieren cuidados adicionales. Evita exponerlas a luz solar directa prolongada (pueden decolorarse), no las sumerjas en agua con jabón fuerte, y seca bien tras el contacto con agua. Limpia el metal de plata con un paño suave; la piedra simplemente con agua tibia.",
  },
  {
    question: "¿Qué son las tobilleras de plata y cómo se usan?",
    answer:
      "Las tobilleras o brazaletes de tobillo son accesorios delicados para la muñeca del pie. Se usan sobre la piel o con calcetines cortos en clima cálido. Una tobillera de cadena fina en plata complementa looks de verano, playa o bohemio. Son especialmente populares en Chile por el clima. Busca diseños ajustables para garantizar comodidad.",
  },
];

interface ProductSection {
  title: string;
  categorySlug: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

const SECTIONS: ProductSection[] = [
  {
    title: "Aros de Plata para Mujer",
    categorySlug: "aros",
    description:
      "Desde aros delicados y minimalistas hasta diseños bohemios con piedras naturales. Aros largos, huggies, studs y aretes de aro en plata 925 y 950, forjados con precisión artesanal.",
    ctaLabel: "Ver todos los aros",
    ctaHref: "/coleccion/aros-de-plata",
  },
  {
    title: "Anillos de Plata para Mujer",
    categorySlug: "anillo",
    description:
      "Anillos de banda delgada, anillos con piedras naturales, sellos femeninos y diseños con textura martillada. Cada anillo es una declaración personal de estilo, hecha a mano por orfebres que entienden la proporción femenina.",
    ctaLabel: "Ver todos los anillos",
    ctaHref: "/coleccion/anillos-de-plata",
  },
  {
    title: "Collares de Plata para Mujer",
    categorySlug: "cadena",
    description:
      "Collares de cadena fina, medianos con colgantes discretos, y piezas statement de plata. Diseños para layering, uso diario o momentos especiales. Combina múltiples collares para crear tu propio look.",
    ctaLabel: "Ver todos los collares",
    ctaHref: "/coleccion/cadenas-de-plata",
  },
  {
    title: "Pulseras de Plata para Mujer",
    categorySlug: "pulsera",
    description:
      "Pulseras de cadena delicada, brazaletes rígidos elegantes, y pulseras con piedras naturales como cuarzo rosa. Diseños para stacking (apilar) o usar solas. Cada pulsera es un acento único en tu muñeca.",
    ctaLabel: "Ver todas las pulseras",
    ctaHref: "/coleccion/pulseras-de-plata",
  },
  {
    title: "Colgantes y Dije de Plata para Mujer",
    categorySlug: "colgante",
    description:
      "Colgantes delicados con símbolos, medallas, cruces y piezas con significado. Dijes en plata pura que pueden llevarse en collares o pulseras. Cada colgante artesanal cuenta una historia.",
    ctaLabel: "Ver todos los colgantes",
    ctaHref: "/coleccion/colgantes-dijes-plata",
  },
];

export default async function JoyasMujerPage() {

  // Fetch products for each section in parallel
  const sectionProducts = await Promise.all(
    SECTIONS.map((s) => getProductsByGender("mujer", s.categorySlug, 4))
  );

  // Combine all products for ItemList JSON-LD
  const allProducts = sectionProducts.flat();

  return (
    <>
      <JsonLd data={generateItemListJsonLd(allProducts)} />
      <JsonLd data={generateFAQJsonLd(FAQS)} />

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Colección", href: "/coleccion" },
            { label: "Joyería para Mujer" },
          ]}
        />

        {/* Hero */}
        <div className="mb-14 max-w-3xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
            Joyería de Plata para Mujer
          </h1>
          <div className="mt-2 h-px w-16 bg-accent" />
          <p className="mt-4 font-sans text-lg font-light leading-relaxed text-text-secondary">
            Piezas delicadas y sofisticadas, forjadas a mano por orfebres chilenos que dominan la 
            elegancia femenina. Desde aros de plata que enmarcan tu rostro hasta pulseras y collares 
            que cuentan tu historia personal.
          </p>
        </div>

        {/* Product Sections */}
        {SECTIONS.map((section, sIdx) => {
          const products = sectionProducts[sIdx];
          return (
            <div key={section.categorySlug} className="mb-16">
              <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
                {section.title}
              </h2>
              <div className="mt-2 h-px w-12 bg-accent" />

              {products && products.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                  {products.map((product) => (
                    <FadeIn key={product.id} delay={0}>
                      <ProductCard
                        product={product}
                        listName={section.title}
                      />
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-text-secondary">
                  Próximamente nuevas piezas en esta categoría.
                </p>
              )}

              <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-text-secondary">
                {section.description}
              </p>

              <Link
                href={section.ctaHref}
                className="mt-3 inline-flex items-center font-sans text-sm font-medium text-accent transition-colors hover:text-accent/80"
              >
                {section.ctaLabel}
                <span className="ml-1">→</span>
              </Link>
            </div>
          );
        })}

        {/* Style Guide */}
        <div className="mx-auto mt-8 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Guía de Estilo: Cómo Combinar Joyería de Plata
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />

          <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
            <p>
              La joyería femenina de plata es un arte de equilibrio. A diferencia de otros metales, 
              la plata tiene una versatilidad única: combina con prácticamente cualquier tono de piel, 
              cualquier ropa, y funciona tanto en contextos formales como en lo cotidiano. En 2026, 
              la tendencia es clara: mezclar capas, texturas y estilos de forma armoniosa.
            </p>
            <p>
              La regla fundamental es el <em>stacking</em> o apilamiento inteligente. En la muñeca, 
              combina una pulsera de cadena delicada con un brazalete rígido más ancho. En el cuello, 
              superpón un collar corto delgado con otro más largo. En las manos, un anillo de banda 
              fina en el meñique complementa un anillo con piedra natural en el dedo anular. La clave 
              es variar grosores manteniendo coherencia en el metal.
            </p>
            <p>
              Los aros de plata son el accesorio más impactante. Un par de aros delicados y largos 
              enmarcan el rostro y añaden movimiento. Los huggies pequeños o studs son perfectos para 
              looks minimalistas. Atrevete a mezclar: usa un arete largo en una oreja y un stud en 
              la otra para un look más contemporáneo y personal.
            </p>
            <p>
              Para looks bohemios, incorpora pulseras con piedras naturales como cuarzo rosa, amatista 
              o lapislázuli. Estas gemas amplían el color y la energía de tu atuendo, y la plata 
              realza su brillo natural. Las tobilleras de plata son especialmente relevantes en Chile 
              por el clima: una cadena fina en el tobillo es el detalle bohemio perfecto para verano.
            </p>
            <p>
              En contextos formales o profesionales, la elegancia está en la sutileza. Un collar de 
              cadena fina con un pequeño colgante de significado personal, un anillo delicado y unos 
              aros proporcionados son suficientes. La joyería artesanal de plata tiene una ventaja 
              aquí: su acabado imperfecto y sus pequeños detalles únicos transmiten sofisticación 
              sin necesidad de volumen.
            </p>
            <p>
              La plata de autor es más que una tendencia; es una declaración de identidad. Cada pieza 
              de Casa Orfebre es trabajada por manos que entienden cómo la joyería complementa tu 
              narrativa personal. Mezcla piezas antiguas con nuevas, combina metales si te atreves, 
              pero sobre todo, elige lo que resonar contigo.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Preguntas Frecuentes
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <dl className="mt-8 space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-sans text-base font-medium text-text">
                  {faq.question}
                </dt>
                <dd className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Internal Links */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text">
            Explora más
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Categorías
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/coleccion/aros-de-plata" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Aros de Plata
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/anillos-de-plata" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Anillos de Plata
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/collares" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Collares de Plata
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/pulseras" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Pulseras de Plata
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Para el hombre
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/coleccion/joyas-hombre" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Joyería para Hombre
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/piedras-naturales" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Piedras Naturales
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/plata-925" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Plata 925 y 950
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
