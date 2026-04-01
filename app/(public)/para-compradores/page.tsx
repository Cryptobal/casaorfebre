import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Descubre Joyería Artesanal Chilena Única | Casa Orfebre",
  description:
    "La galería digital de joyería de autor hecha a mano por orfebres chilenos independientes. Piezas únicas con certificado de autenticidad. Envío a todo Chile.",
  keywords: [
    "joyería artesanal chile",
    "joyería de autor",
    "comprar joyas artesanales online",
    "joyas únicas chile",
    "orfebres chilenos",
    "joyería hecha a mano santiago",
    "certificado de autenticidad joyería",
    "anillos artesanales chile",
    "collares artesanales chile",
    "regalo joyería mujer chile",
  ],
  openGraph: {
    title: "Descubre Joyería Artesanal Chilena Única | Casa Orfebre",
    description:
      "Piezas únicas de orfebres chilenos verificados. Certificado de autenticidad en cada compra.",
    url: "https://casaorfebre.cl/para-compradores",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Casa Orfebre",
      url: "https://casaorfebre.cl",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://casaorfebre.cl/coleccion?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Cómo sé que las joyas son realmente artesanales?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cada orfebre en Casa Orfebre pasa por un proceso de verificación. Revisamos identidad, portfolio y calidad del trabajo. Además, cada pieza vendida incluye un certificado digital de autenticidad con código QR verificable.",
          },
        },
        {
          "@type": "Question",
          name: "¿Tienen garantía las piezas?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Las piezas estándar tienen garantía de 14 días desde la entrega confirmada. Las piezas personalizadas o por encargo no admiten devolución, lo cual se indica claramente antes de la compra.",
          },
        },
        {
          "@type": "Question",
          name: "¿Hacen envíos a todo Chile?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. Los orfebres despachan a todo el territorio chileno con número de seguimiento. El plazo máximo de despacho es de 5 días hábiles desde la confirmación del pedido.",
          },
        },
      ],
    },
  ],
};

export default function ParaCompradoresPage() {
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
            Joyería de autor &middot; Hecha a mano en Chile
          </p>
          <h1 className="mt-6 font-serif text-4xl font-light leading-tight text-text sm:text-5xl">
            Joyería que cuenta historias
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-lg leading-relaxed text-text-secondary">
            Descubre piezas únicas de orfebres chilenos independientes,
            verificados y presentados con el cuidado que su oficio merece.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/coleccion"
              className="inline-block rounded-md bg-text px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-text/90"
            >
              Explorar la colección
            </Link>
            <Link
              href="/orfebres"
              className="inline-block rounded-md border border-border px-8 py-3 text-sm font-medium text-text transition-colors hover:bg-surface"
            >
              Conocer los orfebres
            </Link>
          </div>
          <p className="mt-6 text-sm text-text-tertiary">
            &#9733; Certificado de autenticidad digital en cada pieza
          </p>
        </div>
      </section>

      {/* ── POR QUÉ CASA ORFEBRE ── */}
      <section className="border-t border-border bg-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-light text-text">
              Una galería, no una tienda
            </h2>
            <p className="mt-4 text-text-secondary">
              Cada orfebre en Casa Orfebre pasó por un proceso de curación. No somos una feria abierta.
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="font-serif text-xl font-medium text-text">
                Orfebres verificados
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Proceso de curación riguroso antes de publicar. Verificamos identidad, calidad del
                trabajo y consistencia de la propuesta. Si está en Casa Orfebre, es porque cumple
                el estándar.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-text">
                Piezas irrepetibles
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Joyería de autor: ediciones limitadas o piezas únicas salidas de talleres reales.
                No encontrarás estas piezas en ningún otro lugar.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-text">
                Compra con respaldo
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Pago protegido vía Mercado Pago. Garantía de 14 días en piezas estándar.
                Certificado de autenticidad digital con código QR verificable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="border-t border-border bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            De la vitrina a tus manos
          </h2>
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Explora",
                desc: "Navega por la colección. Filtra por material, técnica, región del orfebre o precio.",
              },
              {
                step: "2",
                title: "Descubre",
                desc: "Conoce al orfebre detrás de cada pieza. Su historia, su taller, sus técnicas.",
              },
              {
                step: "3",
                title: "Compra",
                desc: "Pago seguro procesado por Mercado Pago. Confirmación inmediata por email.",
              },
              {
                step: "4",
                title: "Recibe",
                desc: "Tu pieza llega con embalaje cuidado, número de seguimiento y certificado de autenticidad digital.",
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

      {/* ── IA PARA COMPRADORES ── */}
      <section className="border-t border-border bg-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-light text-text">
              Encuentra exactamente lo que buscas, incluso si no sabes cómo describirlo
            </h2>
            <p className="mt-4 text-text-secondary">
              Casa Orfebre usa inteligencia artificial para que tu experiencia de búsqueda
              sea tan natural como una conversación.
            </p>
          </div>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {/* Feature 1: Búsqueda semántica */}
            <div className="rounded-lg border border-border bg-background p-8">
              <svg className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M8 8l1.5 1.5M14 8l-1.5 1.5M8 14l1.5-1.5M14 14l-1.5-1.5" />
              </svg>
              <h3 className="mt-4 font-serif text-lg font-medium text-text">
                Busca como hablas
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Escribe &ldquo;aro de plata para regalo de aniversario con algo verde&rdquo; y encuentra
                exactamente eso. Nuestra IA entiende contexto, intención y emoción — no solo palabras clave.
              </p>
              <div className="mt-5 rounded-md border border-border bg-surface px-4 py-3">
                <p className="text-sm text-text-tertiary">
                  ¿Qué estás buscando hoy?
                </p>
                <p className="mt-1 text-xs text-text-tertiary/70">
                  Intenta: &ldquo;collar para mi mamá que le gusta el mar&rdquo;
                </p>
              </div>
            </div>

            {/* Feature 2: Recomendaciones */}
            <div className="rounded-lg border border-border bg-background p-8">
              <svg className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 5l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L7 8.5l3.5-.5z" />
              </svg>
              <h3 className="mt-4 font-serif text-lg font-medium text-text">
                Cuanto más exploras, mejor te conocemos
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                La plataforma aprende tu estilo a medida que navegas. Favoritas, visitas,
                compras anteriores — todo construye un perfil de gusto que mejora cada recomendación.
                La pieza que no sabías que buscabas, aparece cuando toca.
              </p>
            </div>

            {/* Feature 3: Blog */}
            <div className="rounded-lg border border-border bg-background p-8">
              <svg className="h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              <h3 className="mt-4 font-serif text-lg font-medium text-text">
                Compra con criterio, no solo con el corazón
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Los propios orfebres comparten su proceso, sus materiales, sus técnicas.
                Artículos sobre cómo distinguir plata genuina, qué es la filigrana,
                cómo cuidar una piedra natural. Todo escrito desde el taller, con asistencia de IA
                para que llegue con claridad a quien lo lee.
              </p>
              <Link
                href="/blog"
                className="mt-4 inline-block text-sm font-medium text-accent transition-colors hover:text-accent-dark"
              >
                Ir al blog &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONFIANZA Y GARANTÍAS ── */}
      <section className="border-t border-border bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            Compra con respaldo real
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {[
              {
                icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                title: "Pago protegido",
                desc: "Procesado por Mercado Pago, el método más usado en Chile.",
              },
              {
                icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
                title: "Envío con seguimiento",
                desc: "A todo Chile, con número de tracking desde el despacho.",
              },
              {
                icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
                title: "Garantía 14 días",
                desc: "En piezas estándar, desde la entrega confirmada.",
              },
              {
                icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
                title: "Certificado QR",
                desc: "Cada pieza tiene un código verificable en casaorfebre.cl/verificar.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <svg className="h-6 w-6 flex-shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <div>
                  <h3 className="font-medium text-text">{item.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-text px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-light text-background">
            Empieza a descubrir
          </h2>
          <p className="mt-4 text-background/70">
            Crea tu cuenta gratis. Guarda favoritos, recibe recomendaciones
            y accede a piezas exclusivas.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/coleccion"
              className="inline-block rounded-md bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              Explorar la colección
            </Link>
            <Link
              href="/registro"
              className="inline-block rounded-md border border-background/30 px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-background/10"
            >
              Crear mi cuenta
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
