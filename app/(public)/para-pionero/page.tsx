import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeIn } from '@/components/shared/fade-in';
import { EcosystemGrid, PlatformMockups, CostComparisonTable, MarketingChecklist } from '@/components/landing/shared-sections';
import { PricingSection } from '../para-orfebre/pricing-section';
import { FaqAccordion } from '../para-orfebre/faq-accordion';

export const metadata: Metadata = {
  title: 'Programa Pioneros \u2014 Casa Orfebre',
  description:
    '3 meses con plan Maestro gratis: $0 de suscripci\u00f3n y 0% de comisi\u00f3n. S\u00e9 de los primeros orfebres en exhibir en el marketplace curado de joyer\u00eda de autor m\u00e1s importante de Chile. Cupos limitados.',
  keywords: [
    'programa pioneros Casa Orfebre',
    'vender joyer\u00eda gratis Chile',
    'marketplace joyer\u00eda sin comisi\u00f3n',
    'orfebres independientes Chile',
    'plataforma para orfebres gratis',
  ],
  alternates: { canonical: 'https://casaorfebre.cl/para-pionero' },
  openGraph: {
    title: '3 meses gratis \u2014 Programa Pioneros Casa Orfebre',
    description:
      'Plan Maestro + 0% comisi\u00f3n por 3 meses. Cupos limitados. Postula ahora.',
    url: 'https://casaorfebre.cl/para-pionero',
    siteName: 'Casa Orfebre',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3 meses gratis \u2014 Programa Pioneros Casa Orfebre',
    description:
      'Plan Maestro + 0% comisi\u00f3n por 3 meses. Cupos limitados. Postula ahora.',
  },
};

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const PIONEER_FEATURES = [
  'Productos ilimitados',
  'Fotos ilimitadas por pieza',
  'Video por pieza',
  'Badge "Maestro Orfebre" en tu perfil',
  'Estad\u00edsticas avanzadas',
  'Certificado de autenticidad digital con QR',
  'Destaque en la p\u00e1gina de inicio',
  'M\u00e1xima prioridad en b\u00fasqueda (2x)',
  'Soporte dedicado',
  'Pago a 48 horas de entrega confirmada',
  '4 posts en redes sociales al mes',
  'Presencia en Google Shopping / Merchant Center',
  'Publicaci\u00f3n autom\u00e1tica en Pinterest',
  'Blog SEO con tu nombre como orfebre destacado',
];

const TIMELINE_STEPS = [
  {
    num: '1',
    title: 'Postula en casaorfebre.cl/postular',
    desc: 'Llena el formulario con tus datos y portafolio. Toma menos de 5 minutos.',
  },
  {
    num: '2',
    title: 'Te enviamos tu c\u00f3digo Pionero',
    desc: 'Nuestro equipo revisa tu portafolio (5-10 d\u00edas). Si eres aprobado, recibes tu c\u00f3digo personal PIONERO-{TUNOMBRE}-2026 por email.',
  },
  {
    num: '3',
    title: 'Activa tu plan Maestro gratis',
    desc: 'Usa tu c\u00f3digo al registrarte. Se activan inmediatamente 90 d\u00edas del plan Maestro sin costo y sin comisi\u00f3n.',
  },
  {
    num: '4',
    title: 'Publica y empieza a vender',
    desc: 'Sube tus piezas, configura tu perfil, y tu galer\u00eda est\u00e1 activa. 100% de cada venta es para ti durante 3 meses.',
  },
];

const TESTIMONIALES = [
  {
    name: 'Mar\u00eda Jos\u00e9 L.',
    location: 'Valpara\u00edso',
    text: 'Llevaba a\u00f1os vendiendo solo en ferias y por Instagram. En Casa Orfebre vend\u00ed m\u00e1s en un mes que en tres meses de feria. Y lo mejor: no tengo que preocuparme por cobros ni disputas.',
  },
  {
    name: 'Roberto A.',
    location: 'Santiago',
    text: 'El certificado de autenticidad cambi\u00f3 todo. Mis clientes ahora valoran mucho m\u00e1s las piezas porque ven la historia detr\u00e1s. Las fotos profesionales y el perfil editorial hacen una diferencia enorme.',
  },
  {
    name: 'Catalina M.',
    location: 'Chilo\u00e9',
    text: 'Vivo en Chilo\u00e9 y antes me era imposible llegar a Santiago o Vi\u00f1a. Ahora despacho a todo Chile desde mi taller. El plan Esencial me permiti\u00f3 empezar sin inversi\u00f3n.',
  },
];

const FAQ_ITEMS = [
  {
    question: '\u00BFRealmente es gratis?',
    answer:
      'S\u00ed. Durante 3 meses tienes el plan Maestro completo sin pagar suscripci\u00f3n y con 0% de comisi\u00f3n. El 100% de cada venta es tuyo. No hay cargos ocultos ni compromisos.',
  },
  {
    question: '\u00BFQu\u00e9 pasa cuando terminan los 3 meses?',
    answer:
      'Eliges el plan que quieras: Esencial (gratis, 18% comisi\u00f3n), Artesano ($19.990/mes, 12%) o Maestro ($49.990/mes, 9%). Si no haces nada, tu cuenta pasa autom\u00e1ticamente al plan Esencial gratuito.',
  },
  {
    question: '\u00BFHay contratos o permanencia?',
    answer:
      'No. Cero contratos, cero permanencia. Si despu\u00e9s de 3 meses decides que Casa Orfebre no es para ti, simplemente no contin\u00faas. No te cobramos nada, no te pedimos explicaciones.',
  },
  {
    question: '\u00BFCu\u00e1ntos cupos de Pionero hay?',
    answer:
      'El programa es limitado. Los c\u00f3digos PIONERO-{NOMBRE}-2026 se asignan personalmente y tienen fecha de vencimiento (30 de junio de 2026). Cuando se acaben los cupos, se acaban.',
  },
  {
    question: '\u00BFNecesito Mercado Pago para recibir pagos?',
    answer:
      'S\u00ed. Necesitas una cuenta de Mercado Pago para conectar como m\u00e9todo de cobro. El proceso se configura desde tu panel de orfebre una vez aprobado.',
  },
  {
    question: '\u00BFQui\u00e9n se encarga del env\u00edo?',
    answer:
      'T\u00fa como orfebre. Debes embalar tu pieza con cuidado y enviarla en m\u00e1ximo 3 d\u00edas h\u00e1biles tras la confirmaci\u00f3n de la orden.',
  },
  {
    question: '\u00BFQu\u00e9 fotos necesito?',
    answer:
      'M\u00ednimo 3 por pieza: frontal, detalle y escala. Fondo neutro, luz natural, m\u00ednimo 1200\u00d71600 px. Con el plan Maestro tienes fotos ilimitadas + video.',
  },
  {
    question: '\u00BFPuedo vender en Instagram y ferias al mismo tiempo?',
    answer:
      'S\u00ed. Casa Orfebre no es exclusivo. Solo protegemos que las ventas iniciadas aqu\u00ed se completen aqu\u00ed.',
  },
];

/* static constant \u2014 no user input */
const JSON_LD_WEB_PAGE = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Programa Pioneros \u2014 Casa Orfebre',
  description:
    '3 meses con plan Maestro gratis: $0 de suscripci\u00f3n y 0% de comisi\u00f3n.',
  url: 'https://casaorfebre.cl/para-pionero',
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

/* static constant \u2014 no user input */
const JSON_LD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

/* ================================================================== */
/*  HELPERS                                                            */
/* ================================================================== */

function GoldLine() {
  return <div className="mx-auto mt-4 h-px w-20 bg-accent" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest text-accent">
      {children}
    </p>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */

export default function ParaPioneroPage() {
  return (
    <>
      {/* JSON-LD structured data — static constant, no user input */}
      <script
        type="application/ld+json"
        /* static constant — no user input */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_WEB_PAGE) }}
      />
      <script
        type="application/ld+json"
        /* static constant — no user input */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }}
      />

      {/* ============================================================ */}
      {/*  S1: HERO                                                     */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-[#1A1A18] px-6 py-28 text-center md:py-36">
        {/* Radial gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(139,115,85,0.15)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(139,115,85,0.1)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(139,115,85,0.1)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <FadeIn>
            <span className="inline-block rounded-full border border-[#8B7355]/40 px-4 py-1.5 text-xs font-medium tracking-widest text-[#8B7355]">
              {'Programa Pioneros \u00b7 Cupos limitados'}
            </span>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="mt-8 font-serif text-5xl font-light leading-tight text-[#FAFAF8] md:text-6xl">
              3 meses
              <br />
              <em className="text-[#c4b49a]">completamente gratis</em>
            </h1>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="mx-auto mt-6 h-px w-20 bg-[#8B7355]" />
          </FadeIn>

          <FadeIn delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-[rgba(250,250,248,0.7)]">
              {
                'Sé de los primeros orfebres en exhibir en Casa Orfebre. Plan Maestro completo — $0 de suscripción y 0% de comisión durante 90 días. Sin contratos, sin permanencia, sin letra chica.'
              }
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/postular"
                className="inline-block bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
              >
                Quiero ser Pionero
              </Link>
              <a
                href="#que-incluye"
                className="inline-block border border-[rgba(250,250,248,0.2)] px-8 py-3 text-sm font-light text-[rgba(250,250,248,0.7)] transition-colors hover:border-[rgba(250,250,248,0.4)]"
              >
                {'\u00BFQu\u00e9 incluye?'}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <Link
              href="/para-orfebre"
              className="mt-6 inline-block text-sm font-light text-[rgba(250,250,248,0.5)] transition-colors hover:text-[rgba(250,250,248,0.7)]"
            >
              Conoce la plataforma completa {'\u2192'}
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S2: MANIFIESTO                                               */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f2ed] to-[#efe9e0] px-6 py-24 md:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10" />
        <div className="relative mx-auto max-w-2xl text-center">
          <FadeIn>
            <blockquote className="font-serif text-2xl font-light leading-relaxed text-text md:text-3xl">
              &ldquo;Estamos construyendo la galer{'\u00eda'} digital m{'\u00e1'}s importante de joyer{'\u00eda'} de autor en Chile. Y queremos que los orfebres que la hagan posible sean recompensados por creer desde el principio.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm font-medium tracking-widest text-accent">
              {'\u2014'} Casa Orfebre
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S3: QUE ES SER PIONERO                                      */}
      {/* ============================================================ */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <SectionLabel>El programa</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
              Pionero no es un descuento. Es un reconocimiento.
            </h2>
            <GoldLine />
          </FadeIn>
          <FadeIn delay={100}>
            <p className="mt-8 text-base font-light leading-relaxed text-text-secondary">
              Los Orfebres Pioneros son los primeros artesanos que conf{'\u00edan'} en Casa Orfebre. A cambio, les damos acceso completo al plan m{'\u00e1'}s alto de la plataforma {'\u2014'} Maestro {'\u2014'} durante 3 meses, sin costo de suscripci{'\u00f3'}n y con 0% de comisi{'\u00f3'}n en cada venta. Es nuestra forma de decir: gracias por construir esto con nosotros.
            </p>
          </FadeIn>
          <FadeIn delay={150}>
            <p className="mt-6 text-base font-light leading-relaxed text-text-secondary">
              Despu{'\u00e9'}s de los 3 meses, eliges libremente el plan que mejor se adapte a tu momento: Esencial (gratis), Artesano ($19.990/mes) o Maestro ($49.990/mes). Sin presi{'\u00f3'}n, sin contratos. Si en 3 meses decides que Casa Orfebre no es para ti, te vas sin haber pagado un peso.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S4: LO QUE RECIBES                                          */}
      {/* ============================================================ */}
      <section id="que-incluye" className="bg-background px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center">
              <SectionLabel>Beneficio Pionero</SectionLabel>
              <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
                Todo esto durante 3 meses. Gratis.
              </h2>
            </div>
          </FadeIn>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {/* Dark card */}
            <FadeIn delay={100}>
              <div className="flex flex-col items-center border border-[#8B7355] bg-[#1A1A18] p-8 text-center">
                <p className="text-xs font-medium uppercase tracking-widest text-[#8B7355]">
                  PLAN MAESTRO
                </p>
                <p className="mt-4 font-serif text-5xl font-light text-[#c4b49a]">
                  $0
                </p>
                <p className="mt-1 text-sm text-[rgba(250,250,248,0.5)]">
                  /mes durante 3 meses
                </p>
                <p className="mt-4 text-lg text-[#FAFAF8]">
                  0% comisi{'\u00f3'}n por venta
                </p>
                <p className="mt-2 text-sm text-[rgba(250,250,248,0.3)] line-through">
                  Valor normal: $49.990/mes + 9% comisi{'\u00f3'}n
                </p>
                <span className="mt-4 inline-block rounded-full bg-[#8B7355] px-3 py-1 text-xs font-medium text-white">
                  GRATIS 3 MESES
                </span>
              </div>
            </FadeIn>

            {/* Features list */}
            <FadeIn delay={200}>
              <ul className="space-y-3">
                {PIONEER_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-text-secondary"
                  >
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S5: ECOSISTEMA                                               */}
      {/* ============================================================ */}
      <section className="border-t border-border px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <SectionLabel>Tu alcance</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
              Un ecosistema completo que trabaja por ti las 24 horas
            </h2>
            <GoldLine />
            <p className="mt-6 text-base font-light leading-relaxed text-text-secondary">
              Casa Orfebre no es solo un marketplace. Es un ecosistema de canales de venta, marketing y posicionamiento que funciona autom{'\u00e1'}ticamente mientras t{'\u00fa'} te concentras en crear.
            </p>
          </FadeIn>
          <div className="mt-12">
            <EcosystemGrid footNote={`Todo esto incluido en tu per\u00edodo Pionero \u2014 sin costo adicional.`} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S6: MOCKUPS                                                  */}
      {/* ============================================================ */}
      <section className="bg-[#f5f2ed] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <SectionLabel>Tu vitrina</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
              Esto es lo que el comprador ve cuando te encuentra
            </h2>
            <GoldLine />
          </FadeIn>
          <PlatformMockups />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S7: DESPUES DE LOS 3 MESES                                  */}
      {/* ============================================================ */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center">
              <SectionLabel>Despu{'\u00e9'}s del per{'\u00ed'}odo Pionero</SectionLabel>
              <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
                T{'\u00fa'} decides c{'\u00f3'}mo seguir
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-text-secondary">
                Cuando terminen tus 3 meses gratuitos, eliges el plan que quieras. Sin sorpresas, sin renovaciones autom{'\u00e1'}ticas. Estas son tus opciones:
              </p>
            </div>
          </FadeIn>
          <div className="mt-12">
            <PricingSection />
          </div>
          <FadeIn delay={100}>
            <p className="mx-auto mt-10 max-w-2xl text-center text-sm font-light leading-relaxed text-text-secondary">
              Si decides no continuar, tu cuenta simplemente pasa al plan Esencial gratuito. Tus piezas publicadas se mantienen (hasta 10), tu perfil sigue activo. No pierdes nada.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S8: COST COMPARISON                                          */}
      {/* ============================================================ */}
      <section className="bg-[#1A1A18] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <h2 className="text-center font-serif text-3xl font-light text-[#FAFAF8] md:text-4xl">
              {'\u00BF'}Cu{'\u00e1'}nto cuesta vender joyer{'\u00ed'}a hoy?
            </h2>
          </FadeIn>
          <div className="mt-12">
            <CostComparisonTable headerNote={`Como Pionero, tu costo total durante 3 meses es literalmente $0. Cero. Despu\u00e9s, si sigues con Esencial, sigue siendo $0.`} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S9: MARKETING                                                */}
      {/* ============================================================ */}
      <section className="border-t border-b border-border px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <SectionLabel>Marketing incluido</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
              Todo esto est{'\u00e1'} incluido en tu plan {'\u2014'} no pagas extra
            </h2>
            <GoldLine />
          </FadeIn>
          <div className="mt-12">
            <MarketingChecklist />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S10: PROCESO PIONERO                                         */}
      {/* ============================================================ */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="text-center">
              <SectionLabel>C{'\u00f3'}mo funciona</SectionLabel>
              <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
                De tu DM a tu galer{'\u00ed'}a en 4 pasos
              </h2>
            </div>
          </FadeIn>

          <div className="relative mt-16">
            {/* Connecting line */}
            <div className="absolute left-5 top-0 h-full w-px bg-border md:left-6" />

            <div className="space-y-12">
              {TIMELINE_STEPS.map((step, i) => (
                <FadeIn key={step.num} delay={i * 100}>
                  <div className="relative flex gap-6">
                    {/* Number circle */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent bg-background font-serif text-lg font-light text-accent md:h-12 md:w-12">
                      {step.num}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-serif text-lg font-light text-text">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm font-light leading-relaxed text-text-secondary">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S11: TESTIMONIALES                                           */}
      {/* ============================================================ */}
      <section className="border-t border-border px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="text-center">
              <SectionLabel>Lo que dicen los orfebres</SectionLabel>
              <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
                Historias reales
              </h2>
            </div>
          </FadeIn>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {TESTIMONIALES.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="border border-border p-6">
                  <p className="text-sm font-light leading-relaxed text-text-secondary">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="font-serif text-base font-light text-text">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-tertiary">{t.location}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S12: FAQ PIONEROS                                            */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-background to-[#F5F3EF] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="text-center">
              <SectionLabel>Preguntas frecuentes</SectionLabel>
              <h2 className="mt-3 font-serif text-3xl font-light text-text md:text-4xl">
                Todo lo que necesitas saber
              </h2>
            </div>
          </FadeIn>
          <div className="mt-12">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S13: URGENCIA                                                */}
      {/* ============================================================ */}
      <section className="border-t border-b border-border bg-surface px-6 py-20 text-center md:py-24">
        <div className="mx-auto max-w-2xl">
          <FadeIn>
            <p className="font-serif text-2xl font-light text-text">
              El programa Pioneros tiene cupos limitados
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Los c{'\u00f3'}digos vencen el 30 de junio de 2026
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary">
              Los orfebres que postulen ahora ser{'\u00e1'}n los primeros en exhibir cuando la plataforma escale a nivel nacional.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  S14: CTA FINAL                                               */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-[#1A1A18] px-6 py-24 text-center md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,115,85,0.12)_0%,transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-widest text-[#8B7355]">
              Tu momento es ahora
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light text-[#FAFAF8] md:text-4xl">
              3 meses gratis para los que creen primero
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-[rgba(250,250,248,0.7)]">
              Plan Maestro completo. $0 de suscripci{'\u00f3'}n. 0% de comisi{'\u00f3'}n. Google Shopping, Pinterest, Instagram, blog SEO, 20 emails, certificado de autenticidad. Todo incluido.
            </p>
            <div className="mt-10">
              <Link
                href="/postular"
                className="inline-block bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
              >
                Quiero ser Pionero
              </Link>
            </div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <a
                href="mailto:contacto@casaorfebre.cl"
                className="text-sm font-light text-[rgba(250,250,248,0.5)] transition-colors hover:text-[rgba(250,250,248,0.7)]"
              >
                {'\u00BF'}Dudas? contacto@casaorfebre.cl
              </a>
              <Link
                href="/para-comprador"
                className="text-sm font-light text-[rgba(250,250,248,0.5)] transition-colors hover:text-[rgba(250,250,248,0.7)]"
              >
                Conoce la experiencia del comprador {'\u2192'}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
