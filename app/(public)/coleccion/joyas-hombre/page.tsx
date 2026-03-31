export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getProductsByGender, getUserFavoriteIds } from "@/lib/queries/products";
import { generateItemListJsonLd, generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Joyería de Plata para Hombre — Pulseras, Anillos, Aros y Cadenas",
  description:
    "Joyería de plata artesanal para hombre. Pulseras, anillos, aros, cadenas y colgantes hechos a mano. Diseños masculinos únicos con envío a Chile.",
  alternates: { canonical: "/coleccion/joyas-hombre" },
  openGraph: {
    title: "Joyería de Plata para Hombre | Casa Orfebre",
    description:
      "Joyería de plata artesanal para hombre. Pulseras, anillos, aros, cadenas y colgantes hechos a mano por orfebres chilenos.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

const FAQS = [
  {
    question: "¿Qué joyería de plata puede usar un hombre?",
    answer:
      "Los hombres pueden usar prácticamente cualquier tipo de joyería de plata: pulseras de cadena gruesa, anillos de banda ancha o con sellos, aros tipo argolla o stud, cadenas grumet o cubana, y colgantes con cruces, medallas o símbolos. La clave está en elegir piezas proporcionales y coherentes con tu estilo personal.",
  },
  {
    question: "¿Los hombres usan aros de plata?",
    answer:
      "Sí, y es una tendencia en constante crecimiento. Los aros de plata para hombre más populares son las argollas pequeñas (huggies), los studs discretos y los aros tipo aro fino. Se usan tanto en una oreja como en ambas, y son un accesorio versátil que complementa cualquier look.",
  },
  {
    question: "¿Qué pulsera de plata es mejor para hombre?",
    answer:
      "Las pulseras de cadena grumet, cubana y eslabón grueso son las más populares por su apariencia robusta y durabilidad. Los brazaletes rígidos de plata también son una excelente opción para un look más pulido. El grosor ideal para hombre suele ser de 6 a 10 mm de ancho.",
  },
  {
    question: "¿Cómo elegir un anillo de plata para hombre?",
    answer:
      "Considera el ancho de la banda: los anillos masculinos suelen ser de 6 a 12 mm de ancho. Los estilos más populares son bandas lisas gruesas, anillos de sello, anillos con texturas martilladas y diseños con símbolos. Para uso diario, la plata 925 es ideal por su dureza.",
  },
  {
    question: "¿La joyería de plata para hombre se oscurece?",
    answer:
      "Sí, la plata se oxida naturalmente con el tiempo, adquiriendo una pátina oscura. Para muchos hombres, esta pátina añade carácter a la pieza. Si prefieres mantener el brillo original, limpia regularmente con un paño de pulir plata. Evita el contacto con cloro, perfumes y productos químicos.",
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
    title: "Pulseras para Hombre",
    categorySlug: "pulsera",
    description:
      "Pulseras de cadena grumet, cubana, eslabón y brazaletes rígidos. Diseños robustos y proporcionales para la muñeca masculina, trabajados a mano en plata 925 y 950.",
    ctaLabel: "Ver todas las pulseras",
    ctaHref: "/coleccion/pulseras-de-plata",
  },
  {
    title: "Anillos para Hombre",
    categorySlug: "anillo",
    description:
      "Anillos de banda ancha, sellos, texturas martilladas y diseños minimalistas. Piezas con presencia y carácter, forjadas por orfebres que dominan la proporción masculina.",
    ctaLabel: "Ver todos los anillos",
    ctaHref: "/coleccion/anillos-de-plata",
  },
  {
    title: "Aros y Aritos para Hombre",
    categorySlug: "aros",
    description:
      "Argollas pequeñas, huggies y studs discretos en plata. La tendencia de aros masculinos crece cada año, y nuestros orfebres crean piezas que se adaptan a cualquier estilo.",
    ctaLabel: "Ver todos los aros",
    ctaHref: "/coleccion/aros-de-plata",
  },
  {
    title: "Cadenas y Collares para Hombre",
    categorySlug: "cadena",
    description:
      "Cadenas grumet, cubana, figaro y cadenas con dijes. Diferentes grosores y largos para layering o uso individual. El accesorio masculino por excelencia.",
    ctaLabel: "Ver todas las cadenas",
    ctaHref: "/coleccion/cadenas-de-plata",
  },
  {
    title: "Colgantes y Cruces para Hombre",
    categorySlug: "colgante",
    description:
      "Cruces de plata, medallas de San Benito, colgantes con símbolos y piezas con significado. Cada colgante artesanal cuenta una historia diferente.",
    ctaLabel: "Ver todos los colgantes",
    ctaHref: "/coleccion/colgantes-dijes-plata",
  },
];

export default async function JoyasHombrePage() {
  const session = await auth();
  const favoriteIds = await getUserFavoriteIds(session?.user?.id);

  // Fetch products for each section in parallel
  const sectionProducts = await Promise.all(
    SECTIONS.map((s) => getProductsByGender("hombre", s.categorySlug, 4))
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
            { label: "Joyería para Hombre" },
          ]}
        />

        {/* Hero */}
        <div className="mb-14 max-w-3xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
            Joyería de Plata para Hombre
          </h1>
          <div className="mt-2 h-px w-16 bg-accent" />
          <p className="mt-4 font-sans text-lg font-light leading-relaxed text-text-secondary">
            Piezas con carácter, forjadas a mano por orfebres que entienden la proporción
            y el peso que busca el estilo masculino. Plata artesanal que no necesita
            gritar para hacerse notar.
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
                  {/* @ts-expect-error - product type inference from async function */}
                  {products.map((product) => (
                    <FadeIn key={product.id} delay={0}>
                      <ProductCard
                        product={product}
                        isFavorited={favoriteIds.has(product.id)}
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
            Guía de Estilo: Joyería de Plata para Hombre
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />

          <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed text-text-secondary">
            <p>
              La joyería masculina de plata ha dejado de ser una excepción para convertirse en un elemento 
              esencial del estilo contemporáneo. Cada vez más hombres en Chile y el mundo incorporan 
              pulseras, anillos y cadenas de plata como parte de su identidad visual, y la tendencia 
              no muestra señales de desaceleración en 2026.
            </p>
            <p>
              La regla más importante al usar joyería de plata es la coherencia. Si eliges plata, 
              mantén toda tu joyería en el mismo metal: mezclar plata con oro puede funcionar en 
              contextos muy específicos, pero la elegancia suele estar en la uniformidad. La plata 
              tiene una ventaja natural: combina con prácticamente todo, desde un traje formal 
              hasta jeans y camiseta.
            </p>
            <p>
              Para el look casual cotidiano, una pulsera de cadena grumet o cubana en la muñeca 
              opuesta al reloj es el punto de partida perfecto. Si quieres añadir más, un anillo 
              de banda en el dedo anular o medio complementa sin saturar. Las cadenas son ideales 
              para usar bajo una camisa entreabierta o sobre una camiseta oscura.
            </p>
            <p>
              El <em>stacking</em> — usar varias piezas juntas — funciona especialmente bien en 
              la muñeca. Combina una pulsera de cadena con un brazalete rígido o una pulsera de 
              cuero con detalles en plata. La clave es variar texturas y grosores manteniendo 
              el mismo metal.
            </p>
            <p>
              En contextos formales, menos es más. Un anillo de sello, un par de gemelos de plata 
              o una cadena fina bajo la camisa son suficientes. Las piezas artesanales tienen una 
              ventaja aquí: su acabado único y sus pequeñas imperfecciones las distinguen 
              inmediatamente de la joyería industrial.
            </p>
            <p>
              Los aros para hombre son quizás la tendencia más fuerte del momento. Una argolla 
              pequeña o un huggie de plata en una oreja añade personalidad sin comprometer la 
              versatilidad del look. En Casa Orfebre, cada pieza para hombre está pensada por 
              orfebres que entienden que la joyería masculina es sobre presencia silenciosa, 
              no sobre ostentación.
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
                  <Link href="/coleccion/cadenas-de-plata" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Cadenas de Plata
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/anillos-de-plata" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Anillos de Plata
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/pulseras-de-plata" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Pulseras de Plata
                  </Link>
                </li>
                <li>
                  <Link href="/coleccion/aros-de-plata" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Aros de Plata
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">
                En nuestro blog
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/blog/guia-elegir-cuidar-joyas-artesanales-plata" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Guía para elegir y cuidar joyas de plata
                  </Link>
                </li>
                <li>
                  <Link href="/blog/joyeria-de-autor-chile-renacimiento-orfebreria-artesanal" className="font-sans text-sm text-text-secondary transition-colors hover:text-accent">
                    Joyería de autor en Chile
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
