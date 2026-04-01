import { FadeIn } from '@/components/shared/fade-in';
import { Ico, ICON } from './icons';
import { MockupProfile, MockupProduct, MockupDashboard } from './mockups';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const ECOSYSTEM_CHANNELS = [
  { icon: 'globe', name: 'casaorfebre.cl', desc: 'Tu perfil profesional con biografía, fotos del taller, historia y toda tu colección. Diseño editorial de galería de arte. Visible 24/7 a todo Chile.' },
  { icon: 'shopping', name: 'Google Shopping / Merchant Center', desc: "Tus piezas aparecen directamente en los resultados de Google Shopping con foto, precio y link directo. Cuando alguien busca 'anillo plata artesanal Chile', ahí estás tú." },
  { icon: 'pin', name: 'Pinterest', desc: 'Cada pieza se publica automáticamente como Pin con foto, descripción y link de compra. Pinterest es el buscador visual #1 para joyería y tiene compradores con alta intención.' },
  { icon: 'camera', name: 'Instagram @casaorfebre', desc: 'Tu joyería se promociona en nuestra cuenta de Instagram con posts editoriales, carruseles de producto y stories. Según tu plan, hasta 4 publicaciones dedicadas al mes.' },
  { icon: 'file', name: 'Blog SEO', desc: "Artículos editoriales optimizados para Google que posicionan palabras clave como 'joyería artesanal Chile', 'plata 950' y 'orfebres chilenos'. Tráfico orgánico permanente que llega a tus piezas." },
  { icon: 'chart', name: 'Google Business + Analytics', desc: 'Presencia en Google Business Profile para búsquedas locales. Google Analytics 4 y Google Tag Manager rastrean cada visita, cada clic, cada conversión. Datos reales de rendimiento.' },
];

const MARKETING_ITEMS = [
  { title: 'Blog con artículos SEO', desc: "Contenido editorial que posiciona tus piezas en Google para búsquedas como 'joyería artesanal Chile' y 'plata 950'" },
  { title: 'Google Merchant Center', desc: 'Tus piezas aparecen en Google Shopping con foto, precio y link directo de compra' },
  { title: 'Pinterest automático', desc: 'Cada pieza nueva se publica como Pin optimizado para el buscador visual de joyería más grande del mundo' },
  { title: 'Instagram @casaorfebre', desc: 'Posts editoriales, carruseles de producto y stories promocionando tus piezas a nuestra audiencia' },
  { title: '20 emails transaccionales', desc: 'Desde bienvenida hasta entrega confirmada. 20 plantillas profesionales que mantienen al comprador informado y confiado' },
  { title: 'Google Analytics 4 + GTM', desc: 'Tracking completo de cada visita, clic y conversión. Datos reales para optimizar tu catálogo' },
  { title: 'Google Search Console', desc: 'Monitoreo de posicionamiento SEO. Sabemos qué buscan las personas que llegan a tus piezas' },
  { title: 'Google Business Profile', desc: 'Presencia local en Google Maps y búsquedas. Visibilidad para compradores que buscan joyería cerca' },
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

/* ------------------------------------------------------------------ */
/*  Ecosystem Grid Section                                             */
/* ------------------------------------------------------------------ */

export function EcosystemGrid({ footNote }: { footNote?: string }) {
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ECOSYSTEM_CHANNELS.map((ch, i) => (
          <FadeIn key={ch.name} delay={i * 80}>
            <div className="border border-border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-accent text-accent">
                  <Ico d={ICON[ch.icon]} />
                </div>
                <h3 className="font-serif text-base font-light text-text">{ch.name}</h3>
              </div>
              <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">{ch.desc}</p>
              <span className="mt-3 inline-block text-xs font-medium text-green-600">Incluido</span>
            </div>
          </FadeIn>
        ))}
      </div>
      {footNote && (
        <p className="mt-6 text-center text-sm font-light text-text-secondary">{footNote}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform Mockups Section                                           */
/* ------------------------------------------------------------------ */

export function PlatformMockups() {
  return (
    <div>
      <FadeIn delay={100}>
        <div className="mt-16 grid items-center gap-8 md:grid-cols-2">
          <MockupProfile />
          <div>
            <h3 className="font-serif text-xl font-light text-text">Tu perfil de orfebre</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
              Tu página personal de artesano. Biografía, historia, fotos del taller, técnicas que dominas, materiales que usas. Los compradores no compran solo una joya — compran tu historia. Es tu portfolio digital permanente.
            </p>
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={200}>
        <div className="mt-16 grid items-center gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h3 className="font-serif text-xl font-light text-text">La ficha de tu pieza</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
              Cada pieza tiene una ficha editorial con fotografía profesional, descripción detallada, materiales declarados, técnica, historia de la pieza y certificado de autenticidad con QR. Diseño de galería, no de tienda genérica.
            </p>
          </div>
          <div className="order-1 md:order-2"><MockupProduct /></div>
        </div>
      </FadeIn>
      <FadeIn delay={300}>
        <div className="mt-16 grid items-center gap-8 md:grid-cols-2">
          <MockupDashboard />
          <div>
            <h3 className="font-serif text-xl font-light text-text">Tu panel de control</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
              Un panel profesional donde gestionas todo: publicas piezas, organizas colecciones, respondes preguntas, confirmas envíos, y ves tus finanzas en tiempo real. Todo desde un solo lugar.
            </p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Marketing Checklist Section                                        */
/* ------------------------------------------------------------------ */

export function MarketingChecklist() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {MARKETING_ITEMS.map((item, i) => (
        <FadeIn key={item.title} delay={i * 60}>
          <div className="flex gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-text">{item.title}</h3>
              <p className="mt-0.5 text-sm font-light leading-relaxed text-text-secondary">{item.desc}</p>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cost Comparison Table                                              */
/* ------------------------------------------------------------------ */

export function CostComparisonTable({ headerNote }: { headerNote?: string }) {
  return (
    <div>
      {headerNote && (
        <FadeIn>
          <p className="mb-8 text-center font-serif text-lg font-light italic text-[rgba(250,250,248,0.7)]">{headerNote}</p>
        </FadeIn>
      )}
      <FadeIn delay={200}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-[#8B7355]/30">
                <th className="py-3 pr-4 text-left text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">Concepto</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-widest text-[#8B7355]">Casa Orfebre</th>
                <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">Tienda propia</th>
                <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">Instagram</th>
                <th className="px-4 py-3 text-center text-xs font-light uppercase tracking-widest text-[rgba(250,250,248,0.5)]">Feria (2/mes)</th>
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
                <td className="py-5 pr-4 text-base font-medium text-[#FAFAF8]">TOTAL ESTIMADO MENSUAL</td>
                <td className="px-4 py-5 text-center text-lg font-medium text-[#6fcf7c]">$0*</td>
                <td className="px-4 py-5 text-center font-light text-[#cf6f6f]">$300k\u2013$800k</td>
                <td className="px-4 py-5 text-center font-light text-[#cf6f6f]">$30k\u2013$100k</td>
                <td className="px-4 py-5 text-center font-light text-[#cf6f6f]">$60k\u2013$240k</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-4 text-center text-xs font-light text-[rgba(250,250,248,0.35)]">
          *Solo 18% de comisión al vender. Sin costos fijos, sin inversión inicial.
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-center font-serif text-xl font-light italic text-[rgba(250,250,248,0.7)]">
          Con Casa Orfebre empiezas con $0 de inversión. Solo pagas comisión cuando efectivamente vendes.
        </p>
      </FadeIn>
    </div>
  );
}
