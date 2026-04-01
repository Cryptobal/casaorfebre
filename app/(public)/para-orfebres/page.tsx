import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vende tu Joyería Artesanal Online | Casa Orfebre para Orfebres",
  description:
    "La plataforma para orfebres chilenos independientes. Vitrina profesional, herramientas con inteligencia artificial y pagos directos. Postula hoy.",
  keywords: [
    "vender joyería artesanal chile",
    "plataforma para orfebres",
    "marketplace joyería chile",
    "donde vender joyas artesanales",
    "directorio orfebres chile",
    "vender joyas online chile",
    "artesanos joyeros chilenos",
    "taller orfebrería chile",
  ],
  openGraph: {
    title: "Vende tu Joyería Artesanal Online | Casa Orfebre para Orfebres",
    description:
      "Vitrina profesional, IA para tu catálogo y pagos directos. La plataforma que tu taller merece.",
    url: "https://casaorfebre.cl/para-orfebres",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta vender en Casa Orfebre?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No hay costo de entrada ni mensualidad para comenzar. Casa Orfebre opera con un modelo de comisión por venta, diseñado para que la mayor parte de cada transacción llegue directamente al artesano.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo es el proceso de postulación?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Completas un formulario con información de tu taller, técnicas, materiales y portfolio de imágenes. Nuestro equipo revisa la postulación en un plazo de 3 a 7 días hábiles y te notifica por email con la respuesta.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo recibo los pagos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Conectas tu cuenta de Mercado Pago una sola vez. Cuando se confirma una venta, el pago se procesa automáticamente y la mayor parte llega directamente a tu cuenta, sin intermediarios innecesarios.",
      },
    },
    {
      "@type": "Question",
      name: "¿Quién puede postular?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cualquier orfebre chileno independiente con trabajo genuinamente artesanal. No aceptamos joyería industrial, revendedores ni piezas sin proceso de elaboración manual real.",
      },
    },
  ],
};

export default function ParaOrfebresPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-text-tertiary">
            Para orfebres &middot; Plataforma curada
          </p>
          <h1 className="mt-6 font-serif text-4xl font-light leading-tight text-text sm:text-5xl">
            Tu taller merece una vitrina a la altura de tu oficio
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-lg leading-relaxed text-text-secondary">
            Casa Orfebre conecta a orfebres chilenos verificados con compradores
            que realmente valoran el trabajo hecho a mano.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/postular"
              className="inline-block rounded-md bg-text px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-text/90"
            >
              Postular como orfebre
            </Link>
            <a
              href="#como-funciona"
              className="inline-block rounded-md border border-border px-8 py-3 text-sm font-medium text-text transition-colors hover:bg-surface"
            >
              Ver cómo funciona
            </a>
          </div>
          <p className="mt-6 text-sm text-text-tertiary">
            Revisamos cada postulación en 3 a 7 días hábiles.
          </p>
        </div>
      </section>

      {/* ── EL PROBLEMA ── */}
      <section className="border-t border-border bg-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            Deja de depender solo de las ferias y las redes sociales
          </h2>
          <div className="mt-16 space-y-12">
            <div>
              <h3 className="font-serif text-xl font-medium text-text">
                Tu talento, invisible
              </h3>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Orfebres extraordinarios que dependen del boca a boca y las ferias temporales.
                Tu próximo cliente ideal no sabe que existes.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-text">
                Ventas sin estructura
              </h3>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Sin sistema de pedidos, sin seguimiento, sin pagos automáticos.
                Cada venta es un proceso manual que te roba tiempo de taller.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-text">
                Sin vitrina profesional
              </h3>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Las redes sociales no están diseñadas para vender joyería de autor.
                Mereces un espacio que presente tu trabajo con la seriedad que tiene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LO QUE OBTIENES ── */}
      <section className="border-t border-border bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            Todo lo que necesitas para vender online con seriedad
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-2">
            <div>
              <h3 className="font-serif text-lg font-medium text-text">
                Panel de ventas completo
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Gestiona tus pedidos, confirma disponibilidad, actualiza estados de despacho
                y lleva el control de tu inventario desde un solo lugar.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-text">
                Pagos directos y automáticos
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                La mayor parte de cada venta llega directamente a ti. Sin esperas, sin intermediarios
                innecesarios. Conectas tu cuenta Mercado Pago una sola vez.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-text">
                Vitrina con criterio editorial
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Tu perfil, tus piezas y tu historia presentados con el mismo cuidado
                con que diseñas tu joyería. No eres un SKU más — eres un artesano con nombre.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-text">
                Compradores verificados
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Personas con cuenta real, historial de compras y disposición a pagar
                lo que el trabajo artesanal de calidad vale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── IA PARA ORFEBRES ── */}
      <section className="border-t border-border bg-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-light text-text">
              La IA trabaja para ti, no al revés
            </h2>
            <p className="mt-4 text-text-secondary">
              Más tiempo en el taller, menos tiempo frente a la pantalla.
              Casa Orfebre incorpora inteligencia artificial en cada etapa
              del proceso de publicar y vender tus piezas.
            </p>
          </div>

          <div className="mt-16 divide-y divide-border">
            {/* Feature 1 */}
            <div className="py-10">
              <h3 className="font-serif text-lg font-medium text-text">
                Completa tus fichas de producto automáticamente
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Sube las fotos de tu pieza y describe brevemente qué es. La IA analiza
                las imágenes y el contexto para sugerir nombre comercial, descripción evocadora,
                materiales utilizados, técnica de elaboración y precio de referencia de mercado.
                Tú revisas, ajustas y publicas. En minutos, no en horas.
              </p>
              <p className="mt-4 text-sm italic text-text-tertiary">
                Subiste una foto de un anillo de plata con lapislázuli.
                La IA sugiere: &ldquo;Anillo Cielo Atacama &middot; Plata 950 con lapislázuli chileno
                engastado en bisel. Técnica: engaste en frío. Precio sugerido: $48.000–$62.000&rdquo;
              </p>
            </div>

            {/* Feature 2 */}
            <div className="py-10">
              <h3 className="font-serif text-lg font-medium text-text">
                Análisis de tus imágenes antes de publicar
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Una foto mal tomada puede matar una venta. Antes de que cualquier comprador
                vea tu pieza, la IA revisa cada imagen: iluminación, fondo, nitidez del foco,
                ángulo, presencia de distracciones. Te da retroalimentación específica y accionable.
              </p>
              <p className="mt-4 text-sm italic text-text-tertiary">
                &ldquo;Imagen 2: el fondo tiene sombra fuerte en la esquina superior derecha.
                Sugiero retomar con luz difusa lateral. La textura del metal no se aprecia en el foco actual.&rdquo;
              </p>
            </div>

            {/* Feature 3 */}
            <div className="py-10">
              <h3 className="font-serif text-lg font-medium text-text">
                Coherencia en tu catálogo
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                La IA analiza tus piezas publicadas como un todo y te sugiere agrupaciones
                naturales para colecciones, qué piezas se complementan entre sí, y si hay
                inconsistencias en cómo describes materiales o técnicas en distintas fichas.
                Tu catálogo se ve como una propuesta, no como una lista.
              </p>
              <p className="mt-4 text-sm italic text-text-tertiary">
                &ldquo;Tienes 4 piezas con lapislázuli publicadas por separado.
                Te sugiero agruparlas en una colección &lsquo;Piedra Azul de Chile&rsquo; para aumentar su visibilidad.&rdquo;
              </p>
            </div>

            {/* Feature 4 */}
            <div className="py-10">
              <h3 className="font-serif text-lg font-medium text-text">
                Genera artículos para el blog de Casa Orfebre
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                El blog de Casa Orfebre es leído por compradores que quieren entender
                qué compran. Tú tienes el conocimiento — la IA te ayuda a convertirlo en un artículo
                bien escrito, con tu voz, listo para publicar directamente en la plataforma.
                Sin ser escritor. Sin perder horas redactando.
              </p>
              <p className="mt-4 text-sm italic text-text-tertiary">
                Tú escribes: &ldquo;Trabajo con técnica de granulado, que viene de los etruscos,
                y uso plata 950 reciclada de talleres de Santiago.&rdquo;
                La IA genera: Un artículo de 800 palabras sobre granulado etrusco adaptado
                al contexto de la orfebrería contemporánea chilena, listo para revisar y publicar.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="py-10">
              <h3 className="font-serif text-lg font-medium text-text">
                Precios inteligentes
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Uno de los errores más frecuentes en joyería artesanal es sub-valorar el trabajo.
                La IA analiza tus materiales declarados, el tipo de pieza, la técnica y
                el mercado actual de joyería artesanal chilena, y te sugiere un rango de precio
                justo y competitivo — para que no regales tu oficio.
              </p>
              <p className="mt-4 text-sm italic text-text-tertiary">
                &ldquo;Para este collar de plata 950 con turquesa, técnica de engaste en bisel,
                el rango de mercado en Casa Orfebre es $65.000–$95.000.
                Tu precio actual de $38.000 está por debajo del valor de los materiales más el tiempo.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA EL PROCESO ── */}
      <section id="como-funciona" className="border-t border-border bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            De la postulación a tu primera venta
          </h2>
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Postula",
                desc: "Cuéntanos sobre tu taller, comparte tu portfolio y describe tus técnicas y materiales. El formulario toma menos de 15 minutos.",
              },
              {
                step: "2",
                title: "Curación",
                desc: "Nuestro equipo revisa tu postulación. Buscamos calidad, autenticidad y consistencia en la propuesta. Respuesta en 3 a 7 días hábiles.",
              },
              {
                step: "3",
                title: "Configura tu vitrina",
                desc: "Con la ayuda de la IA, sube tus primeras piezas, completa tu perfil y conecta tu cuenta Mercado Pago para recibir pagos.",
              },
              {
                step: "4",
                title: "Recibe pedidos",
                desc: "Compradores reales llegan a tu vitrina. Confirmas disponibilidad, despachas con seguimiento y recibes el pago directamente.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border font-serif text-lg text-text-secondary">
                  {item.step}
                </span>
                <h3 className="mt-4 font-serif text-lg font-medium text-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONFIANZA PARA EL ORFEBRE ── */}
      <section className="border-t border-border bg-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              "Sin costo de entrada para empezar",
              "La mayor parte de cada venta llega directamente al artesano",
              "Soporte dedicado para orfebres: orfebres@casaorfebre.cl",
              "Comunidad de orfebres verificados (no compites con quienes no tienen tu nivel)",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4 12 14.01l-3-3" />
                </svg>
                <p className="text-sm text-text-secondary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-text px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-light text-background">
            ¿Listo para darle a tu oficio la vitrina que merece?
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/postular"
              className="inline-block rounded-md bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              Postular ahora
            </Link>
            <a
              href="mailto:orfebres@casaorfebre.cl"
              className="inline-block rounded-md border border-background/30 px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-background/10"
            >
              Tengo preguntas
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
