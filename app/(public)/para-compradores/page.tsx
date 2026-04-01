import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeIn } from '@/components/shared/fade-in';

export const metadata: Metadata = {
  title: 'Para Compradores — Casa Orfebre',
  description:
    'Descubre joyería de autor única, hecha a mano por los mejores orfebres independientes de Chile. Piezas curadas, certificadas y con compra protegida. El primer marketplace curado de joyería artesanal chilena.',
  keywords: [
    'joyería artesanal',
    'joyería de autor',
    'orfebres chilenos',
    'plata 950',
    'joyería hecha a mano',
    'comprar joyas artesanales',
    'marketplace joyería Chile',
    'joyería única',
    'regalos únicos Chile',
  ],
  alternates: {
    canonical: 'https://casaorfebre.cl/para-compradores',
  },
  openGraph: {
    title: 'Casa Orfebre — Joyería de Autor Chilena',
    description:
      'Piezas únicas de orfebres independientes. Curadas, certificadas y con compra protegida.',
    url: 'https://casaorfebre.cl/para-compradores',
    siteName: 'Casa Orfebre',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casa Orfebre — Joyería de Autor Chilena',
    description:
      'Piezas únicas de orfebres independientes. Curadas, certificadas y con compra protegida.',
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PILARES = [
  {
    num: '01',
    title: 'Curación',
    desc: 'Cada orfebre es seleccionado. Revisamos su portafolio, verificamos sus materiales, validamos su técnica. No cualquiera exhibe en Casa Orfebre — y eso es lo que protege tu compra.',
  },
  {
    num: '02',
    title: 'Autenticidad',
    desc: 'Certificado de autenticidad digital con código QR en cada pieza. Materiales declarados, técnica detallada, historia del orfebre. Sin intermediarios, sin copias, sin dudas.',
  },
  {
    num: '03',
    title: 'Conexión',
    desc: 'Detrás de cada pieza hay un nombre, un taller, una historia. Conoce al artesano que creó tu joya, entiende su proceso, descubre su inspiración. Cada compra es una relación.',
  },
  {
    num: '04',
    title: 'Confianza',
    desc: 'Pago seguro con Mercado Pago (estándar PCI-DSS), protección al comprador con retención de 14 días, mediación de disputas, y garantía de reembolso íntegro si algo falla.',
  },
];

const STATS = [
  { value: 'USD 254B', label: 'Mercado global joyería 2026' },
  { value: '+22%', label: 'Crecimiento e-commerce joyería' },
  { value: '100%', label: 'Hecho a mano en Chile' },
  { value: '14 días', label: 'Protección al comprador' },
];

const BENEFICIOS = [
  {
    title: 'Piezas únicas e irrepetibles',
    desc: 'Cada joya es una obra de autor. No encontrarás dos iguales porque cada orfebre crea desde su propia visión artística.',
  },
  {
    title: 'Orfebres verificados y curados',
    desc: 'Seleccionamos a cada artesano por la calidad de su trabajo, autenticidad de sus materiales y coherencia artística.',
  },
  {
    title: 'Certificado de autenticidad digital',
    desc: 'Código QR único en cada pieza con información del orfebre, materiales, técnica y fecha de creación.',
  },
  {
    title: 'Pago 100% seguro',
    desc: 'Procesamos pagos con Mercado Pago bajo estándar PCI-DSS. Tu información financiera está protegida.',
  },
  {
    title: 'Protección al comprador',
    desc: 'Retención del pago por 14 días hasta que confirmes la recepción. Si algo falla, reembolso íntegro.',
  },
  {
    title: 'Conoce al artesano',
    desc: 'Perfil completo de cada orfebre: su historia, su taller, su proceso creativo. Cada compra es una conexión humana.',
  },
  {
    title: 'Envío a todo Chile',
    desc: 'Despacho coordinado a todas las regiones del país con seguimiento en tiempo real.',
  },
  {
    title: 'Materiales nobles declarados',
    desc: 'Plata 950, cobre, bronce, piedras naturales — cada material es declarado y verificado por el orfebre.',
  },
  {
    title: 'Experiencia editorial premium',
    desc: 'Fotografía profesional, descripciones detalladas y narrativa de autor. No es un catálogo — es una galería.',
  },
  {
    title: 'Consumo consciente y trazable',
    desc: 'Sabes quién hizo tu joya, con qué materiales y dónde. Compra con propósito.',
  },
  {
    title: 'Regalos con significado',
    desc: 'Regala una pieza única con historia. Incluye certificado de autenticidad y tarjeta personalizable.',
  },
  {
    title: 'Soporte dedicado',
    desc: 'Atención personalizada por WhatsApp y email. Respondemos en menos de 24 horas.',
  },
];

const PASOS = [
  {
    num: '01',
    title: 'Explora',
    desc: 'Navega nuestra colección curada. Filtra por orfebre, material, técnica o precio. Descubre piezas que resuenan contigo.',
  },
  {
    num: '02',
    title: 'Conecta',
    desc: 'Conoce al artesano detrás de la pieza. Lee su historia, explora su portafolio completo, entiende su visión.',
  },
  {
    num: '03',
    title: 'Compra seguro',
    desc: 'Pago protegido con Mercado Pago. Retención de 14 días. Mediación de disputas. Garantía de reembolso.',
  },
  {
    num: '04',
    title: 'Recibe y disfruta',
    desc: 'Recibe tu pieza con certificado de autenticidad digital. Confirma la recepción y libera el pago al orfebre.',
  },
];

const GARANTIAS = [
  {
    title: 'Pagos PCI-DSS',
    desc: 'Procesamiento de pagos bajo el estándar de seguridad más exigente de la industria financiera.',
  },
  {
    title: 'Retención protectora',
    desc: 'El pago se retiene 14 días hasta que confirmes que recibiste tu pieza en perfectas condiciones.',
  },
  {
    title: 'Mediación de disputas',
    desc: 'Si algo no sale como esperabas, mediamos entre tú y el orfebre para encontrar una solución justa.',
  },
  {
    title: 'Certificado QR',
    desc: 'Cada pieza incluye un certificado digital verificable con código QR y toda la información del orfebre.',
  },
  {
    title: 'Orfebres verificados',
    desc: 'Cada artesano pasa por un proceso de selección que valida su portafolio, materiales y técnica.',
  },
  {
    title: 'Comunicación directa',
    desc: 'Canal de comunicación directo con el orfebre para consultas sobre tu pieza antes y después de la compra.',
  },
];

const COMPARATIVA = [
  {
    feature: 'Curación de artesanos',
    casa: true,
    marketplace: false,
    redes: false,
    feria: false,
  },
  {
    feature: 'Certificado de autenticidad',
    casa: true,
    marketplace: false,
    redes: false,
    feria: false,
  },
  {
    feature: 'Pago seguro PCI-DSS',
    casa: true,
    marketplace: true,
    redes: false,
    feria: false,
  },
  {
    feature: 'Retención protectora 14 días',
    casa: true,
    marketplace: false,
    redes: false,
    feria: false,
  },
  {
    feature: 'Mediación de disputas',
    casa: true,
    marketplace: true,
    redes: false,
    feria: false,
  },
  {
    feature: 'Perfil completo del artesano',
    casa: true,
    marketplace: false,
    redes: false,
    feria: true,
  },
  {
    feature: 'Experiencia editorial premium',
    casa: true,
    marketplace: false,
    redes: false,
    feria: false,
  },
  {
    feature: 'Disponibilidad 24/7',
    casa: true,
    marketplace: true,
    redes: true,
    feria: false,
  },
  {
    feature: 'Materiales declarados',
    casa: true,
    marketplace: false,
    redes: false,
    feria: false,
  },
  {
    feature: 'Trazabilidad completa',
    casa: true,
    marketplace: false,
    redes: false,
    feria: false,
  },
];

const MERCADO = [
  {
    value: 'USD 387B',
    label: 'Proyección 2034',
    desc: 'El mercado global de joyería alcanzará USD 387 mil millones en 2034, con un crecimiento sostenido del e-commerce.',
  },
  {
    value: 'Gen Z + Millennials',
    label: 'Tendencia autenticidad',
    desc: 'Las nuevas generaciones priorizan autenticidad, trazabilidad y conexión con el creador por sobre las marcas masivas.',
  },
  {
    value: 'Chile',
    label: 'Tradición orfebre',
    desc: 'Chile tiene una tradición orfebre centenaria con técnicas únicas en plata, cobre y piedras nativas como el lapislázuli.',
  },
  {
    value: 'Curación',
    label: 'Movimiento global',
    desc: 'Los marketplaces curados están reemplazando a los genéricos. El consumidor quiere selección, no exceso de opciones.',
  },
];

const TESTIMONIALES = [
  {
    name: 'Andrés M.',
    location: 'Santiago',
    text: 'Le regalé un anillo de plata 950 a mi esposa por nuestro aniversario. Llegó con un certificado de autenticidad que incluía la historia del orfebre. Ella quedó emocionada — no solo por la joya, sino por saber quién la creó.',
  },
  {
    name: 'Valentina R.',
    location: 'Valparaíso',
    text: 'La experiencia de compra es completamente diferente a cualquier tienda online. Pude ver el taller del orfebre, entender su proceso y sentir que mi compra apoyaba algo real. El sistema de pago protegido me dio total tranquilidad.',
  },
  {
    name: 'Carolina F.',
    location: 'Concepción',
    text: 'Descubrí a una orfebre increíble de Chiloé que trabaja con plata y madera nativa. Le escribí por la plataforma y me contó la inspiración detrás de cada pieza. Terminé comprando tres. Es adictivo cuando sabes la historia.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Para Compradores — Casa Orfebre',
  description:
    'Descubre joyería de autor única, hecha a mano por los mejores orfebres independientes de Chile.',
  url: 'https://casaorfebre.cl/para-compradores',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Casa Orfebre',
    url: 'https://casaorfebre.cl',
  },
  provider: {
    '@type': 'Organization',
    name: 'Casa Orfebre',
    url: 'https://casaorfebre.cl',
    logo: 'https://casaorfebre.cl/logo-light.png',
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ParaCompradoresPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        /* static constant — no user input */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* S1 — Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-[#F5F3EF] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <span className="inline-block rounded-full border border-border px-4 py-1.5 text-xs font-light tracking-widest text-text-secondary">
              Propuesta de Valor &middot; 2026
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="mt-8 font-serif text-6xl font-light tracking-wider text-text md:text-7xl">
              casa orfebre
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="mx-auto mt-6 h-px w-20 bg-accent" />
          </FadeIn>
          <FadeIn delay={300}>
            <p className="mt-6 text-sm font-light uppercase tracking-[6px] text-accent">
              JOYERÍA DE AUTOR
            </p>
          </FadeIn>
          <FadeIn delay={400}>
            <p className="mx-auto mt-8 max-w-xl text-lg font-light leading-relaxed text-text-secondary">
              El primer marketplace curado de joyería artesanal de autor en
              Chile. Piezas únicas, orfebres seleccionados, compra protegida.
            </p>
          </FadeIn>
          <FadeIn delay={500}>
            <Link
              href="/coleccion"
              className="mt-10 inline-block rounded-none border border-accent bg-accent px-8 py-3.5 text-sm font-light uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
            >
              Descubrir piezas únicas
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* S2 — Manifiesto */}
      <section className="bg-[#1A1A18] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <blockquote className="font-serif text-2xl font-light italic leading-relaxed text-[#FAFAF8] md:text-3xl">
              &ldquo;Cada joya de autor cuenta la historia de quien la creó.
              Casa Orfebre es el lugar donde esas historias encuentran a quien
              sabe valorarlas.&rdquo;
            </blockquote>
            <p className="mt-8 text-sm font-light tracking-widest text-[#8B7355]">
              — Casa Orfebre
            </p>
          </FadeIn>
        </div>
      </section>

      {/* S3 — Qué es Casa Orfebre */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <p className="text-xs font-light uppercase tracking-[4px] text-accent">
              Qué es Casa Orfebre
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-snug text-text md:text-4xl">
              Un espacio curado donde el oficio y quien lo valora se encuentran
            </h2>
            <div className="mt-6 h-px w-16 bg-accent" />
          </FadeIn>
          <FadeIn delay={150}>
            <p className="mt-8 text-base font-light leading-relaxed text-text-secondary">
              Casa Orfebre no es una tienda más. Es una galería digital donde
              cada orfebre ha sido seleccionado por la calidad de su trabajo, la
              autenticidad de sus materiales y la coherencia de su propuesta
              artística. Cada pieza que encuentras en nuestra colección ha pasado
              por un proceso de verificación que garantiza que estás comprando
              arte, no producción masiva.
            </p>
          </FadeIn>
          <FadeIn delay={250}>
            <p className="mt-6 text-base font-light leading-relaxed text-text-secondary">
              Conectamos a los mejores orfebres independientes de Chile con
              personas que buscan piezas únicas — hechas a mano, con historia y
              con un artesano de verdad detrás. No somos un e-commerce genérico.
              No somos una feria de artesanía. Somos la experiencia que la
              joyería de autor chilena merece.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* S4 — Cuatro Pilares */}
      <section className="border-t border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Nuestros Pilares
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PILARES.map((p, i) => (
              <FadeIn key={p.num} delay={i * 100}>
                <div className="border border-border p-6">
                  <span className="font-serif text-3xl font-light text-accent">
                    {p.num}
                  </span>
                  <h3 className="mt-4 font-serif text-xl font-light text-text">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
                    {p.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S5 — Stats Strip */}
      <section className="bg-[#1A1A18] px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 80}>
              <div className="text-center">
                <p className="font-serif text-3xl font-light text-[#FAFAF8] md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-2 text-xs font-light uppercase tracking-widest text-[#8B7355]">
                  {s.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* S6 — 12 Beneficios */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Beneficios
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              12 razones para elegir Casa Orfebre
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {BENEFICIOS.map((b, i) => (
              <FadeIn key={b.title} delay={i * 60}>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent text-sm font-light text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-light text-text">
                      {b.title}
                    </h3>
                    <p className="mt-1 text-sm font-light leading-relaxed text-text-secondary">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S7 — Cómo Funciona */}
      <section className="border-t border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Cómo Funciona
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-0 md:grid-cols-4">
            {PASOS.map((p, i) => (
              <FadeIn key={p.num} delay={i * 100}>
                <div
                  className={`p-6 ${i < PASOS.length - 1 ? 'md:border-r md:border-border' : ''}`}
                >
                  <span className="text-xs font-light uppercase tracking-widest text-accent">
                    Paso {p.num}
                  </span>
                  <h3 className="mt-3 font-serif text-xl font-light text-text">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
                    {p.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S7b — Inteligencia Artificial para Compradores */}
      <section className="bg-[#F5F3EF] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Inteligencia Artificial
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Encuentra exactamente lo que buscas, incluso si no sabes cómo describirlo
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base font-light text-text-secondary">
              Casa Orfebre usa inteligencia artificial para que tu experiencia de búsqueda
              sea tan natural como una conversación.
            </p>
          </FadeIn>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <FadeIn delay={100}>
              <div className="border border-border bg-surface p-6">
                <div className="mb-4 h-px w-8 bg-accent" />
                <h3 className="font-serif text-lg font-light text-text">
                  Busca como hablas
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                  Escribe &ldquo;aro de plata para regalo de aniversario con algo verde&rdquo; y encuentra
                  exactamente eso. Nuestra IA entiende contexto, intención y emoción — no solo palabras clave.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="border border-border bg-surface p-6">
                <div className="mb-4 h-px w-8 bg-accent" />
                <h3 className="font-serif text-lg font-light text-text">
                  Cuanto más exploras, mejor te conocemos
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                  La plataforma aprende tu estilo a medida que navegas. Favoritas, visitas,
                  compras anteriores — todo construye un perfil de gusto que mejora cada recomendación.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="border border-border bg-surface p-6">
                <div className="mb-4 h-px w-8 bg-accent" />
                <h3 className="font-serif text-lg font-light text-text">
                  Compra con criterio, no solo con el corazón
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                  Los propios orfebres comparten su proceso, sus materiales, sus técnicas.
                  Artículos sobre cómo distinguir plata genuina, qué es la filigrana,
                  cómo cuidar una piedra natural. Todo escrito desde el taller, con asistencia de IA.
                </p>
                <Link href="/blog" className="mt-3 inline-block text-sm font-light text-accent transition-colors hover:text-accent-dark">
                  Ir al blog &rarr;
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* S8 — Garantías de Confianza */}
      <section className="bg-gradient-to-b from-background to-[#F5F3EF] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Garantías
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Tu confianza es nuestra prioridad
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {GARANTIAS.map((g, i) => (
              <FadeIn key={g.title} delay={i * 80}>
                <div className="border border-border bg-surface p-6">
                  <div className="mb-4 h-px w-8 bg-accent" />
                  <h3 className="font-serif text-lg font-light text-text">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                    {g.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S9 — Tabla Comparativa */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Comparativa
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              ¿Por qué Casa Orfebre?
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-xs font-light uppercase tracking-widest text-text-secondary">
                      Característica
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-widest text-accent">
                      Casa Orfebre
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-text-secondary">
                      Marketplace genérico
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-text-secondary">
                      Redes sociales
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-text-secondary">
                      Feria artesanal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVA.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-border/50"
                    >
                      <td className="py-3 pr-4 font-light text-text">
                        {row.feature}
                      </td>
                      <td className="px-4 py-3 text-center text-accent">
                        {row.casa ? '\u25CF' : '\u25CB'}
                      </td>
                      <td className="px-4 py-3 text-center text-text-tertiary">
                        {row.marketplace ? '\u25CF' : '\u25CB'}
                      </td>
                      <td className="px-4 py-3 text-center text-text-tertiary">
                        {row.redes ? '\u25CF' : '\u25CB'}
                      </td>
                      <td className="px-4 py-3 text-center text-text-tertiary">
                        {row.feria ? '\u25CF' : '\u25CB'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* S10 — Contexto de Mercado */}
      <section className="bg-[#F5F3EF] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Contexto de Mercado
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {MERCADO.map((m, i) => (
              <FadeIn key={m.label} delay={i * 100}>
                <div className="border-l-2 border-accent pl-6">
                  <p className="font-serif text-3xl font-light text-text">
                    {m.value}
                  </p>
                  <p className="mt-1 text-xs font-light uppercase tracking-widest text-accent">
                    {m.label}
                  </p>
                  <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
                    {m.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S11 — Testimoniales */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Testimonios
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Lo que dicen quienes ya compraron
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {TESTIMONIALES.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="border border-border p-6">
                  <p className="text-sm font-light italic leading-relaxed text-text-secondary">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="font-serif text-base font-light text-text">
                      {t.name}
                    </p>
                    <p className="text-xs font-light text-text-tertiary">
                      {t.location}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S12 — CTA Final */}
      <section className="relative bg-[#1A1A18] px-6 py-24 md:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(139,115,85,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl font-light leading-snug text-[#FAFAF8] md:text-4xl">
              Descubre piezas que no encontrarás en otro lugar
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base font-light leading-relaxed text-[rgba(250,250,248,0.7)]">
              Joyería de autor hecha a mano por los mejores orfebres
              independientes de Chile. Curada. Certificada. Protegida.
            </p>
            <Link
              href="/coleccion"
              className="mt-10 inline-block border border-accent bg-accent px-8 py-3.5 text-sm font-light uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
            >
              Explorar Casa Orfebre
            </Link>
            <p className="mt-6 text-sm font-light text-[rgba(250,250,248,0.4)]">
              ¿Tienes preguntas?{' '}
              <a
                href="mailto:contacto@casaorfebre.cl"
                className="underline underline-offset-4 transition-colors hover:text-accent"
              >
                contacto@casaorfebre.cl
              </a>
            </p>
            <p className="mt-4 text-sm font-light text-[rgba(250,250,248,0.4)]">
              <Link href="/para-orfebres" className="underline underline-offset-4 transition-colors hover:text-accent">
                ¿Eres orfebre? Exhibe tus piezas \u2192
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
