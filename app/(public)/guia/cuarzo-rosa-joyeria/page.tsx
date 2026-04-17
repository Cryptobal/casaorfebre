import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedProducts } from "@/lib/queries/products";
import { generateFAQJsonLd, generateHowToJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cuarzo Rosa en Joyería: Propiedades y Significado",
  description:
    "Descubre el cuarzo rosa en joyería: propiedades energéticas, significado espiritual, cómo cuidarlo y dónde usarlo. Guía completa de la piedra del amor.",
  alternates: { canonical: "/guia/cuarzo-rosa-joyeria" },
  openGraph: {
    title: "Cuarzo Rosa en Joyería: Propiedades y Significado | Casa Orfebre",
    description:
      "Descubre el cuarzo rosa en joyería: propiedades energéticas, significado espiritual, cómo cuidarlo y dónde usarlo.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Cuál es el significado del cuarzo rosa?",
    answer:
      "El cuarzo rosa es conocido como la piedra del amor incondicional. Representa la compasión, la paz interior y la apertura del corazón. Se asocia con la sanación emocional, la autoestima y la capacidad de amar profundamente. En culturas antiguas, se creía que promovía la armonía en las relaciones.",
  },
  {
    question: "¿Es realmente efectivo el cuarzo rosa?",
    answer:
      "Desde una perspectiva científica, el cuarzo rosa no tiene propiedades curativas probadas. Sin embargo, muchas personas reportan sentirse mejor cuando lo llevan, especialmente si creen en sus propiedades. Es un efecto placebo poderoso: si te hace sentir más pacífico y amoroso, eso ya es valioso. En Casa Orfebre, lo importante es que te conectes con la pieza.",
  },
  {
    question: "¿Cuál es la diferencia entre cuarzo rosa claro y oscuro?",
    answer:
      "El cuarzo rosa más claro típicamente es más frágil y delicado, mientras que el más oscuro o rosa intenso suele ser más duradero. El color depende de las inclusiones minerales. Ambos son hermosos; la elección es puramente estética. Un rosa suave transmite tranquilidad, mientras que un rosa más intenso es más dramático.",
  },
  {
    question: "¿Se puede limpiar el cuarzo rosa?",
    answer:
      "Sí, puedes limpiar el cuarzo rosa con agua tibia y jabón suave. También se puede dejar bajo luz lunar o solar, aunque el sol intenso puede descolorar algunas piedras si se exponen demasiado. Muchas personas lo purifican con humo de salvia o lo cargan bajo la luna llena.",
  },
  {
    question: "¿Se puede usar cuarzo rosa en anillos de uso diario?",
    answer:
      "El cuarzo rosa es relativamente suave (7-7.5 en la escala de Mohs), lo que significa que puede rayarse con uso intenso diario. Es mejor reservarlo para aros, colgantes o anillos ocasionales. Si deseas un anillo diario con piedra, la turmalina o la amatista son más resistentes.",
  },
  {
    question: "¿Cuánto cuesta un anillo con cuarzo rosa?",
    answer:
      "El precio de un anillo con cuarzo rosa depende del tamaño de la piedra, la calidad de la plata (925 u 950) y la complejidad del diseño. Un anillo artesanal con cuarzo rosa en plata 925 oscila típicamente entre $18.000 y $60.000 CLP. En oro 18K, los precios son significativamente mayores.",
  },
];

const tocItems = [
  { id: "que-es", label: "¿Qué es el cuarzo rosa?" },
  { id: "propiedades", label: "Propiedades y significado" },
  { id: "diferencias", label: "Tipos de cuarzo rosa" },
  { id: "joyeria", label: "Cuarzo rosa en joyería" },
  { id: "cuidado", label: "Cómo cuidar tu cuarzo rosa" },
  { id: "energia", label: "Energía y espiritualidad" },
  { id: "faq", label: "Preguntas frecuentes" },
];

export default async function CuarzoRosaPage() {
  const products = await getApprovedProducts({}).then((products) => products.slice(0, 4));

  const faqJsonLd = generateFAQJsonLd(faqs);

  return (
    <>
      <JsonLd data={generateHowToJsonLd({
        name: "Cómo elegir joyería con cuarzo rosa",
        description: "Guía para elegir y cuidar joyas con cuarzo rosa natural en joyería artesanal.",
        url: "https://casaorfebre.cl/guia/cuarzo-rosa-joyeria",
        totalTime: "PT4M",
        steps: [
          { name: "Verifica que sea natural", text: "El cuarzo rosa natural tiene tonalidades suaves e irregulares. Versiones sintéticas son demasiado uniformes y saturadas." },
          { name: "Observa la transparencia", text: "Piezas de mejor calidad son translúcidas y sin fisuras visibles bajo la luz." },
          { name: "Elige el engaste", text: "En plata 925 el cuarzo rosa resalta naturalmente. Engastes de oro 18k o cobre dan un contraste cálido distinto." },
          { name: "Cuida tu piedra", text: "El cuarzo rosa puede aclarar con exposición prolongada al sol. Guárdalo en un lugar oscuro y evita productos químicos." },
        ],
      })} />
      <JsonLd data={faqJsonLd} />

      <article className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <FadeIn>
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Guías", href: "/guia" },
              { label: "Cuarzo Rosa", href: "/guia/cuarzo-rosa-joyeria" },
            ]}
          />
        </FadeIn>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FadeIn>
              <header className="mb-12">
                <div className="mb-4 h-1 w-16 bg-accent"></div>
                <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
                  Cuarzo Rosa: La Piedra del Amor
                </h1>
              </header>
            </FadeIn>

            <FadeIn delay={0.1}>
              <nav className="mb-12 rounded-lg border-l-4 border-accent bg-white p-6">
                <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wide text-text">
                  En este artículo
                </h2>
                <ul className="space-y-2">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </FadeIn>

            <FadeIn delay={0.2}>
              <section id="que-es" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Qué es el cuarzo rosa?
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El cuarzo rosa es una variedad de cuarzo cristalino con un color rosa suave a intenso.
                  Es uno de los minerales más abundantes en la corteza terrestre y se encuentra en muchas
                  partes del mundo: Brasil, Madagascar, Sudáfrica y otros lugares. Su color rosa proviene
                  de pequeñas inclusiones de titanio, hierro u otros elementos.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  En la escala de dureza de Mohs, el cuarzo rosa mide 7-7.5, lo que significa que es
                  relativamente duro pero no tan resistente como el diamante o el zafiro. Esto lo hace
                  precioso para joyería artesanal: es lo suficientemente resistente para durar años, pero
                  requiere cuidado especial en piezas de uso intenso.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  A lo largo de la historia, el cuarzo rosa ha sido valorado por culturas antiguas: los
                  egipcios lo asociaban con el amor y la fertilidad, los aztecas lo consideraban sagrado.
                  En la tradición moderna de cristaloterapia, es considerado una piedra fundamental.
                </p>
              </section>
            </FadeIn>

            <FadeIn delay={0.3}>
              <section id="propiedades" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Propiedades y significado
                </h2>
                <p className="mb-6 font-light leading-relaxed text-text-secondary">
                  El cuarzo rosa está envuelto en simbolismo y se asocia con múltiples significados emocionales
                  y espirituales:
                </p>

                <div className="space-y-6">
                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Amor incondicional</h3>
                    <p className="font-light text-text-secondary">
                      La propiedad más asociada al cuarzo rosa es el amor incondicional. Se cree que abre
                      el corazón a todas las formas de amor: romántico, platónico, familiar y amor hacia uno
                      mismo.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Paz interior</h3>
                    <p className="font-light text-text-secondary">
                      Se asocia con tranquilidad y serenidad. Llevar cuarzo rosa se cree que reduce la ansiedad
                      y promueve un estado mental pacífico.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Sanación emocional</h3>
                    <p className="font-light text-text-secondary">
                      En las tradiciones holísticas, se cree que el cuarzo rosa ayuda a sanar heridas
                      emocionales y a superar traumas pasados.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Autoestima y aceptación</h3>
                    <p className="font-light text-text-secondary">
                      Se cree que fortalece la capacidad de amarse a uno mismo y aceptar los propios defectos.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Armonía relacional</h3>
                    <p className="font-light text-text-secondary">
                      Se asocia con la mejora de relaciones interpersonales y la capacidad de comunicarse
                      desde el corazón.
                    </p>
                  </div>
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.4}>
              <section id="diferencias" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Tipos de cuarzo rosa
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El cuarzo rosa no es uniforme. Existen varias variaciones según su origen, claridad y tonalidad:
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Cuarzo rosa transparente</h3>
                    <p className="font-light text-text-secondary">
                      Es el más raro y valioso. Tiene un color rosa claro y es bastante transparente. Se utiliza
                      a menudo en colgantes y aros donde la luz puede penetrarlo.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Cuarzo rosa lechoso</h3>
                    <p className="font-light text-text-secondary">
                      El tipo más común. Tiene un aspecto más opaco y lechoso con un rosa suave. Es duradero y
                      ideal para uso diario en joyería artesanal.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Cuarzo rosa intenso</h3>
                    <p className="font-light text-text-secondary">
                      Tiene un color rosa más profundo e intenso. Es menos común y más valorado. Se utiliza en
                      piezas donde el color es un elemento clave del diseño.
                    </p>
                  </div>
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.5}>
              <section id="joyeria" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Cuarzo rosa en joyería
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El cuarzo rosa es extremadamente versátil en joyería artesanal. Su suavidad relativa permite
                  ser tallado en múltiples formas, lo que lo hace popular en diseños únicos.
                </p>

                <div className="space-y-4 mt-6">
                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Colgantes de cuarzo rosa</h3>
                    <p className="font-light text-text-secondary">
                      Los colgantes son la forma más popular de llevar cuarzo rosa. Pueden ser piedras brutas,
                      pulidas en forma de gota, corazón o esfera. Se combinan hermosamente con cadenas de plata
                      925 o baño de oro.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Aros de cuarzo rosa</h3>
                    <p className="font-light text-text-secondary">
                      Los aros con cuarzo rosa son delicados y elegantes. Su rosa suave combina bien con plata,
                      lo que crea una combinación muy femenina y refinada.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Anillos de cuarzo rosa</h3>
                    <p className="font-light text-text-secondary">
                      Los anillos con cuarzo rosa son hermosos pero requieren cuidado en su uso. Se recomiendan
                      para ocasiones especiales más que para uso diario debido a su relativa suavidad.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Pulseras de cuarzo rosa</h3>
                    <p className="font-light text-text-secondary">
                      Las pulseras con cuentas de cuarzo rosa son populares en tradiciones holísticas y espirituales.
                      También existen pulseras artesanales elegantes con una o varias piedras de cuarzo rosa.
                    </p>
                  </div>
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.6}>
              <section id="cuidado" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Cómo cuidar tu cuarzo rosa
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  Aunque el cuarzo rosa es relativamente duradero, requiere cierto cuidado para mantener
                  su belleza:
                </p>

                <div className="space-y-6">
                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Limpieza</h3>
                    <p className="font-light text-text-secondary">
                      Limpia tu cuarzo rosa con agua tibia y jabón suave usando un paño delicado. Evita
                      soluciones ultrasónicas o limpiadoras químicas agresivas.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Protección del sol</h3>
                    <p className="font-light text-text-secondary">
                      La exposición prolongada al sol intenso puede decolorar el cuarzo rosa. Guarda tu joya
                      en un lugar sombrío cuando no la uses.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Evita golpes</h3>
                    <p className="font-light text-text-secondary">
                      Aunque es duro, puede fracturarse si recibe un golpe fuerte. Retira anillos y pulseras
                      de cuarzo rosa durante actividades físicas intensas.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Almacenamiento</h3>
                    <p className="font-light text-text-secondary">
                      Guarda tu cuarzo rosa en una bolsa de terciopelo o en una caja forrada para protegerlo
                      del polvo y de rozamientos.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Purificación energética</h3>
                    <p className="font-light text-text-secondary">
                      Muchas personas purifican su cuarzo rosa bajo luz lunar o solar, o con humo de salvia.
                      Elige el método que resuene contigo.
                    </p>
                  </div>
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.7}>
              <section id="energia" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Energía y espiritualidad
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  En las prácticas holísticas y espirituales, el cuarzo rosa se considera una de las piedras
                  más importantes. Se asocia con el chakra del corazón (Anahata), el centro energético relacionado
                  con el amor, la compasión y la conexión emocional.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  Muchas personas lo utilizan en meditación, lo llevan en pulseras o lo colocan en su hogar.
                  La creencia es que el cuarzo rosa amplifica las intenciones amorosas y ayuda a atraer relaciones
                  armoniosas. Mientras no haya evidencia científica, el efecto placebo y la intención pueden ser
                  poderosos.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  Lo más importante es conectar con tu cuarzo rosa de manera significativa. Si te hace sentir
                  más amoroso, pacífico y consciente, entonces está cumpliendo su propósito para ti.
                </p>
              </section>
            </FadeIn>

            <FadeIn delay={0.8}>
              <section id="faq" className="scroll-mt-20">
                <h2 className="mb-8 font-serif text-3xl font-light tracking-tight text-text">
                  Preguntas frecuentes
                </h2>

                <div className="space-y-6">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-border pb-6 last:border-b-0">
                      <h3 className="mb-3 font-sans font-semibold text-text">{faq.question}</h3>
                      <p className="font-light leading-relaxed text-text-secondary">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 rounded-lg bg-accent/5 p-8 text-center">
                  <p className="mb-4 font-light text-text-secondary">
                    Ahora que conoces el cuarzo rosa, explora nuestras joyas con esta piedra especial.
                  </p>
                  <Link
                    href="/coleccion"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-sans font-semibold text-white transition-colors hover:bg-accent/90"
                  >
                    Ver joyas con cuarzo rosa →
                  </Link>
                </div>
              </section>
            </FadeIn>
          </div>

          <aside className="hidden lg:block">
            <FadeIn delay={0.2}>
              <div className="sticky top-20 space-y-8">
                <div>
                  <h3 className="mb-6 font-serif text-lg font-light text-text">
                    Joyas Destacadas
                  </h3>
                  <div className="space-y-4">
                    {products.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        listName="cuarzo-rosa-guide"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </aside>
        </div>
      </article>
    </>
  );
}
