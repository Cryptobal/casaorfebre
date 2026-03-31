"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const menuSections = [
  {
    title: "Por Tipo",
    links: [
      { href: "/coleccion/anillos", label: "Anillos" },
      { href: "/coleccion/aros", label: "Aros" },
      { href: "/coleccion/collares", label: "Collares" },
      { href: "/coleccion/pulseras", label: "Pulseras" },
      { href: "/coleccion/colgantes", label: "Colgantes" },
      { href: "/coleccion/plata-925", label: "Cadenas" },
    ],
  },
  {
    title: "Por Ocasión",
    links: [
      { href: "/ocasion/anillos-de-compromiso-plata", label: "Compromiso" },
      { href: "/ocasion/anillos-matrimonio-plata", label: "Matrimonio" },
      { href: "/coleccion/dia-de-la-madre", label: "Día de la Madre" },
      { href: "/ocasion/joyas-para-parejas", label: "Parejas" },
      { href: "/coleccion/graduacion", label: "Graduación" },
      { href: "/coleccion/aniversario", label: "Aniversario" },
      { href: "/coleccion/autorregalo", label: "Autorregalo" },
    ],
  },
  {
    title: "Por Estilo",
    links: [
      { href: "/coleccion/joyas-mujer", label: "Joyas para Mujer" },
      { href: "/coleccion/joyas-hombre", label: "Joyas para Hombre" },
    ],
  },
  {
    title: "Guías",
    links: [
      { href: "/guia/plata-925-950", label: "Plata 925 vs 950" },
      { href: "/coleccion/regalos", label: "Regalar Joyería" },
      { href: "/coleccion/piedras-naturales", label: "Piedras Naturales" },
    ],
  },
  {
    title: "Explorar",
    links: [
      { href: "/galeria-santo-domingo", label: "Galería Santo Domingo" },
      { href: "/orfebres", label: "Orfebres" },
      { href: "/blog", label: "Blog" },
      { href: "/lo-nuevo", label: "Novedades" },
    ],
  },
];

export function ColeccionMegaMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Colección
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <nav className="absolute left-0 top-full z-50 mt-3 min-w-max rounded-lg border border-border bg-background p-6 shadow-lg">
          <div className="grid grid-cols-5 gap-8">
            {menuSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-sm font-light text-text-secondary transition-colors hover:text-text"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
