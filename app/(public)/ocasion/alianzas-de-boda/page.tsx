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

const faqs: FAQItem[] = [
  {
    question: '¿Cuál es la diferencia entre alianza y anillo de compromiso?',
    answer:
      'La alianza es el anillo que se intercambian los novios durante la ceremonia matrimonial. Simboliza el vínculo del matrimonio y generalmente se usa en el anular izquierdo. El anillo de compromiso, en cambio, se regala antes de la boda. Algunos optan por usar ambos apilados tras la boda.',
  },
  {
    question: '¿Debo comprar alianzas de matching o pueden ser diferentes?',
    answer:
      'Las alianzas pueden ser idénticas o diferentes según el gusto de la pareja. Muchos eligen diseños que se complementan visualmente. En Casa Orfebre, creamos alianzas personalizadas que reflejan la unicidad de cada pareja, permitiendo que sean iguales o distintas según deseen.',
  },
  {
    question: '¿Cuándo debo comprar las alianzas de boda?',
    answer:
      'Se recomienda comprar las alianzas con 2-3 meses de anticipación para permitir ajustes y personalizaciones como grabados. Si requieren tamaño especial o trabajo artesanal personalizado, con más tiempo es mejor. Muchos orfebres ofertan descuentos para compras con anticipación.',
  },
  {
    question: '¿Qué materiales son populares para alianzas de boda?',
    answer:
      'El oro 18K es la opción más tradicional y duradera. La plata 925 es una alternativa artesanal hermosa y más accesible. Algunas parejas eligen combinaciones de oro y plata, o incluso elementos como madera o cuero. Lo importante es elegir un material que refleje vuestro estilo de vida.',
  },
  {
    question: '¿Puedo personalizar mis alianzas de boda?',
    answer:
      'Absolutamente. La mayoría de los orfebres artesanales ofrecen personalización mediante grabados con fechas, iniciales, o mensajes. Algunos crean diseños completamente únicos desde cero. La personalización hace que cada alianza sea un símbolo verdaderamente singular de vuestro amor.',
  },
  {
    question: '¿Es obligatorio usar alianzas en la boda?',
    answer:
      'No. El intercambio de alianzas es una tradición, pero cada pareja puede decidir si participar o no. Algunos optan por otros símbolos de compromiso. Lo importante es que refleje vuestros valores y significado personal del matrimonio.',
  },
];

interface Section {
  id: string;
  title: string;
  content: string;
}

const sections: Section[] = [
  {
    id: 'el-significado-de-las-alianzas',
    title: 'El Significado de las Alianzas de Boda',
    content: `Las alianzas de boda son mucho más que adornos de metal. Representan un compromiso eterno, la unión de dos almas
      y la promesa de amor incondicional. El círculo sin fin del anillo simboliza un viaje sin fin juntos, sin comienzo ni fin.

      Cada vez que ves tu alianza, es un recordatorio visible de ese día especial y de la promesa que hiciste. Es la joya
      más íntima que una persona puede usar, ya que permanece en el mismo dedo durante toda una vida.`,
  },
  {
    id: 'elegir-el-material-perfecto',
    title: 'Cómo Elegir el Material Perfecto',
    content: `El material de tu alianza es una decisión importante que afecta tanto la estética como la durabilidad.

      **Oro 18K**: La opción más tradicional y duradera. El oro tiene un valor que trasciende generaciones. Es resistente
      al desgaste diario y mantiene su valor con el tiempo. Un anillo de oro 18K puede durar toda una vida con poco mantenimiento.

      **Plata 925**: Una alternativa hermosa y artesanal. La plata tiene un brillo blanco natural que es elegante y moderno.
      Aunque requiere más mantenimiento que el oro, una alianza de plata 925 bien cuidada durará décadas. Es una opción
      excelente para parejas que buscan artesanía personalizada.

      **Combinaciones**: Algunos eligen combinar oro y plata, creando diseños únicos que simbolizan la unión de elementos distintos.`,
  },
  {
    id: 'tendencias-en-alianzas',
    title: 'Tendencias Actuales en Alianzas de Boda',
    content: `Las tendencias en alianzas evolucionan, pero algunos estilos permanecen atemporales.

      **Minimalismo**: Las bandas lisas y simples siguen siendo populares. Un anillo pulido sin adornos adicionales es elegante
      y atemporal. La belleza radica en la pureza del material y la precisión de la manufactura.

      **Piedras Naturales**: Algunas parejas optan por incorporar piedras como diamantes, esmeraldas o zafiros en sus alianzas.
      Las piedras añaden un elemento visual más dramático mientras mantienen la funcionalidad de uso diario.

      **Texturas y Grabados**: Las alianzas con texturas sutiles, patrones grabados o inscripciones personales son cada vez
      más comunes. Estos detalles hacen que cada anillo sea único e irrepetible.

      **Diseño Unisex**: Las alianzas artesanales modernas desafían las convenciones de género. Tanto hombres como mujeres
      eligen diseños que reflejan su personalidad individual.`,
  },
  {
    id: 'cuidado-y-mantenimiento',
    title: 'Cuidado y Mantenimiento de tu Alianza',
    content: `Tu alianza merece cuidado especial para mantener su brillo durante toda tu vida.

      **Para Alianzas de Oro**: Límpiala regularmente con agua tibia y jabón suave. Usa un cepillo de dientes suave para limpiar
      delicadamente alrededor de las grietas. Evita productos químicos agresivos y exposición a cloro.

      **Para Alianzas de Plata**: La plata se oscurece naturalmente. Usa un paño de microfibra especial para plata una o dos veces
      a la semana. Guárdala en un lugar seco cuando no la uses. Si está muy oscura, sumérgela en agua tibia con jabón suave.

      **Revisiones Profesionales**: Se recomienda llevar tu alianza a un orfebre cada año o dos para una revisión profesional.
      Pueden pulirla, verificar la durabilidad y hacer ajustes si es necesario.

      **Úsala Diariamente**: Paradójicamente, usar tu alianza todos los días ayuda a mantenerla más brillante. El contacto natural
      con tu piel evita que se oscurezca demasiado rápido.`,
  },
];

export const metadata: Metadata = {
  title: 'Alianzas de Boda Artesanales: Símbolo de tu Amor',
  description:
    'Descubre alianzas de boda artesanales de plata y oro. Guía completa sobre significado, materiales, personalización y tendencias en alianzas de boda.',
  keywords:
    'alianzas de boda, anillos de boda, alianzas artesanales, alianzas de plata, alianzas de oro, joyería de boda',
  openGraph: {
    title: 'Alianzas de Boda Artesanales: Símbolo de tu Amor',
    description:
      'Descubre alianzas de boda artesanales de plata y oro. Guía completa sobre significado, materiales, personalización y tendencias.',
    type: 'article',
    url: 'https://casaorfebre.cl/ocasion/alianzas-de-boda',
  },
  alternates: {
    canonical: 'https://casaorfebre.cl/ocasion/alianzas-de-boda',
  },
};

export const revalidate = 3600;

export default async function AlianzasDeBodaPage() {
  const allProducts = await getApprovedProducts({}).then((result) => result.slice(0, 4));

  const products = allProducts;

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Ocasiones', href: '/ocasion' },
    { label: 'Alianzas de Boda' },
  ];

  const faqJsonLd = generateFAQJsonLd(faqs);

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Breadcrumbs items={breadcrumbs} />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-text mb-6">
            Alianzas de Boda Artesanales
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl">
            Simboliza tu compromiso con alianzas de boda únicas, creadas artesanalmente en plata
            y oro. Cada anillo cuenta la historia de vuestro amor.
          </p>
        </header>

        {/* Secciones Educativas */}
        {sections.map((section, idx) => (
          <FadeIn key={section.id} delay={0.1 + idx * 0.1}>
            <section id={section.id} className="mb-16">
              <h2 className="font-serif text-4xl text-text mb-6">{section.title}</h2>
              <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                {section.content.split('\n\n').map((paragraph, pIdx) => {
                  // Handle bold text
                  const parts = paragraph.split(/\*\*(.*?)\*\*/);
                  return (
                    <p key={pIdx}>
                      {parts.map((part, i) =>
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                    </p>
                  );
                })}
              </div>
            </section>
          </FadeIn>
        ))}

        {/* Sección de Productos */}
        <FadeIn delay={0.6}>
          <section className="mb-16">
            <h2 className="font-serif text-4xl text-text mb-8">Nuestras Alianzas Artesanales</h2>
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
                href="/coleccion/boda"
                className="inline-block bg-accent text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold"
              >
                Ver Todas las Alianzas de Boda
              </a>
            </div>
          </section>
        </FadeIn>

        {/* FAQ */}
        <FadeIn delay={0.7}>
          <section className="mb-16">
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
        <FadeIn delay={0.8}>
          <section className="bg-accent bg-opacity-10 rounded-lg p-8">
            <h2 className="font-serif text-2xl text-text mb-6">Más sobre Joyería de Ocasión</h2>
            <ul className="space-y-3 text-lg">
              <li>
                <a href="/guia/oro-18k-bano-oro" className="text-accent hover:underline">
                  Oro 18K vs Baño de Oro: Comparativa Detallada
                </a>
              </li>
              <li>
                <a href="/guia/plata-925-950" className="text-accent hover:underline">
                  Guía Completa: Plata 925 vs Plata 950
                </a>
              </li>
              <li>
                <a href="/guia/tobilleras-plata" className="text-accent hover:underline">
                  Tobilleras de Plata: Guía de Estilos y Tendencias
                </a>
              </li>
              <li>
                <a href="/ocasion/anillos-matrimonio-plata" className="text-accent hover:underline">
                  Anillos de Matrimonio en Plata
                </a>
              </li>
            </ul>
          </section>
        </FadeIn>
      </main>
    </>
  );
}
