import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeIn } from '@/components/shared/fade-in';
import { Ico, ICON } from '@/components/landing/icons';
import { EcosystemGrid, PlatformMockups, MarketingChecklist, CostComparisonTable } from '@/components/landing/shared-sections';
import { PricingSection } from '../para-orfebre/pricing-section';
import { FaqAccordion } from '../para-orfebre/faq-accordion';

export const metadata: Metadata = {
  title: 'Vende tu Joyería Artesanal Online | Casa Orfebre para Orfebres',
  description:
    'Exhibe tu joyería artesanal ante todo Chile. Empieza gratis. Google Shopping, Pinterest, Instagram, blog SEO, 20 emails automáticos, certificado de autenticidad digital. El marketplace curado que tu oficio merece.',
  keywords: [
    'vender joyería artesanal Chile',
    'plataforma para orfebres',
    'marketplace joyería Chile',
    'donde vender joyas hechas a mano',
    'vender plata 950 online',
    'directorio orfebres Chile',
  ],
  alternates: { canonical: 'https://casaorfebre.cl/para-orfebres' },
  openGraph: {
    title: 'Tu taller merece una galería — Casa Orfebre',
    description:
      'Google Shopping + Pinterest + Instagram + Blog SEO + 20 emails. Empieza gratis.',
    url: 'https://casaorfebre.cl/para-orfebres',
    siteName: 'Casa Orfebre',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tu taller merece una galería — Casa Orfebre',
    description:
      'Google Shopping + Pinterest + Instagram + Blog SEO + 20 emails. Empieza gratis.',
  },
};

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const ECOSYSTEM_CHANNELS = [
  {
    icon: 'globe',
    name: 'casaorfebre.cl',
    desc: 'Tu perfil profesional con biografía, fotos del taller, historia y toda tu colección. Diseño editorial de galería de arte. Visible 24/7 a todo Chile.',
  },
  {
    icon: 'shopping',
    name: 'Google Shopping / Merchant Center',
    desc: 'Tus piezas aparecen directamente en los resultados de Google Shopping con foto, precio y link directo. Cuando alguien busca \'anillo plata artesanal Chile\', ahí estás tú.',
  },
  {
    icon: 'pin',
    name: 'Pinterest',
    desc: 'Cada pieza se publica automáticamente como Pin con foto, descripción y link de compra. Pinterest es el buscador visual #1 para joyería y tiene compradores con alta intención.',
  },
  {
    icon: 'camera',
    name: 'Instagram @casaorfebre',
    desc: 'Tu joyería se promociona en nuestra cuenta de Instagram con posts editoriales, carruseles de producto y stories. Según tu plan, hasta 4 publicaciones dedicadas al mes.',
  },
  {
    icon: 'file',
    name: 'Blog SEO',
    desc: 'Artículos editoriales optimizados para Google que posicionan palabras clave como \'joyería artesanal Chile\', \'plata 950\' y \'orfebres chilenos\'. Tráfico orgánico permanente que llega a tus piezas.',
  },
  {
    icon: 'chart',
    name: 'Google Business + Analytics',
    desc: 'Presencia en Google Business Profile para búsquedas locales. Google Analytics 4 y Google Tag Manager rastrean cada visita, cada clic, cada conversión. Datos reales de rendimiento.',
  },
];

const MARKETING_ITEMS = [
  {
    title: 'Blog con artículos SEO',
    desc: 'Contenido editorial que posiciona tus piezas en Google para búsquedas como \'joyería artesanal Chile\' y \'plata 950\'',
  },
  {
    title: 'Google Merchant Center',
    desc: 'Tus piezas aparecen en Google Shopping con foto, precio y link directo de compra',
  },
  {
    title: 'Pinterest automático',
    desc: 'Cada pieza nueva se publica como Pin optimizado para el buscador visual de joyería más grande del mundo',
  },
  {
    title: 'Instagram @casaorfebre',
    desc: 'Posts editoriales, carruseles de producto y stories promocionando tus piezas a nuestra audiencia',
  },
  {
    title: '20 emails transaccionales',
    desc: 'Desde bienvenida hasta entrega confirmada. 20 plantillas profesionales que mantienen al comprador informado y confiado',
  },
  {
    title: 'Google Analytics 4 + GTM',
    desc: 'Tracking completo de cada visita, clic y conversión. Datos reales para optimizar tu catálogo',
  },
  {
    title: 'Google Search Console',
    desc: 'Monitoreo de posicionamiento SEO. Sabemos qué buscan las personas que llegan a tus piezas',
  },
  {
    title: 'Google Business Profile',
    desc: 'Presencia local en Google Maps y búsquedas. Visibilidad para compradores que buscan joyería cerca',
  },
];

const COST_ROWS = [
  { label: 'Hosting / Plataforma', casa: '$0', tienda: '$15.000\u2013$50.000', ig: '$0', feria: '$0' },
  { label: 'Dominio + SSL', casa: '$0', tienda: '$12.000/año', ig: '$0', feria: '$0' },
  { label: 'Pasarela de pago', casa: 'Incluida', tienda: '+3.5% por venta', ig: 'Transferencia manual', feria: 'Efectivo/POS' },
  { label: 'Diseño y desarrollo web', casa: '$0', tienda: '$500k\u2013$2M', ig: '$0', feria: '$0' },
  { label: 'SEO y posicionamiento', casa: 'Incluido', tienda: '$100k\u2013$300k/mes', ig: 'No aplica', feria: 'No aplica' },
  { label: 'Marketing digital / Ads', casa: 'Incluido', tienda: '$50k\u2013$200k/mes', ig: '$30k\u2013$100k/mes', feria: '$0' },
  { label: 'Google Merchant Center', casa: 'Incluido', tienda: '$50k\u2013$100k setup', ig: 'No aplica', feria: 'No aplica' },
  { label: 'Pinterest marketing', casa: 'Incluido', tienda: 'Manual o $50k+/mes', ig: 'No aplica', feria: 'No aplica' },
  { label: 'Arriendo stand / mesa', casa: '$0', tienda: '$0', ig: '$0', feria: '$40k\u2013$200k' },
  { label: 'Transporte / logística feria', casa: '$0', tienda: '$0', ig: '$0', feria: '$20k\u2013$40k' },
  { label: 'Certificado autenticidad', casa: 'Incluido (Artesano+)', tienda: 'Manual', ig: 'No existe', feria: 'No existe' },
  { label: 'Protección anti-fraude', casa: 'Incluida', tienda: 'Propia', ig: 'Ninguna', feria: 'Ninguna' },
];

const EMAIL_GROUPS = [
  {
    title: 'Antes de la venta',
    color: 'text-accent',
    emails: [
      'Bienvenida al comprador',
      'Producto agregado a favoritos',
      'Carrito abandonado',
    ],
  },
  {
    title: 'Compra realizada',
    color: 'text-green-600',
    emails: [
      'Confirmación de pago al comprador',
      'Nueva orden al orfebre',
      'Orden confirmada por el orfebre',
      'Pieza en preparación',
      'Recordatorio de despacho al orfebre',
    ],
  },
  {
    title: 'Envío y entrega',
    color: 'text-blue-600',
    emails: [
      'Pieza despachada + tracking',
      'Actualización de tracking',
      'Confirmación de entrega',
      'Solicitud de reseña post-entrega',
    ],
  },
  {
    title: 'Post-venta y gestión',
    color: 'text-amber-600',
    emails: [
      'Gracias por tu compra (resumen)',
      'Certificado de autenticidad',
      'Pago liberado al orfebre',
      'Solicitud de devolución recibida',
      'Devolución aprobada/rechazada',
      'Reembolso procesado',
      'Disputa abierta (ambas partes)',
      'Newsletter de nuevas colecciones',
    ],
  },
];

const BENEFITS_EXPANDED = [
  { icon: 'globe', title: 'Vitrina 24/7 a todo Chile', desc: 'Tu taller duerme, pero tu vitrina nunca cierra.' },
  { icon: 'search', title: 'SEO que posiciona tus piezas', desc: 'Blog editorial + Google Merchant + Pinterest. Cuando buscan joyería artesanal, te encuentran.' },
  { icon: 'user', title: 'Perfil profesional de artesano', desc: 'Biografía, taller, técnicas, materiales. Tu portfolio digital permanente.' },
  { icon: 'qr', title: 'Certificado de autenticidad digital', desc: 'Código QR verificable en cada pieza. Tu firma digital.' },
  { icon: 'lock', title: 'Cobro seguro y automático', desc: 'Mercado Pago PCI-DSS. Tu 82%-91% directo a tu cuenta.' },
  { icon: 'shield', title: 'Anti-intermediación', desc: 'Nadie se lleva tu cliente por fuera de la plataforma.' },
  { icon: 'camera', title: 'Instagram @casaorfebre', desc: 'Hasta 4 posts mensuales dedicados a tus piezas según tu plan.' },
  { icon: 'shopping', title: 'Google Shopping', desc: 'Tus joyas con foto y precio en los resultados de Google.' },
  { icon: 'chart', title: 'Analytics en tiempo real', desc: 'Ventas, visitas, piezas más vistas. Panel profesional.' },
  { icon: 'message', title: 'Mensajería integrada', desc: 'Chat directo con compradores. Personalización, dudas, coordinación.' },
];

const HERRAMIENTAS = [
  { emoji: '\u{1F4F8}', title: 'Galería profesional', desc: 'Sube fotos de alta calidad con zoom, múltiples ángulos y descripción editorial.' },
  { emoji: '\u{1F4CA}', title: 'Dashboard de ventas', desc: 'Visualiza tus ventas, visitas, productos más vistos y tendencias de tu tienda.' },
  { emoji: '\u{1F4E6}', title: 'Gestión de pedidos', desc: 'Recibe notificaciones, confirma envíos y gestiona tus órdenes desde un solo lugar.' },
  { emoji: '\u{1F3F7}\uFE0F', title: 'Etiquetas y categorías', desc: 'Organiza tus piezas por colección, material, técnica o precio.' },
  { emoji: '\u{1F4DD}', title: 'Perfil editorial', desc: 'Cuenta tu historia con fotos de taller, biografía y filosofía de trabajo.' },
  { emoji: '\u{1F514}', title: 'Notificaciones', desc: 'Alertas instantáneas de nuevas ventas, mensajes y reviews de compradores.' },
  { emoji: '\u2B50', title: 'Reviews verificados', desc: 'Los compradores dejan reseñas reales que construyen tu reputación.' },
  { emoji: '\u{1F381}', title: 'Gift cards', desc: 'Tus clientes pueden regalar crédito canjeable en tus piezas.' },
];

const PASOS = [
  { num: '01', title: 'Postula', desc: 'Completa el formulario con tu portafolio, materiales y propuesta artística. Toma 10 minutos.' },
  { num: '02', title: 'Evaluación', desc: 'Nuestro equipo revisa tu trabajo en 48-72 horas. Buscamos calidad, autenticidad y coherencia.' },
  { num: '03', title: 'Elige tu plan', desc: 'Empieza gratis con Esencial o elige Artesano/Maestro para más beneficios.' },
  { num: '04', title: 'Sube tus piezas', desc: 'Fotografía tus creaciones, describe materiales y técnica, y publica en tu galería.' },
  { num: '05', title: 'Empieza a vender', desc: 'Tus piezas quedan visibles ante todo Chile. Nosotros nos encargamos del marketing, tú del arte.' },
];

const TESTIMONIALES = [
  { name: 'María José L.', location: 'Valparaíso', text: 'Llevaba años vendiendo solo en ferias y por Instagram. En Casa Orfebre vendí más en un mes que en tres meses de feria. Y lo mejor: no tengo que preocuparme por cobros ni disputas.' },
  { name: 'Roberto A.', location: 'Santiago', text: 'El certificado de autenticidad cambió todo. Mis clientes ahora valoran mucho más las piezas porque ven la historia detrás. Las fotos profesionales y el perfil editorial hacen una diferencia enorme.' },
  { name: 'Catalina M.', location: 'Chiloé', text: 'Vivo en Chiloé y antes me era imposible llegar a Santiago o Viña. Ahora despacho a todo Chile desde mi taller. El plan Esencial me permitió empezar sin inversión.' },
];

const FAQ_ITEMS = [
  { question: '\u00BFPuedo empezar gratis?', answer: 'Sí. El plan Esencial es 100% gratis: $0 de entrada, $0 de mensualidad, 10 productos activos. Solo pagas 18% de comisión cuando vendes.' },
  { question: '\u00BFCuándo recibo el pago de mis ventas?', answer: 'Depende de tu plan: Esencial a 14 días, Artesano a 7 días, Maestro a 48 horas post-entrega confirmada.' },
  { question: '\u00BFQuién se encarga del envío?', answer: 'El orfebre prepara y despacha. Nosotros coordinamos la logística con empresas de transporte a nivel nacional y proporcionamos seguimiento en tiempo real.' },
  { question: '\u00BFQué fotos necesito?', answer: 'Recomendamos fotos con fondo neutro, buena iluminación, múltiples ángulos y al menos una foto con escala. Ofrecemos una guía completa de fotografía al ser aceptado.' },
  { question: '\u00BFPuedo vender en otros canales al mismo tiempo?', answer: 'Sí. Casa Orfebre no exige exclusividad. Puedes seguir vendiendo en ferias, tu web personal, redes sociales y otros marketplaces.' },
  { question: '\u00BFCuánto tarda la revisión de mi postulación?', answer: 'El formulario toma ~10 minutos. Evaluamos tu postulación en 48-72 horas hábiles y te notificamos por email con el resultado.' },
  { question: '\u00BFQué pasa si un comprador quiere devolver una pieza?', answer: 'Tenemos un proceso de devolución de 30 días. Si es por defecto de fabricación, Casa Orfebre cubre el envío. Si es cambio de preferencia, el comprador cubre el retorno. Mediamos todo el proceso para que sea justo para ambas partes.' },
  { question: '\u00BFMis fotos y diseños son míos?', answer: 'Sí. Tu propiedad intelectual es tuya. Al publicar en Casa Orfebre otorgas una licencia de exhibición, no cedes derechos. Si te vas, tu contenido se elimina de la plataforma.' },
  { question: '\u00BFQuién puede postular?', answer: 'Cualquier orfebre chileno independiente con trabajo genuinamente artesanal. No aceptamos joyería industrial, revendedores ni piezas sin proceso de elaboración manual real.' },
];

const JSON_LD_WEB_PAGE = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Para Orfebres \u2014 Vende en Casa Orfebre',
  description: 'Exhibe tu joyería artesanal ante miles de compradores en todo Chile.',
  url: 'https://casaorfebre.cl/para-orfebres',
  isPartOf: { '@type': 'WebSite', name: 'Casa Orfebre', url: 'https://casaorfebre.cl' },
  provider: { '@type': 'Organization', name: 'Casa Orfebre', url: 'https://casaorfebre.cl', logo: 'https://casaorfebre.cl/logo-light.png' },
};

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
/*  PAGE                                                               */
/* ================================================================== */

export default function ParaOrfebresPage() {
  return (
    <>
      {/* JSON-LD — static constants, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_WEB_PAGE) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FAQ) }}
      />

      {/* ============================================================ */}
      {/* S1 — HERO                                                     */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-[#1A1A18] px-6 py-24 md:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(139,115,85,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139,115,85,0.06) 0%, transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #8B7355 0, #8B7355 1px, transparent 0, transparent 50%)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <span className="inline-block rounded-full border border-[#8B7355]/30 px-4 py-1.5 text-xs font-light tracking-widest text-[rgba(250,250,248,0.5)]">
              Invitación para Orfebres &middot; 2026
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="mt-8 font-serif text-5xl font-light tracking-wider text-[#FAFAF8] md:text-6xl">
              Tu taller merece
              <br />
              <span className="italic text-[#c4b49a]">una galería</span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="mx-auto mt-6 h-px w-20 bg-[#8B7355]" />
          </FadeIn>
          <FadeIn delay={300}>
            <p className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-[rgba(250,250,248,0.65)]">
              Casa Orfebre es el primer marketplace curado de joyería de autor en
              Chile. Exhibe tus creaciones ante miles de compradores que valoran
              lo hecho a mano. Empieza gratis. Solo pagas cuando vendes.
            </p>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/postular"
                className="inline-block border border-accent bg-accent px-8 py-3.5 text-sm font-light uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
              >
                Postular como orfebre
              </Link>
              <a
                href="#planes"
                className="inline-block border border-[#8B7355]/40 px-8 py-3.5 text-sm font-light uppercase tracking-widest text-[rgba(250,250,248,0.6)] transition-colors hover:border-[#8B7355] hover:text-[#FAFAF8]"
              >
                Ver planes
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S2 — MANIFIESTO                                               */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-b from-[#f5f2ed] to-[#efe9e0] px-6 py-20 md:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10" />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeIn>
            <blockquote className="font-serif text-2xl font-light italic leading-relaxed text-text md:text-3xl">
              &ldquo;Durante demasiado tiempo, orfebres extraordinarios han
              permanecido invisibles porque no tienen acceso a una vitrina
              profesional. Casa Orfebre existe para cambiar eso.&rdquo;
            </blockquote>
            <p className="mt-8 text-sm font-light tracking-widest text-accent">
              — Casa Orfebre
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S3 — QUÉ ES CASA ORFEBRE                                     */}
      {/* ============================================================ */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <p className="text-xs font-light uppercase tracking-[4px] text-accent">
              Qué es Casa Orfebre
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-snug text-text md:text-4xl">
              No es una feria. No es un marketplace genérico. Es tu galería.
            </h2>
            <div className="mt-6 h-px w-16 bg-accent" />
          </FadeIn>
          <FadeIn delay={150}>
            <p className="mt-8 text-base font-light leading-relaxed text-text-secondary">
              Casa Orfebre es una plataforma curada donde solo exhiben orfebres
              seleccionados por la calidad de su trabajo, la autenticidad de sus
              materiales y la coherencia de su propuesta. No cualquiera entra —
              y eso es exactamente lo que hace valiosa tu presencia aquí.
            </p>
          </FadeIn>
          <FadeIn delay={250}>
            <p className="mt-6 text-base font-light leading-relaxed text-text-secondary">
              Nos encargamos de todo lo que no es tu oficio: tecnología, pagos
              seguros, marketing digital, SEO, contenido editorial, y atención
              al comprador. Tú te dedicas a lo que mejor sabes hacer — crear
              piezas extraordinarias.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S3b — IA PARA ORFEBRES                                       */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* S4 — ECOSISTEMA DE VISIBILIDAD                                */}
      {/* ============================================================ */}
      <section className="border-t border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-xs font-light uppercase tracking-[4px] text-accent">
              Tu alcance
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-snug text-text md:text-4xl">
              Un ecosistema completo que trabaja por ti las 24 horas
            </h2>
            <div className="mt-6 h-px w-16 bg-accent" />
          </FadeIn>
          <FadeIn delay={100}>
            <p className="mt-8 max-w-3xl text-base font-light leading-relaxed text-text-secondary">
              Cuando publicas una pieza en Casa Orfebre, no solo aparece en
              nuestra web. Tu joyería se distribuye automáticamente a un
              ecosistema de canales que multiplica tu visibilidad sin que tengas
              que hacer nada.
            </p>
          </FadeIn>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_CHANNELS.map((ch, i) => (
              <FadeIn key={ch.name} delay={i * 80}>
                <div className="border border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-accent text-accent">
                      <Ico d={ICON[ch.icon]} />
                    </div>
                    <h3 className="font-serif text-base font-light text-text">
                      {ch.name}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
                    {ch.desc}
                  </p>
                  <span className="mt-3 inline-block text-xs font-medium text-green-600">
                    Incluido
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S5 — ASÍ SE VE TU PRESENCIA                                  */}
      {/* ============================================================ */}
      <section className="bg-[#f5f2ed] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-xs font-light uppercase tracking-[4px] text-accent">
              Tu vitrina
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-snug text-text md:text-4xl">
              Esto es lo que el comprador ve cuando te encuentra
            </h2>
            <div className="mt-6 h-px w-16 bg-accent" />
          </FadeIn>

          <PlatformMockups />
        </div>
      </section>

      {/* ============================================================ */}
      {/* S6 — MARKETING QUE HACEMOS POR TI                            */}
      {/* ============================================================ */}
      <section className="border-t border-b border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-xs font-light uppercase tracking-[4px] text-accent">
              Marketing incluido
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light text-text md:text-4xl">
              Todo esto está incluido en tu plan — no pagas extra
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {MARKETING_ITEMS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 60}>
                <div className="flex gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-text">{item.title}</h3>
                    <p className="mt-0.5 text-sm font-light leading-relaxed text-text-secondary">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S7 — PLANES Y PRECIOS                                        */}
      {/* ============================================================ */}
      <section id="planes" className="scroll-mt-20 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Planes y Precios
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Elige el plan que se ajusta a tu etapa
            </h2>
          </FadeIn>
          <div className="mt-12">
            <PricingSection />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S8 — COMPARATIVA DE COSTOS REALES                            */}
      {/* ============================================================ */}
      <section className="bg-[#1A1A18] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-[#8B7355]">
              Comparativa de costos
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-[#FAFAF8] md:text-4xl">
              ¿Cuánto te cuesta vender sin Casa Orfebre?
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-[#8B7355]/30">
                    <th className="py-3 pr-4 text-left text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">
                      Concepto
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-widest text-[#8B7355]">
                      Casa Orfebre
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">
                      Tienda propia
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">
                      Instagram
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">
                      Feria (2/mes)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8B7355]/10">
                  {COST_ROWS.map((row) => {
                    const isFree = row.casa === '$0' || row.casa.startsWith('Incluido') || row.casa.startsWith('Incluida');
                    return (
                      <tr key={row.label}>
                        <td className="py-3 pr-4 font-light text-[rgba(250,250,248,0.7)]">{row.label}</td>
                        <td className={`px-4 py-3 text-center font-light ${isFree ? 'text-[#6fcf7c]' : 'text-[rgba(250,250,248,0.8)]'}`}>{row.casa}</td>
                        <td className="px-4 py-3 text-center font-light text-[#cf6f6f]">{row.tienda}</td>
                        <td className="px-4 py-3 text-center font-light text-[#cf6f6f]">{row.ig}</td>
                        <td className="px-4 py-3 text-center font-light text-[#cf6f6f]">{row.feria}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#8B7355]/40">
                    <td className="py-5 pr-4 text-base font-medium text-[#FAFAF8]">
                      TOTAL ESTIMADO MENSUAL
                    </td>
                    <td className="px-4 py-5 text-center text-lg font-medium text-[#6fcf7c]">$0*</td>
                    <td className="px-4 py-5 text-center font-light text-[#cf6f6f]">$300k\u2013$800k</td>
                    <td className="px-4 py-5 text-center font-light text-[#cf6f6f]">$30k\u2013$100k</td>
                    <td className="px-4 py-5 text-center font-light text-[#cf6f6f]">$60k\u2013$240k</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-4 text-center text-xs font-light text-[rgba(250,250,248,0.35)]">
              *Solo 18% de comisión al vender. Sin costos fijos, sin inversión
              inicial.
            </p>
            <p className="mx-auto mt-8 max-w-2xl text-center font-serif text-xl font-light italic text-[rgba(250,250,248,0.7)]">
              Con Casa Orfebre empiezas con $0 de inversión. Solo pagas comisión
              cuando efectivamente vendes.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S9 — 20 EMAILS QUE TRABAJAN POR TI                           */}
      {/* ============================================================ */}
      <section className="bg-[#f5f2ed] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <p className="text-xs font-light uppercase tracking-[4px] text-accent">
              Comunicación automatizada
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light text-text md:text-4xl">
              20 emails profesionales que cuidan cada venta
            </h2>
            <p className="mt-6 max-w-3xl text-base font-light leading-relaxed text-text-secondary">
              Cada paso de la experiencia de compra está cubierto por emails
              transaccionales diseñados con la identidad de Casa Orfebre. El
              comprador se siente cuidado, tú te ves profesional, y todo es
              automático.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {EMAIL_GROUPS.map((group, gi) => (
              <FadeIn key={group.title} delay={gi * 100}>
                <div className="border border-border bg-surface p-6">
                  <div className="flex items-center gap-2">
                    <Ico d={ICON.mail} className={`h-5 w-5 ${group.color}`} />
                    <h3 className="font-serif text-base font-light text-text">
                      {group.title}
                    </h3>
                    <span className="ml-auto rounded-full bg-[#f0ede8] px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                      {group.emails.length}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {group.emails.map((email) => (
                      <li
                        key={email}
                        className="flex items-start gap-2 text-sm font-light text-text-secondary"
                      >
                        <svg
                          className="mt-1 h-3 w-3 shrink-0 text-accent"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        {email}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S10 — BENEFICIOS EXPANDIDOS                                   */}
      {/* ============================================================ */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Lo que ganas
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Todo incluido cuando exhibes en Casa Orfebre
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {BENEFITS_EXPANDED.map((b, i) => (
              <FadeIn key={b.title} delay={i * 60}>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent text-accent">
                    <Ico d={ICON[b.icon]} className="h-5 w-5" />
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

      {/* ============================================================ */}
      {/* S11 — HERRAMIENTAS DEL PANEL                                  */}
      {/* ============================================================ */}
      <section className="bg-[#f5f2ed] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Herramientas
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Tu panel de orfebre incluye
            </h2>
          </FadeIn>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HERRAMIENTAS.map((h, i) => (
              <FadeIn key={h.title} delay={i * 60}>
                <div className="border border-border bg-surface p-5">
                  <span className="text-2xl">{h.emoji}</span>
                  <h3 className="mt-3 font-serif text-base font-light text-text">
                    {h.title}
                  </h3>
                  <p className="mt-1 text-sm font-light leading-relaxed text-text-secondary">
                    {h.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S12 — PROCESO DE POSTULACIÓN                                  */}
      {/* ============================================================ */}
      <section id="como-funciona" className="scroll-mt-20 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Cómo Funciona
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Proceso de postulación
            </h2>
          </FadeIn>
          <div className="mt-14 space-y-0">
            {PASOS.map((p, i) => (
              <FadeIn key={p.num} delay={i * 100}>
                <div className="relative flex gap-6 pb-10">
                  {i < PASOS.length - 1 && (
                    <div className="absolute left-5 top-10 h-full w-px bg-border" />
                  )}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent text-sm font-light text-accent">
                    {p.num}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-serif text-xl font-light text-text">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S13 — (Comparison table already in S7 pricing section)        */}
      {/* ============================================================ */}

      {/* ============================================================ */}
      {/* S14 — TESTIMONIALES                                           */}
      {/* ============================================================ */}
      <section className="border-t border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Testimonios
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Lo que dicen quienes ya exhiben
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

      {/* ============================================================ */}
      {/* S15 — FAQ ACORDEÓN                                            */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-background to-[#F5F3EF] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <p className="text-center text-xs font-light uppercase tracking-[4px] text-accent">
              Preguntas Frecuentes
            </p>
            <h2 className="mt-4 text-center font-serif text-3xl font-light text-text md:text-4xl">
              Resolvemos tus dudas
            </h2>
          </FadeIn>
          <div className="mt-12">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* S16 — CTA FINAL                                               */}
      {/* ============================================================ */}
      <section className="relative bg-[#1A1A18] px-6 py-24 md:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,115,85,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl font-light leading-snug text-[#FAFAF8] md:text-4xl">
              Deja que tu trabajo hable ante todo Chile
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base font-light leading-relaxed text-[rgba(250,250,248,0.7)]">
              Empieza gratis. Google Shopping, Pinterest, Instagram, blog SEO, 20
              emails, certificado de autenticidad — todo incluido.
            </p>
            <Link
              href="/postular"
              className="mt-10 inline-block border border-accent bg-accent px-8 py-3.5 text-sm font-light uppercase tracking-widest text-white transition-colors hover:bg-accent-dark"
            >
              Postular como orfebre
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
              <Link href="/para-pionero" className="underline underline-offset-4 transition-colors hover:text-accent">
                Conoce el Programa Pioneros \u2192
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
