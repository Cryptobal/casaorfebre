import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedProducts } from "@/lib/queries/products";
import { generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

interface FAQItem {
  question: string;
  answer: string;
}

interface TableRow {
  estilo: string;
  ocasion: string;
  ventaja: string;
}

const faqs: FAQItem[] = [
  {
    question: '¿Cuál es la diferencia entre tobillera y pulsera de tobillo?',
    answer:
      'Los términos son sinónimos en español. Una tobillera es un adorno de joyería que se usa alrededor del tobillo. Algunos prefieren llamarla pulsera de tobillo, pero ambos términos se refieren al mismo accesorio. En la joyería artesanal chilena, usamos indistintamente ambos nombres.',
  },
  {
    question: '¿Las tobilleras de plata 925 son resistentes para uso diario?',
    answer:
      'Sí, la plata 925 es duradora para tobilleras de uso diario. Contiene 92.5% de plata pura reforzada con otros metales para mayor dureza. Una tobillera de plata bien cuidada puede durar años, especialmente si la limpias regularmente y la guardas en un lugar seguro cuando no la uses.',
  },
  {
    question: '¿Cómo sé qué largo necesito para una tobillera?',
    answer:
      'El largo de una tobillera se mide alrededor del tobillo en su punto más grueso. Generalmente rondan entre 21-25 cm dependiendo de la complexión. Si ordenas online, muchos orfebres ofrecen tobilleras ajustables. Una buena tobillera debe quedar cómoda sin apretar y sin resbalarse hacia el pie.',
  },
  {
    question: '¿Puedo usar una tobillera en la playa o la piscina?',
    answer:
      'Es mejor remover tu tobillera antes de entrar al agua clorada o salada. El cloro y la sal pueden dañar la plata y acelerar su oscurecimiento. Si usas baño de oro, estos ambientes pueden desgastar el recubrimiento más rápidamente. Guárdala en un lugar seguro mientras disfrutas del agua.',
  },
  {
    question: '¿Qué piedras naturales van mejor con tobilleras de plata?',
    answer:
      'Cuarzo rosa, amatista, lapislázuli, turmalina y aventurina son opciones populares para tobilleras. El cuarzo rosa simboliza amor e intuición, perfecto para usar cerca del corazón a través de la plata. Elige la piedra que resonar con tu intención personal.',
  },
  {
    question: '¿Son las tobilleras una tendencia que durará?',
    answer:
      'Las tobilleras son un accesorio clásico que ha permanecido en la moda durante miles de años. Aunque las tendencias específicas de estilo cambian, el tobillo como lienzo para la joyería está aquí para quedarse. Una tobillera artesanal de plata es una inversión duradera.',
  },
  {
    question: '¿Puedo combinar múltiples tobilleras?',
    answer:
      'Absolutamente. Muchas personas usan dos o tres tobilleras en el mismo tobillo o una en cada pie. El truco es equilibrar los estilos: si usas una tobillera delgada con piedras, puedes complementarla con una banda lisa. La clave es que el total no se sienta abrumador.',
  },
];

const tableData: TableRow[] = [
  {
    estilo: 'Minimalista',
    ocasion: 'Uso diario, casual',
    ventaja: 'Versátil, elegante, discreta',
  },
  {
    estilo: 'Con Piedras',
    ocasion: 'Eventos sociales, especiales',
    ventaja: 'Llamativa, simbólica, personalizada',
  },
  {
    estilo: 'Múltiples Cadenas',
    ocasion: 'Verano, playa (en seguridad)',
    ventaja: 'Bohemia, artística, única',
  },
  {
    estilo: 'Con Dije',
    ocasion: 'Ocasiones especiales',
    ventaja: 'Significado personal, memorable',
  },
];

const tocItems = [
  'Historia de las Tobilleras',
  'Por Qué Elegir Plata para Tobilleras',
  'Estilos Populares',
  'Tamaño y Comodidad',
  'Cuidado de tu Tobillera',
  'Tendencias Actuales',
  'Preguntas Frecuentes',
];

export const metadata: Metadata = {
  title: 'Tobilleras de Plata: Guía de Estilos y Tendencias 2026',
  description:
    'Descubre todo sobre tobilleras de plata artesanales. Guía completa sobre estilos, tendencias, cuidado y cómo elegir la tobillera perfecta para ti.',
  keywords:
    'tobilleras de plata, pulseras de tobillo, joyería de tobillo, tobilleras artesanales, diseños de tobilleras',
  openGraph: {
    title: 'Tobilleras de Plata: Guía de Estilos y Tendencias 2026',
    description:
      'Descubre todo sobre tobilleras de plata artesanales. Guía completa sobre estilos, tendencias, cuidado y cómo elegir la tobillera perfecta para ti.',
    type: 'article',
    url: 'https://casaorfebre.cl/guia/tobilleras-plata',
  },
  alternates: {
    canonical: 'https://casaorfebre.cl/guia/tobilleras-plata',
  },
};

export const revalidate = 3600;

export default async function TobillierasPage() {
  const products = await getApprovedProducts({}).then((result) => result.slice(0, 4));

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Guías', href: '/guia' },
    { label: 'Tobilleras de Plata' },
  ];

  const faqJsonLd = generateFAQJsonLd(faqs);

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Breadcrumbs items={breadcrumbs} />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
            Tobilleras de Plata: Guía de Estilos y Tendencias
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl">
            Descubre cómo las tobilleras de plata artesanales pueden transformar tu estilo personal.
            Esta guía completa te ayudará a elegir el diseño perfecto, entender los cuidados necesarios
            y explorar las tendencias más hermosas de la joyería de tobillo.
          </p>
        </header>

        {/* Tabla de Contenidos */}
        <nav className="bg-accent bg-opacity-10 rounded-lg p-8 mb-16">
          <h2 className="font-serif text-2xl text-text mb-6">Contenido</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tocItems.map((item, idx) => (
              <li key={idx}>
                <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-accent hover:underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sección 1: Historia */}
        <FadeIn delay={0.1}>
          <section id="historia-de-las-tobilleras" className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-6">Historia de las Tobilleras</h2>
            <p className="text-lg text-gray-700 mb-4">
              Las tobilleras son uno de los adornos más antiguos de la humanidad. Evidencia arqueológica
              muestra que culturas antiguas en Egipto, India y Mesopotamia usaban tobilleras de oro, plata
              y piedras como símbolos de estatus, protección espiritual y belleza.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              En la India, las tobilleras (conocidas como "anklets") han sido parte de la joyería tradicional
              femenina durante milenios, frecuentemente usadas como símbolo del estado marital. En Occidente,
              la popularidad de las tobilleras fue revitalizada en los años 70 y 80, y hoy son un accesorio
              versátil que trasciende géneros y edades.
            </p>
            <p className="text-lg text-gray-700">
              En Chile, la tradición de la joyería artesanal ha permitido que artesanos creen tobilleras
              únicas que combinan técnicas ancestrales con diseños contemporáneos, manteniendo viva esta
              hermosa tradición de adornos para los pies.
            </p>
          </section>
        </FadeIn>

        {/* Sección 2: Por Qué Plata */}
        <FadeIn delay={0.2}>
          <section id="por-que-elegir-plata-para-tobilleras" className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-6">Por Qué Elegir Plata para Tobilleras</h2>
            <p className="text-lg text-gray-700 mb-6">
              La plata es el material ideal para tobilleras artesanales por múltiples razones:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl text-accent mb-3">Durabilidad</h3>
                <p className="text-gray-700">
                  La plata 925 es suficientemente dura para resistir el uso diario, incluyendo el contacto
                  constante con el movimiento del tobillo. A diferencia del oro muy puro, la plata 925
                  contiene 7.5% de otros metales que la refuerzan sin comprometer su belleza.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-accent mb-3">Versatilidad</h3>
                <p className="text-gray-700">
                  El color blanco plateado combina con prácticamente cualquier estilo de vida, ropa y clima.
                  Funciona tanto en contextos formales como casuales, en la playa como en la oficina.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-accent mb-3">Precio Accesible</h3>
                <p className="text-gray-700">
                  La plata 925 ofrece una relación precio-calidad incomparable. Puedes obtener una tobillera
                  artesanal con piedras naturales de calidad a un costo mucho menor que el oro, sin sacrificar
                  durabilidad o belleza.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-accent mb-3">Lustre Natural</h3>
                <p className="text-gray-700">
                  El brillo blanco natural de la plata realza el contraste con piedras de colores, creando
                  diseños visuales más impactantes. La plata no eclipsa las piedras como podría hacerlo
                  un metal más cálido.
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Sección 3: Estilos */}
        <FadeIn delay={0.3}>
          <section id="estilos-populares" className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-6">Estilos Populares de Tobilleras</h2>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left text-gray-700">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="pb-4 font-serif text-lg text-text">Estilo</th>
                    <th className="pb-4 font-serif text-lg text-text">Ocasión</th>
                    <th className="pb-4 font-serif text-lg text-text">Ventaja</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-accent hover:bg-opacity-5">
                      <td className="py-4">{row.estilo}</td>
                      <td className="py-4">{row.ocasion}</td>
                      <td className="py-4">{row.ventaja}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-gray-700 mb-6">
              Cada estilo de tobillera cuenta una historia diferente. Las tobilleras minimalistas son perfectas
              para quienes aprecian la simplicidad elegante. Las que incorporan piedras naturales añaden un
              elemento espiritual y visual más fuerte. Los diseños con múltiples cadenas apelan a quienes buscan
              crear un look bohemio y artístico.
            </p>
          </section>
        </FadeIn>

        {/* Sección 4: Tamaño y Comodidad */}
        <FadeIn delay={0.4}>
          <section id="tamaño-y-comodidad" className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-6">Tamaño y Comodidad</h2>

            <p className="text-lg text-gray-700 mb-6">
              El tamaño correcto es crucial para una tobillera cómoda. A diferencia de un anillo de dedo,
              que se mide por talla estándar, las tobilleras se miden por el largo de la cadena.
            </p>

            <div className="bg-accent bg-opacity-5 rounded-lg p-8 mb-6">
              <h3 className="font-serif text-2xl text-text mb-4">Cómo Medir tu Tobillo</h3>
              <ol className="space-y-3 text-gray-700">
                <li>1. <strong>Usa una cinta métrica suave</strong> alrededor de tu tobillo en su punto más grueso.</li>
                <li>2. <strong>Asegúrate que sea cómoda</strong> - no aprietes demasiado ni muy suelte.</li>
                <li>3. <strong>Suma 1-2 cm</strong> para permitir comodidad y movimiento.</li>
                <li>4. <strong>La mayoría de las tobilleras oscilan entre 21-26 cm</strong> dependiendo de la complexión.</li>
              </ol>
            </div>

            <p className="text-gray-700">
              Si no estás segura de tu medida exacta, la mayoría de los orfebres artesanales ofrecen tobilleras
              ajustables con extensiones o cierres que permiten personalizar el largo después de la compra. Una
              tobillera bien ajustada debe quedar cómodamente alrededor del tobillo sin resbalarse hacia el pie.
            </p>
          </section>
        </FadeIn>

        {/* Sección 5: Cuidado */}
        <FadeIn delay={0.5}>
          <section id="cuidado-de-tu-tobillera" className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-6">Cuidado de tu Tobillera de Plata</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-accent pl-6">
                <h3 className="font-serif text-2xl text-text mb-3">Limpieza Regular</h3>
                <p className="text-gray-700">
                  La plata se oscurece naturalmente con el tiempo. Usa un paño de microfibra especial para plata
                  una o dos veces a la semana. Estos paños están disponibles en joyerías y restaurarán el brillo
                  sin dañar el metal.
                </p>
              </div>

              <div className="border-l-4 border-accent pl-6">
                <h3 className="font-serif text-2xl text-text mb-3">Baño de Agua Tibia</h3>
                <p className="text-gray-700">
                  Si tu tobillera está notablemente oscura, sumérgela en agua tibia con jabón suave durante
                  unos minutos. Usa un cepillo de dientes suave para limpiar delicadamente. Seca completamente
                  con un paño.
                </p>
              </div>

              <div className="border-l-4 border-accent pl-6">
                <h3 className="font-serif text-2xl text-text mb-3">Evita Químicos Fuertes</h3>
                <p className="text-gray-700">
                  Cloro, perfumes y productos de limpieza pueden dañar la plata. Quítate la tobillera antes de
                  nadar en piscinas cloradas o usar productos químicos agresivos.
                </p>
              </div>

              <div className="border-l-4 border-accent pl-6">
                <h3 className="font-serif text-2xl text-text mb-3">Almacenamiento</h3>
                <p className="text-gray-700">
                  Guarda tu tobillera en un lugar seco, preferentemente en una bolsa o caja especial. Si guardas
                  varias tobilleras juntas, coloca separadores entre ellas para evitar que se rayen.
                </p>
              </div>

              <div className="border-l-4 border-accent pl-6">
                <h3 className="font-serif text-2xl text-text mb-3">Uso Diario</h3>
                <p className="text-gray-700">
                  A diferencia de algunas joyas delicadas, las tobilleras de plata están diseñadas para uso diario.
                  De hecho, el contacto natural con la piel ayuda a mantener la plata más brillante.
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Sección 6: Tendencias */}
        <FadeIn delay={0.6}>
          <section id="tendencias-actuales" className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-6">Tendencias Actuales en Tobilleras</h2>

            <p className="text-lg text-gray-700 mb-6">
              Las tendencias en tobilleras evolucionan, pero algunos estilos permanecen atemporales:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-serif text-2xl text-accent mb-4">Minimalismo</h3>
                <p className="text-gray-700">
                  Las tobilleras delgadas y lisas siguen siendo favoritas. Un simple hilo de plata 925
                  alrededor del tobillo es sofisticado y versátil.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-accent mb-4">Piedras Naturales</h3>
                <p className="text-gray-700">
                  El cuarzo rosa, amatista y lapislázuli son opciones populares que añaden significado
                  espiritual a la joyería.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-accent mb-4">Múltiples Capas</h3>
                <p className="text-gray-700">
                  Usar dos o tres tobilleras en el mismo tobillo crea un look bohemio y artístico muy
                  en tendencia.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-accent mb-4">Diseño Unisex</h3>
                <p className="text-gray-700">
                  Las tobilleras ya no son solo para mujeres. Diseños en plata 925 gruesa son cada vez
                  más populares entre personas de todos los géneros.
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Sección de Productos */}
        <FadeIn delay={0.7}>
          <section className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-8">Nuestras Tobilleras Artesanales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="/coleccion/pulseras"
                className="inline-block bg-accent text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold"
              >
                Ver Todas las Tobilleras y Pulseras
              </a>
            </div>
          </section>
        </FadeIn>

        {/* FAQ */}
        <FadeIn delay={0.8}>
          <section id="preguntas-frecuentes" className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="border border-border rounded-lg p-6 cursor-pointer hover:bg-accent hover:bg-opacity-5 transition-colors"
                >
                  <summary className="font-serif text-xl text-text font-semibold">
                    {faq.question}
                  </summary>
                  <p className="text-gray-700 mt-4">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Internal Links */}
        <FadeIn delay={0.9}>
          <section className="bg-accent bg-opacity-10 rounded-lg p-8">
            <h2 className="font-serif text-2xl text-text mb-6">Más Guías de Joyería</h2>
            <ul className="space-y-3 text-lg">
              <li>
                <a href="/guia/plata-925-950" className="text-accent hover:underline">
                  Guía Completa: Plata 925 vs Plata 950
                </a>
              </li>
              <li>
                <a href="/guia/oro-18k-bano-oro" className="text-accent hover:underline">
                  Oro 18K vs Baño de Oro: Comparativa Detallada
                </a>
              </li>
              <li>
                <a href="/guia/cuarzo-rosa-joyeria" className="text-accent hover:underline">
                  Cuarzo Rosa en Joyería: Propiedades y Significado
                </a>
              </li>
              <li>
                <a href="/ocasion/alianzas-de-boda" className="text-accent hover:underline">
                  Alianzas de Boda Artesanales: Encuentra Tu Símbolo
                </a>
              </li>
            </ul>
          </section>
        </FadeIn>
      </main>
    </>
  );
}
