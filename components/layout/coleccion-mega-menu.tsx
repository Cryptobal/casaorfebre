"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

/**
 * Mega-menú editorial: 3 columnas + imagen editorial.
 * Headers en Outfit uppercase tracked; ítems en Outfit peso 300, hover gold.
 */
const CATEGORIAS = [
  { href: "/coleccion/anillos", label: "Anillos" },
  { href: "/coleccion/aros", label: "Aros" },
  { href: "/coleccion/collares", label: "Collares" },
  { href: "/coleccion/pulseras", label: "Pulseras" },
  { href: "/coleccion/colgantes", label: "Colgantes" },
  { href: "/coleccion/cadenas", label: "Cadenas" },
] as const;

const OCASIONES = [
  { href: "/ocasion/anillos-de-compromiso-plata", label: "Compromiso" },
  { href: "/ocasion/anillos-matrimonio-plata", label: "Matrimonio" },
  { href: "/coleccion/dia-de-la-madre", label: "Día de la Madre" },
  { href: "/coleccion/aniversario", label: "Aniversario" },
  { href: "/coleccion/joyas-hombre", label: "Para él" },
  { href: "/coleccion/joyas-mujer", label: "Para ella" },
  { href: "/coleccion/regalos", label: "Regalar" },
] as const;

const CURADURIAS = [
  { href: "/seleccion-del-curador", label: "Selección del Curador" },
  { href: "/lo-nuevo", label: "Lo Nuevo" },
  { href: "/tesoros-de-chile", label: "Tesoros de Chile" },
  { href: "/coleccion?price=50000", label: "Bajo $50.000" },
] as const;

export function ColeccionMegaMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    cancelClose();
    setOpen(false);
  }, [cancelClose]);

  // Click fuera y tecla ESC.
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="static"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        className="flex items-center gap-1 text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Colección
        <ChevronDown
          size={14}
          strokeWidth={1}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {/* Panel del mega-menu: fullwidth, fade + slide-down. */}
      <div
        role="region"
        aria-hidden={!open}
        className={`absolute inset-x-0 top-full z-40 border-b border-border bg-background shadow-sm transition-all duration-200 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-10 px-6 py-12 lg:px-16">
          <MegaColumn title="Por categoría" items={CATEGORIAS} onNavigate={close} />
          <MegaColumn title="Por ocasión" items={OCASIONES} onNavigate={close} />
          <MegaColumn title="Curadurías" items={CURADURIAS} onNavigate={close} />

          {/* Imagen editorial. TODO CONTENIDO: reemplazar con foto de la curaduría del mes. */}
          <div className="col-span-12 lg:col-span-3">
            <Link
              href="/seleccion-del-curador"
              onClick={close}
              className="group flex h-full flex-col justify-end border-l border-border-soft pl-8"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                <div className="flex h-full items-end p-6">
                  <p className="font-serif text-2xl font-light italic leading-tight text-text">
                    Selección del Curador
                    <br />
                    <span className="text-base not-italic tracking-[0.2em] text-text-tertiary">
                      ESTE MES
                    </span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs font-light uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-accent-dark">
                Ver la selección →
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MegaColumn({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: ReadonlyArray<{ href: string; label: string }>;
  onNavigate: () => void;
}) {
  return (
    <div className="col-span-12 sm:col-span-4 lg:col-span-3">
      <h3 className="mb-5 text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="text-sm font-light text-text transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
