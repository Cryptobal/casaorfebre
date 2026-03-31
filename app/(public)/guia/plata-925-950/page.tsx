import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getApprovedProducts, getUserFavoriteIds } from "@/lib/queries/products";
import { generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Plata 925 vs Plata 950: Guía Definitiva",
  description:
    "Todo sobre plata 925 y plata 950. Diferencias, cómo identificar plata real, significado de sellos. Guía completa con tabla comparativa.",
  alternates: { canonical: "/guia/plata-925-950" },
  openGraph: {
    title: "Plata 925 vs Plata 950: Guía Definitiva | Casa Orfebre",
    description:
      "Todo sobre plata 925 y plata 950. Diferencias, cómo identificar plata real, significado de sellos.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿La plata 925 es plata real?",
    answer:
      "Sí, contiene 92.5% de plata pura. El 7.5% restante es cobre u otro metal que aumenta su dureza. Esta es la composición más común para joyería de calidad y se conoce como plata esterlina.",
  },
  {
    question: "¿Qué es mejor, 925 o 950?",
    answer:
      "Depende del uso. La plata 925 es más dura y resiste mejor el desgaste diario, ideal para anillos y cadenas. La plata 950 es más pura y brillante, perfecta para piezas elegantes como aros y colgantes que reciben menos fricción.",
  },
  {
    question: "¿La plata 925 se pone negra?",
    answer:
      "Sí, es oxidación natural. Se limpia fácilmente con un paño de pulir especial para plata o sumergiendo la pieza en agua tibia con jabón neutro y un cepillo suave. Esto no afecta la calidad ni durabilidad.",
  },
  {
    question: "¿Cuánto cuesta el gramo de plata 925?",
    answer:
      "El precio del gramo de plata 925 fluctúa según el mercado internacional. Típicamente oscila entre $700-900 CLP por gramo en Chile. El precio final de una pieza depende también del trabajo artesanal y diseño.",
  },
  {
    question: "¿Qué significa el sello 925 Italy?",
    answer:
      "Indica que es plata esterlina (92.5% de pureza) fabricada en Italia. Italia es reconocida mundialmente por su excelencia en la orfebrería. Este sello garantiza tanto la pureza como el origen de la pieza.",
  },
  {
    question: "¿La plata 950 es hipoalergénica?",
    answer:
      "Sí, generalmente es hipoalergénica debido a su alta pureza (95% de plata). Sin embargo, el metal aleante (5%) puede causar reacciones en personas con alergias específicas a ciertos metales. Comprueba siempre con tu joyero.",
  },
  {
    question: "¿Se puede bañar en oro la plata 925?",
    answer:
      "Sí, el baño de oro sobre plata 925 es muy popular. Crea una pieza dorada que combina lo mejor de ambos metales: la durabilidad de la plata con la calidez visual del oro. El baño es reversible con el tiempo.",
  },
  {
    question: "¿Cómo limpiar plata en casa?",
    answer:
      "Usa un paño de pulir especial para plata o limpia con agua tibia, jabón neutro y un cepillo suave. Para suciedad más resistente, remoja la pieza brevemente en agua con una cucharada de bicarbonato. Seca bien después de limpiar.",
  },
];

interface TableRow {
  caracteristica: string;
  plata925: string;
  plata950: string;
  plata999: string;
}

const tableData: TableRow[] = [
  {
    caracteristica: "Pureza",
    plata925: "92.5%",
    plata950: "95%",
    plata999: "99.9%",
  },
  {
    caracteristica: "Dureza",
    plata925: "Alta",
    plata950: "Media",
    plata999: "Baja",
  },
  {
    caracteristica: "Precio relativo",
    plata925: "$",
    plata950: "$$",
    plata999: "$$$",
  },
  {
    caracteristica: "Brillo",
    plata925: "Muy bueno",
    plata950: "Excelente",
    plata999: "Máximo",
  },
  {
    caracteristica: "Resistencia rayones",
    plata925: "Alta",
    plata950: "Media",
    plata999: "Baja",
  },
  {
    caracteristica: "Uso ideal",
    plata925: "Anillos, cadenas, pulseras",
    plata950: "Aros, colgantes, argollas",
    plata999: "Industrial, lingotes",
  },
  {
    caracteristica: "Sello",
    plata925: "925, S925, Sterling",
    plata950: "950",
    plata999: "999",
  },
];

export default async function PlataGuidePage() {
  const session = await auth();
  const [products, favoriteIds] = await Promise.all([
    getApprovedProducts({}).then((result) =>
      (result?.products || []).slice(0, 4)
    ),
    session ? getUserFavoriteIds(session.user?.id) : new Set(),
  ]);

  const faqJsonLd = generateFAQJsonLd(faqs);

  const tocItems = [
    { id: "que-es-925", label: "¿Qué es la plata 925?" },
    { id: "que-es-950", label: "¿Qué es la plata 950?" },
    { id: "que-es-fina", label: "¿Qué es la plata fina?" },
    { id: "tabla-comparativa", label: "Tabla comparativa" },
    { id: "sellos", label: "Sellos y marcas de la plata" },
    { id: "identificar", label: "Cómo identificar plata auténtica" },
    { id: "cual-elegir", label: "¿Cuál elegir para joyería?" },
    { id: "italiana", label: "Plata italiana 925" },
    { id: "faq", label: "Preguntas frecuentes" },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd} />

      <article className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* ─── Breadcrumbs ─── */}
        <FadeIn>
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Guías", href: "/guia" },
              { label: "Plata 925 vs 950", href: "/guia/plata-925-950" },
            ]}
          />
        </FadeIn>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* ─── Main Content ─── */}
          <div className="lg:col-span-2">
            <FadeIn>
              {/* Hero */}
              <header className="mb-12">
                <div className="mb-4 h-1 w-16 bg-accent"></div>
                <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
                  Plata 925 vs Plata 950: Todo lo que Necesitas Saber
                </h1>
              </header>
            </FadeIn>

            {/* Table of Contents */}
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

            {/* ¿Qué es la plata 925? */}
            <FadeIn delay={0.2}>
              <section id="que-es-925" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Qué es la plata 925?
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  La plata 925, también conocida como <strong>plata esterlina</strong>, es la
                  aleación de plata más popular en joyería. Su composición es precisamente
                  92.5% de plata pura y 7.5% de otros metales, típicamente cobre, que actúan
                  como agente endurecedor.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  La razón de esta aleación es práctica: la plata pura (99.9%) es demasiado
                  suave para crear joyas duraderas. El cobre le proporciona la rigidez necesaria
                  sin comprometer su belleza ni valor. Este estándar fue establecido en Inglaterra
                  en el siglo XII y se conoce como "esterlina" por el nombre de las monedas inglesas.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  En Casa Orfebre usamos plata 925 para nuestras <Link
                    href="/coleccion"
                    className="text-accent hover:underline"
                  >
                    cadenas de plata, anillos y pulseras
                  </Link>
                  {" "}
                  de uso diario, precisamente por su excelente balance entre durabilidad y pureza.
                </p>
              </section>
            </FadeIn>

            {/* ¿Qué es la plata 950? */}
            <FadeIn delay={0.3}>
              <section id="que-es-950" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Qué es la plata 950?
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  La plata 950 es una aleación de mayor pureza, compuesta por 95% de plata pura
                  y solo 5% de metal adicional. Es el estándar oficial en países como Chile y
                  Perú, donde tiene un significado cultural especial en la joyería artesanal.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  Gracias a su mayor contenido de plata pura, la plata 950 tiene un brillo más
                  intenso y luminoso que la 925. Sin embargo, es más suave y propensa a rayones
                  con el uso diario. Por ello, es ideal para <strong>joyas de autor</strong>,
                  piezas elegantes que se usan en ocasiones especiales o que no reciben tanto
                  desgaste como un anillo de uso cotidiano.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  La plata 950 es más cara que la 925 debido a su mayor contenido de plata pura,
                  lo que la convierte en una inversión premium para quienes valoran la máxima
                  calidad y autenticidad.
                </p>
              </section>
            </FadeIn>

            {/* ¿Qué es la plata fina? */}
            <FadeIn delay={0.4}>
              <section id="que-es-fina" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Qué es la plata fina?
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  La plata fina, también llamada <strong>plata 999</strong>, es plata pura con un
                  99.9% de contenido de plata. Aunque tiene la pureza máxima, casi no se usa en
                  joyería convencional porque es excesivamente suave.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  La plata 999 se utiliza principalmente en lingotes de inversión, monedas de
                  colección y aplicaciones industriales. Para joyería, siempre es mejor optar por
                  plata 925 o 950, que ofrecen el balance perfecto entre pureza y practicidad.
                </p>
              </section>
            </FadeIn>

            {/* Tabla Comparativa */}
            <FadeIn delay={0.5}>
              <section id="tabla-comparativa" className="mb-12 scroll-mt-20">
                <h2 className="mb-6 font-serif text-3xl font-light tracking-tight text-text">
                  Tabla comparativa
                </h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-accent/5">
                        <th className="px-6 py-4 text-left font-sans text-sm font-semibold text-text">
                          Característica
                        </th>
                        <th className="px-6 py-4 text-left font-sans text-sm font-semibold text-text">
                          Plata 925
                        </th>
                        <th className="px-6 py-4 text-left font-sans text-sm font-semibold text-text">
                          Plata 950
                        </th>
                        <th className="px-6 py-4 text-left font-sans text-sm font-semibold text-text">
                          Plata 999
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-accent/2">
                          <td className="px-6 py-4 font-sans text-sm font-medium text-text">
                            {row.caracteristica}
                          </td>
                          <td className="px-6 py-4 font-sans text-sm text-text-secondary">
                            {row.plata925}
                          </td>
                          <td className="px-6 py-4 font-sans text-sm text-text-secondary">
                            {row.plata950}
                          </td>
                          <td className="px-6 py-4 font-sans text-sm text-text-secondary">
                            {row.plata999}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </FadeIn>

            {/* Sellos y Marcas */}
            <FadeIn delay={0.6}>
              <section id="sellos" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Sellos y marcas de la plata
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  Todo producto de plata auténtica debe tener un sello grabado que indique su
                  pureza. Estos sellos actúan como garantía de calidad y son mandatorios en la
                  mayoría de los países.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  Los sellos más comunes incluyen:
                </p>
                <ul className="mb-4 space-y-2 font-light text-text-secondary">
                  <li>
                    <strong>925, S925 o Sterling</strong>: Indican plata esterlina (92.5% de
                    pureza)
                  </li>
                  <li>
                    <strong>925 Italy o Made in Italy</strong>: Plata esterlina fabricada en
                    Italia
                  </li>
                  <li>
                    <strong>950</strong>: Plata con 95% de pureza, estándar en América Latina
                  </li>
                  <li>
                    <strong>999</strong>: Plata fina con 99.9% de pureza
                  </li>
                  <li>
                    <strong>Ley</strong>: Término histórico que se refiere al contenido de metal
                    precioso
                  </li>
                </ul>
                <p className="font-light leading-relaxed text-text-secondary">
                  En Casa Orfebre, cada pieza viene con certificado de autenticidad que especifica
                  el tipo de plata utilizado. Este sello digital con QR garantiza que estás
                  comprando joyería real y verificada.
                </p>
              </section>
            </FadeIn>

            {/* Callout */}
            <FadeIn delay={0.7}>
              <div className="mb-12 rounded-lg border-l-4 border-accent bg-accent/5 p-6">
                <p className="font-light text-text-secondary">
                  <strong className="block text-text">💡 Dato importante:</strong>
                  En Casa Orfebre, cada pieza viene con certificado de autenticidad que especifica
                  el tipo de plata utilizada. Nuestros certificados digitales con QR garantizan que
                  estás comprando joyería real de orfebres verificados.
                </p>
              </div>
            </FadeIn>

            {/* Cómo identificar plata auténtica */}
            <FadeIn delay={0.8}>
              <section id="identificar" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Cómo identificar plata auténtica
                </h2>
                <p className="mb-6 font-light leading-relaxed text-text-secondary">
                  Si tienes dudas sobre la autenticidad de una pieza, aquí hay cinco métodos
                  simples que puedes usar en casa:
                </p>

                <div className="space-y-6">
                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">
                      1. Buscar el sello o marca
                    </h3>
                    <p className="font-light text-text-secondary">
                      Examina cuidadosamente la pieza con una lupa. Debe tener un sello grabado
                      (925, 950, 999, Sterling, etc.). Si no hay sello, es probable que no sea
                      plata pura. En Casa Orfebre, todos nuestros productos están marcados
                      correctamente.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">
                      2. Test del imán
                    </h3>
                    <p className="font-light text-text-secondary">
                      La plata no es magnética. Coloca un imán cerca de la pieza. Si es atraída,
                      contiene metales ferrosos y no es plata pura. Este es uno de los tests más
                      rápidos y efectivos.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">
                      3. Test del hielo
                    </h3>
                    <p className="font-light text-text-secondary">
                      La plata es un excelente conductor de calor. Coloca un cubo de hielo sobre
                      la pieza. La plata auténtica debe derretir el hielo más rápidamente que otros
                      metales. Si el hielo permanece intacto, es una señal de que no es plata pura.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">
                      4. Test del papel blanco
                    </h3>
                    <p className="font-light text-text-secondary">
                      Frota la pieza suavemente sobre papel blanco. La plata pura dejará una marca
                      de color plata grisáceo. Si no deja marca o deja una marca de color diferente,
                      es posible que la pieza no sea auténtica.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">
                      5. Certificado de autenticidad
                    </h3>
                    <p className="font-light text-text-secondary">
                      La forma más segura de verificar la autenticidad es con un certificado
                      oficial. En Casa Orfebre, cada pieza incluye un certificado digital con QR
                      que puedes verificar en línea para confirmar que la joya es auténtica y
                      proviene de un orfebre verificado.
                    </p>
                  </div>
                </div>
              </section>
            </FadeIn>

            {/* ¿Cuál elegir para joyería? */}
            <FadeIn delay={0.9}>
              <section id="cual-elegir" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Cuál elegir para joyería?
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  La elección entre plata 925 y 950 depende del tipo de pieza y cómo planeas usarla:
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Anillos</h3>
                    <p className="font-light text-text-secondary">
                      <strong>Recomendación: Plata 925</strong>. Los anillos reciben mucho desgaste
                      diario. La mayor dureza de la plata 925 es ideal para resistir rayones y
                      mantener su forma. Especialmente importantes en anillos de matrimonio o uso
                      constante.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Cadenas</h3>
                    <p className="font-light text-text-secondary">
                      <strong>Recomendación: Plata 925 o 950</strong>. Ambas funcionan bien. La plata
                      925 es más resistente al estiramiento, mientras que la 950 ofrece mayor brillo.
                      Depende de si valoras más durabilidad o estética.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Aros y Colgantes</h3>
                    <p className="font-light text-text-secondary">
                      <strong>Recomendación: Plata 950</strong>. Estas piezas reciben menos desgaste
                      que los anillos, así que puedes aprovechar la mayor pureza y brillo de la plata
                      950 sin preocuparte tanto por rayones.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Argollas de Matrimonio</h3>
                    <p className="font-light text-text-secondary">
                      <strong>Recomendación: Plata 950</strong>. Las argollas son piezas especiales
                      que simbolizan un compromiso eterno. La mayor pureza de la plata 950 refuerza
                      ese significado. Aunque reciben uso diario, la mayor pureza es parte del
                      simbolismo.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Pulseras</h3>
                    <p className="font-light text-text-secondary">
                      <strong>Recomendación: Plata 925</strong>. Como los anillos, las pulseras
                      reciben rozamiento constante. La plata 925 es más durable y resistirá mejor
                      el uso diario.
                    </p>
                  </div>
                </div>

                <p className="mt-6 font-light leading-relaxed text-text-secondary">
                  En Casa Orfebre ofrecemos ambas opciones. Puedes explorar nuestra colección de{" "}
                  <Link href="/coleccion" className="text-accent hover:underline">
                    joyas de plata 925 y 950
                  </Link>
                  {" "}
                  y encontrar la pieza perfecta para tu estilo de vida. Complementa tu colección con
                  piezas en oro 18k, baños de oro sobre plata o piedras naturales como cuarzo rosa
                  para crear un look personalizado.
                </p>
              </section>
            </FadeIn>

            {/* Plata italiana 925 */}
            <FadeIn delay={1}>
              <section id="italiana" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Plata italiana 925
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  Italia tiene una tradición milenaria en la orfebrería. La plata italiana 925 es
                  renombrada mundialmente por su calidad excepcional y exquisitez artesanal. Los
                  orfebres italianos han perfeccionado sus técnicas durante siglos.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  Las piezas con sello "925 Italy" o "Made in Italy" son especialmente valoradas
                  porque garantizan no solo la pureza correcta, sino también el dominio técnico de
                  maestros artesanos italianos. Estas piezas tienen características distintivas:
                  proporciones equilibradas, acabados impecables y diseños que combinan tradición
                  con modernidad.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  Si buscas plata 925 italiana, verifica que lleve claramente el sello "Italy" o
                  una marca de fabricante italiano certificado. En Casa Orfebre trabajamos con
                  orfebres que mantienen estos estándares de excelencia en sus producciones.
                </p>
              </section>
            </FadeIn>

            {/* FAQ Section */}
            <FadeIn delay={1.1}>
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

                {/* CTA */}
                <div className="mt-12 rounded-lg bg-accent/5 p-8 text-center">
                  <p className="mb-4 font-light text-text-secondary">
                    Ahora que conoces todo sobre plata 925 y 950, es momento de encontrar la pieza
                    perfecta para ti.
                  </p>
                  <Link
                    href="/coleccion"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-sans font-semibold text-white transition-colors hover:bg-accent/90"
                  >
                    Explora nuestra colección de joyas de plata →
                  </Link>
                </div>
              </section>
            </FadeIn>
          </div>

          {/* ─── Sidebar ─── */}
          <aside className="hidden lg:block">
            <FadeIn delay={0.2}>
              <div className="sticky top-20 space-y-8">
                {/* Productos */}
                <div>
                  <h3 className="mb-6 font-serif text-lg font-light text-text">
                    Productos en Plata
                  </h3>
                  <div className="space-y-4">
                    {products.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorited={favoriteIds.has(product.id)}
                        listName="plata-925-950-guide"
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
