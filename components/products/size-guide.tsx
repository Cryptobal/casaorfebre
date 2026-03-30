"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type SizeCategory = "anillo" | "aros" | "collar" | "pulsera" | "colgante";

interface SizeGuideProps {
  categorySlugs: string[];
  tallas: string[];
  guiaTallas?: string | null;
  largoCadenaCm?: number | null;
  diametroMm?: number | null;
}

/* ─── Ring size conversion data ─── */
const RING_SIZES = [
  { us: "4",  eu: "46.8", uk: "H",   diameter: 14.9, circ: 46.8 },
  { us: "5",  eu: "49.3", uk: "J½",  diameter: 15.7, circ: 49.3 },
  { us: "6",  eu: "51.8", uk: "L½",  diameter: 16.5, circ: 51.8 },
  { us: "7",  eu: "54.4", uk: "N½",  diameter: 17.3, circ: 54.4 },
  { us: "8",  eu: "56.9", uk: "P½",  diameter: 18.1, circ: 56.9 },
  { us: "9",  eu: "59.5", uk: "R½",  diameter: 18.9, circ: 59.5 },
  { us: "10", eu: "62.1", uk: "T½",  diameter: 19.8, circ: 62.1 },
  { us: "11", eu: "64.6", uk: "V½",  diameter: 20.6, circ: 64.6 },
  { us: "12", eu: "67.2", uk: "X½",  diameter: 21.4, circ: 67.2 },
  { us: "13", eu: "69.7", uk: "Z",   diameter: 22.2, circ: 69.7 },
];

const NECKLACE_LENGTHS = [
  { range: "35–38 cm", name: "Gargantilla / Choker", y: 28 },
  { range: "40–43 cm", name: "Princess", y: 42, popular: true },
  { range: "45–50 cm", name: "Matinée", y: 58 },
  { range: "55–60 cm", name: "Opera", y: 76 },
  { range: "70+ cm",   name: "Rope / Sautoir", y: 96 },
];

const BRACELET_SIZES = [
  { label: "XS", range: "14–15 cm" },
  { label: "S",  range: "15–16 cm" },
  { label: "M",  range: "16–17 cm" },
  { label: "L",  range: "17–18 cm" },
  { label: "XL", range: "18–19 cm" },
];

const EARRING_SIZES = [
  { range: "8–10 mm",  name: "Mini studs", ref: "tamano de una lenteja", d: 9 },
  { range: "12–15 mm", name: "Studs clasicos", ref: "tamano de moneda $10", d: 13.5 },
  { range: "20–25 mm", name: "Argollas medianas", ref: "tamano de moneda $100", d: 22.5 },
  { range: "30–40 mm", name: "Argollas grandes", ref: "", d: 35 },
  { range: "50+ mm",   name: "Statement", ref: "", d: 50 },
];

const CATEGORY_TITLES: Partial<Record<SizeCategory, string>> = {
  anillo: "Anillos",
  aros: "Aros",
  collar: "Collares",
  pulsera: "Pulseras",
  colgante: "Collares y Colgantes",
};

/* ─── Main Component ─── */

/** Pick the best size-guide category from the product's category slugs */
function resolveSizeCategory(slugs: string[]): SizeCategory | null {
  const priority: SizeCategory[] = ["anillo", "collar", "colgante", "pulsera", "aros"];
  for (const p of priority) {
    if (slugs.includes(p)) return p;
  }
  return null;
}

export function SizeGuide({ categorySlugs, tallas, guiaTallas, largoCadenaCm, diametroMm }: SizeGuideProps) {
  const [open, setOpen] = useState(false);

  const sizeCategory = resolveSizeCategory(categorySlugs);
  const showButton = tallas.length > 0 || sizeCategory !== null;

  if (!showButton) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-dark transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
          <path d="m14.5 12.5 2-2" />
          <path d="m11.5 9.5 2-2" />
          <path d="m8.5 6.5 2-2" />
          <path d="m17.5 15.5 2-2" />
        </svg>
        Guia de tallas
      </button>

      {open && sizeCategory && (
        <SizeGuideModal
          sizeCategory={sizeCategory}
          tallas={tallas}
          guiaTallas={guiaTallas}
          largoCadenaCm={largoCadenaCm}
          diametroMm={diametroMm}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* ─── Modal ─── */

interface SizeGuideModalProps {
  sizeCategory: SizeCategory;
  tallas: string[];
  guiaTallas?: string | null;
  largoCadenaCm?: number | null;
  diametroMm?: number | null;
  onClose: () => void;
}

function SizeGuideModal({
  sizeCategory,
  tallas,
  guiaTallas,
  largoCadenaCm,
  diametroMm,
  onClose,
}: SizeGuideModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const animateClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") animateClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [animateClose]);

  const tabs = getTabs(sizeCategory);
  const title = CATEGORY_TITLES[sizeCategory] || "Productos";

  const content = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={animateClose} />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full sm:max-w-[600px] max-h-[90vh] sm:max-h-[80vh] bg-surface rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col transition-transform duration-200",
          isVisible ? "translate-y-0 sm:scale-100" : "translate-y-full sm:translate-y-0 sm:scale-95"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0">
          <h2 className="font-serif text-lg">
            Guia de tallas &mdash; {title}
          </h2>
          <button
            type="button"
            onClick={animateClose}
            className="rounded-full p-1.5 text-text-tertiary hover:text-text hover:bg-background transition-colors"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex border-b border-border px-5 flex-shrink-0">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-3 py-2.5 text-sm transition-colors border-b-2 -mb-px",
                  activeTab === i
                    ? "border-accent text-accent font-medium"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {renderCategoryContent(sizeCategory, tallas, largoCadenaCm, diametroMm, activeTab)}

          {/* Artisan note */}
          {guiaTallas && (
            <div className="mt-6 rounded-lg bg-accent/5 border border-accent/15 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" /><path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" /><path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                </svg>
                <span className="text-sm font-medium text-accent">Nota del orfebre</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {guiaTallas}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

/* ─── Tab structure per category ─── */

function getTabs(category: SizeCategory): { label: string }[] {
  switch (category) {
    case "anillo":
      return [
        { label: "Tabla de tallas" },
        { label: "Como medir" },
      ];
    case "collar":
    case "colgante":
      return [{ label: "Largos de cadena" }];
    case "pulsera":
      return [{ label: "Tallas" }, { label: "Como medir" }];
    case "aros":
      return [{ label: "Referencia de tamanos" }];
    default:
      return [{ label: "Referencia" }];
  }
}

/* ─── Category-specific content ─── */

function renderCategoryContent(
  category: SizeCategory,
  tallas: string[],
  largoCadenaCm?: number | null,
  diametroMm?: number | null,
  activeTab = 0,
) {
  switch (category) {
    case "anillo":
      return activeTab === 0
        ? <RingSizeTable tallas={tallas} />
        : <RingMeasureMethods />;
    case "collar":
    case "colgante":
      return <NecklaceDiagram largoCadenaCm={largoCadenaCm} />;
    case "pulsera":
      return activeTab === 0
        ? <BraceletSizeTable tallas={tallas} />
        : <BraceletMeasureMethod />;
    case "aros":
      return <EarringSizeReference diametroMm={diametroMm} />;
    default:
      return (
        <p className="text-sm text-text-secondary">
          Consulta directamente con el orfebre para guia de tallas de este producto.
        </p>
      );
  }
}

/* ═══════════════════════════════════════
   ANILLOS
   ═══════════════════════════════════════ */

function RingSizeTable({ tallas }: { tallas: string[] }) {
  const tallasNorm = tallas.map((t) => t.trim().toLowerCase());

  return (
    <div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 px-2 font-medium text-text-tertiary text-xs uppercase tracking-wider">US</th>
              <th className="py-2 px-2 font-medium text-text-tertiary text-xs uppercase tracking-wider">EU</th>
              <th className="py-2 px-2 font-medium text-text-tertiary text-xs uppercase tracking-wider">UK</th>
              <th className="py-2 px-2 font-medium text-text-tertiary text-xs uppercase tracking-wider">Diametro</th>
              <th className="py-2 px-2 font-medium text-text-tertiary text-xs uppercase tracking-wider">Circ.</th>
            </tr>
          </thead>
          <tbody>
            {RING_SIZES.map((row) => {
              const isHighlighted = tallasNorm.some(
                (t) => t === row.us || t === `us ${row.us}` || t === `${row.us} us` || t === row.eu || t === row.uk.toLowerCase()
              );
              return (
                <tr
                  key={row.us}
                  className={cn(
                    "border-b border-border/50 last:border-0",
                    isHighlighted && "bg-accent/8"
                  )}
                >
                  <td className={cn("py-2 px-2", isHighlighted && "font-medium text-accent")}>{row.us}</td>
                  <td className="py-2 px-2 text-text-secondary">{row.eu}</td>
                  <td className="py-2 px-2 text-text-secondary">{row.uk}</td>
                  <td className="py-2 px-2 text-text-secondary">{row.diameter} mm</td>
                  <td className="py-2 px-2 text-text-secondary">{row.circ} mm</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {tallas.length > 0 && (
        <p className="mt-3 text-xs text-accent">
          Las filas destacadas corresponden a las tallas disponibles de esta pieza.
        </p>
      )}
    </div>
  );
}

function RingMeasureMethods() {
  return (
    <div className="space-y-8">
      {/* Method 1 — Thread */}
      <div>
        <h3 className="text-sm font-medium text-text mb-2">Metodo 1 &mdash; Con hilo</h3>
        <p className="text-sm text-text-secondary mb-4">
          Envuelve un hilo alrededor de tu dedo. Marca donde se encuentra.
          Mide el largo en mm y busca tu talla en la tabla.
        </p>
        <svg viewBox="0 0 200 100" className="w-full max-w-[240px] mx-auto" aria-label="Diagrama: medir con hilo">
          {/* Finger */}
          <rect x="60" y="15" width="32" height="70" rx="16" fill="#FAFAF8" stroke="#1a1a18" strokeWidth="1.5" />
          {/* Thread wraps */}
          <ellipse cx="76" cy="50" rx="18" ry="6" fill="none" stroke="#8B7355" strokeWidth="2" strokeDasharray="4 2" />
          <ellipse cx="76" cy="58" rx="18" ry="6" fill="none" stroke="#8B7355" strokeWidth="2" strokeDasharray="4 2" />
          {/* Measure line */}
          <line x1="120" y1="40" x2="180" y2="40" stroke="#8B7355" strokeWidth="1.5" />
          <line x1="120" y1="36" x2="120" y2="44" stroke="#8B7355" strokeWidth="1.5" />
          <line x1="180" y1="36" x2="180" y2="44" stroke="#8B7355" strokeWidth="1.5" />
          <text x="150" y="56" textAnchor="middle" fontSize="10" fill="#8B7355">mm</text>
        </svg>
      </div>

      {/* Method 2 — Existing ring */}
      <div>
        <h3 className="text-sm font-medium text-text mb-2">Metodo 2 &mdash; Con un anillo que ya tengas</h3>
        <p className="text-sm text-text-secondary mb-4">
          Coloca un anillo que te quede bien sobre los circulos
          de abajo hasta encontrar el que coincida.
        </p>
        <div className="bg-background rounded-lg p-4">
          <svg viewBox="0 0 320 80" className="w-full" aria-label="Circulos de referencia para medir anillos">
            {[14.9, 16.5, 18.1, 19.8, 21.4].map((d, i) => {
              const scale = 1.8;
              const r = (d / 2) * scale;
              const cx = 30 + i * 70;
              const sizes = ["4", "6", "8", "10", "12"];
              return (
                <g key={d}>
                  <circle cx={cx} cy={40} r={r} fill="none" stroke="#1a1a18" strokeWidth="1" />
                  <text x={cx} y={40 + r + 14} textAnchor="middle" fontSize="9" fill="#8B7355">
                    US {sizes[i]}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-text-tertiary text-center mt-2">
            Para medicion precisa, asegurate de que tu pantalla este al 100% de zoom.
          </p>
        </div>
      </div>

      {/* Method 3 — Coin */}
      <div>
        <h3 className="text-sm font-medium text-text mb-2">Metodo 3 &mdash; Comparar con moneda</h3>
        <p className="text-sm text-text-secondary mb-4">
          Una moneda de $100 CLP tiene ~23 mm de diametro (aprox. talla 13 US).
          Una moneda de $500 CLP tiene ~26 mm.
        </p>
        <svg viewBox="0 0 200 90" className="w-full max-w-[260px] mx-auto" aria-label="Referencia con monedas chilenas">
          {/* $100 coin */}
          <circle cx="55" cy="45" r="21" fill="#FAFAF8" stroke="#1a1a18" strokeWidth="1.5" />
          <text x="55" y="48" textAnchor="middle" fontSize="10" fill="#1a1a18">$100</text>
          <text x="55" y="78" textAnchor="middle" fontSize="9" fill="#8B7355">23 mm</text>
          {/* $500 coin */}
          <circle cx="140" cy="45" r="24" fill="#FAFAF8" stroke="#1a1a18" strokeWidth="1.5" />
          <text x="140" y="48" textAnchor="middle" fontSize="10" fill="#1a1a18">$500</text>
          <text x="140" y="78" textAnchor="middle" fontSize="9" fill="#8B7355">26 mm</text>
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COLLARES / COLGANTES
   ═══════════════════════════════════════ */

function NecklaceDiagram({ largoCadenaCm }: { largoCadenaCm?: number | null }) {
  // Find which length range the product falls in
  function isProductLength(item: typeof NECKLACE_LENGTHS[number]) {
    if (!largoCadenaCm) return false;
    const parts = item.range.replace("+", "–999").split("–").map((s) => parseInt(s));
    return largoCadenaCm >= (parts[0] ?? 0) && largoCadenaCm <= (parts[1] ?? 999);
  }

  return (
    <div>
      <div className="flex gap-6 items-start">
        {/* Silhouette SVG */}
        <svg viewBox="0 0 120 180" className="w-28 sm:w-36 flex-shrink-0" aria-label="Diagrama de largos de collar">
          {/* Head */}
          <ellipse cx="60" cy="16" rx="14" ry="16" fill="#FAFAF8" stroke="#1a1a18" strokeWidth="1.2" />
          {/* Neck */}
          <rect x="50" y="30" width="20" height="14" fill="#FAFAF8" stroke="none" />
          <line x1="50" y1="30" x2="50" y2="44" stroke="#1a1a18" strokeWidth="1.2" />
          <line x1="70" y1="30" x2="70" y2="44" stroke="#1a1a18" strokeWidth="1.2" />
          {/* Shoulders */}
          <path d="M50 44 Q48 46 20 56 L20 160 L100 160 L100 56 Q72 46 70 44" fill="#FAFAF8" stroke="#1a1a18" strokeWidth="1.2" />

          {/* Necklace length lines */}
          {NECKLACE_LENGTHS.map((item) => {
            const highlighted = isProductLength(item);
            const color = highlighted ? "#8B7355" : "#1a1a18";
            const sw = highlighted ? 2 : 0.8;
            const opacity = highlighted ? 1 : 0.35;
            return (
              <g key={item.range} opacity={opacity}>
                <line x1="25" y1={item.y} x2="95" y2={item.y} stroke={color} strokeWidth={sw} strokeDasharray={highlighted ? "none" : "3 2"} />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 pt-1">
          {NECKLACE_LENGTHS.map((item) => {
            const highlighted = isProductLength(item);
            return (
              <div
                key={item.range}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  highlighted ? "bg-accent/10 border border-accent/20" : ""
                )}
              >
                <span className={cn("font-medium", highlighted ? "text-accent" : "text-text")}>
                  {item.range}
                </span>
                <span className="text-text-secondary"> &mdash; {item.name}</span>
                {item.popular && !highlighted && (
                  <span className="ml-1 text-xs text-accent">Mas popular</span>
                )}
                {highlighted && largoCadenaCm && (
                  <p className="text-xs text-accent mt-0.5">
                    Esta pieza mide {largoCadenaCm} cm
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 text-xs text-text-tertiary bg-background rounded-md px-3 py-2">
        No estas segura? El largo mas vendido es 42 cm. Queda justo debajo de la clavicula.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════
   PULSERAS
   ═══════════════════════════════════════ */

function BraceletSizeTable({ tallas }: { tallas: string[] }) {
  const tallasNorm = tallas.map((t) => t.trim().toLowerCase());

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 px-2 font-medium text-text-tertiary text-xs uppercase tracking-wider">Talla</th>
            <th className="py-2 px-2 font-medium text-text-tertiary text-xs uppercase tracking-wider">Circunferencia muneca</th>
          </tr>
        </thead>
        <tbody>
          {BRACELET_SIZES.map((row) => {
            const isHighlighted = tallasNorm.includes(row.label.toLowerCase());
            return (
              <tr
                key={row.label}
                className={cn(
                  "border-b border-border/50 last:border-0",
                  isHighlighted && "bg-accent/8"
                )}
              >
                <td className={cn("py-2 px-2", isHighlighted && "font-medium text-accent")}>{row.label}</td>
                <td className="py-2 px-2 text-text-secondary">{row.range}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tallas.length > 0 && (
        <p className="mt-3 text-xs text-accent">
          Las filas destacadas corresponden a las tallas disponibles de esta pieza.
        </p>
      )}
    </div>
  );
}

function BraceletMeasureMethod() {
  return (
    <div>
      <p className="text-sm text-text-secondary mb-4">
        Mide tu muneca con un hilo o cinta metrica justo encima del hueso.
        Suma 1–2 cm para holgura comoda.
      </p>
      <svg viewBox="0 0 220 100" className="w-full max-w-[280px] mx-auto" aria-label="Diagrama: medir muneca">
        {/* Wrist */}
        <ellipse cx="90" cy="50" rx="35" ry="25" fill="#FAFAF8" stroke="#1a1a18" strokeWidth="1.5" />
        {/* Hand suggestion */}
        <path d="M55 40 Q40 30 35 25" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
        <path d="M55 60 Q45 70 40 75" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
        {/* Tape measure */}
        <ellipse cx="90" cy="50" rx="40" ry="30" fill="none" stroke="#8B7355" strokeWidth="2.5" strokeDasharray="6 3" />
        {/* Measure indicator */}
        <line x1="145" y1="50" x2="190" y2="50" stroke="#8B7355" strokeWidth="1.5" />
        <text x="195" y="53" fontSize="10" fill="#8B7355">cm</text>
        {/* Bone indicator */}
        <circle cx="90" cy="77" r="3" fill="none" stroke="#1a1a18" strokeWidth="1" strokeDasharray="2 1" />
        <text x="90" y="96" textAnchor="middle" fontSize="8" fill="#9e9a90">hueso</text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════
   AROS
   ═══════════════════════════════════════ */

function EarringSizeReference({ diametroMm }: { diametroMm?: number | null }) {
  return (
    <div>
      {/* Ear with overlaid sizes */}
      <div className="flex gap-6 items-start">
        <svg viewBox="0 0 120 160" className="w-28 sm:w-32 flex-shrink-0" aria-label="Diagrama de tamanos de aros en oreja">
          {/* Ear outline */}
          <path
            d="M70 20 Q95 20 100 50 Q105 80 90 110 Q80 130 60 140 Q45 145 40 130 Q35 118 45 112 Q55 106 55 90 Q55 75 50 65 Q42 55 42 40 Q42 25 70 20Z"
            fill="#FAFAF8"
            stroke="#1a1a18"
            strokeWidth="1.5"
          />
          {/* Lobe dot */}
          <circle cx="55" cy="126" r="2" fill="#1a1a18" />

          {/* Earring size arcs from the lobe */}
          {EARRING_SIZES.map((size, i) => {
            const scaledR = (size.d / 2) * 1.2;
            const isHighlighted = diametroMm != null && diametroMm >= size.d - 3 && diametroMm <= size.d + 3;
            return (
              <circle
                key={size.range}
                cx="55"
                cy="126"
                r={Math.min(scaledR, 36)}
                fill="none"
                stroke={isHighlighted ? "#8B7355" : "#1a1a18"}
                strokeWidth={isHighlighted ? 2 : 0.8}
                opacity={isHighlighted ? 1 : 0.3}
                strokeDasharray={isHighlighted ? "none" : "3 2"}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-2 pt-1">
          {EARRING_SIZES.map((size) => {
            const isHighlighted = diametroMm != null && diametroMm >= size.d - 3 && diametroMm <= size.d + 3;
            return (
              <div
                key={size.range}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm",
                  isHighlighted ? "bg-accent/10 border border-accent/20" : ""
                )}
              >
                <span className={cn("font-medium", isHighlighted ? "text-accent" : "text-text")}>
                  {size.range}
                </span>
                <span className="text-text-secondary"> &mdash; {size.name}</span>
                {size.ref && (
                  <p className="text-xs text-text-tertiary">{size.ref}</p>
                )}
                {isHighlighted && diametroMm && (
                  <p className="text-xs text-accent mt-0.5">
                    Esta pieza mide {diametroMm} mm
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
