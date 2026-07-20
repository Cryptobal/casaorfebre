"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const categoriaLinks = [
  { href: "/coleccion/anillos", label: "Anillos" },
  { href: "/coleccion/aros", label: "Aros" },
  { href: "/coleccion/collares", label: "Collares" },
  { href: "/coleccion/pulseras", label: "Pulseras" },
  { href: "/coleccion/colgantes", label: "Colgantes" },
];

const ocasionLinks = [
  { href: "/ocasion/anillos-de-compromiso-plata", label: "Compromiso" },
  { href: "/ocasion/anillos-matrimonio-plata", label: "Matrimonio" },
  { href: "/coleccion/aniversario", label: "Aniversario" },
  { href: "/coleccion/autorregalo", label: "Autorregalo" },
  { href: "/coleccion/dia-de-la-madre", label: "Día de la Madre" },
];

const edicionesLinks = [
  { href: "/lo-nuevo", label: "Lo Nuevo", tourId: undefined as string | undefined },
  {
    href: "/seleccion-del-curador",
    label: "Selección del Curador",
    tourId: "nav-curador",
    curadorMark: true,
  },
  { href: "/tesoros-de-chile", label: "Tesoros de Chile", tourId: undefined },
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
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1">
        <Link
          href="/coleccion"
          className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
          onClick={() => setOpen(false)}
        >
          Colección
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center text-text-secondary transition-colors hover:text-text"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={open ? "Cerrar menú de Colección" : "Abrir menú de Colección"}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <nav
          className="absolute left-0 top-full z-50 mt-3 w-[min(920px,calc(100vw-2rem))] rounded-lg border border-border bg-background p-6 shadow-lg"
          aria-label="Mega menú Colección"
        >
          <div className="grid grid-cols-4 gap-8">
            {/* Categorías */}
            <div>
              <h3 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Categorías
              </h3>
              <ul className="space-y-2.5">
                {categoriaLinks.map((link) => (
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
                <li>
                  <Link
                    href="/coleccion"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-accent-dark transition-colors hover:text-accent"
                  >
                    Ver todo →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ocasiones */}
            <div>
              <h3 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Ocasiones
              </h3>
              <ul className="space-y-2.5">
                {ocasionLinks.map((link) => (
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

            {/* Ediciones */}
            <div>
              <h3 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Ediciones
              </h3>
              <ul className="space-y-3">
                {edicionesLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      data-tour={link.tourId}
                      onClick={() => setOpen(false)}
                      className="font-serif text-[17px] font-light text-text transition-colors hover:text-accent-dark"
                    >
                      {link.curadorMark ? (
                        <>
                          Selección del Curador{" "}
                          <span className="italic text-accent" aria-hidden>
                            ✦
                          </span>
                        </>
                      ) : (
                        link.label
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Destacado */}
            <div>
              <h3 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Destacado
              </h3>
              <Link
                href="/tesoros-de-chile"
                onClick={() => setOpen(false)}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
              >
                <Image
                  src="/casaorfebre-og-image.png"
                  alt="Tesoros de Chile — joyería artesanal"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="220px"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[rgba(26,26,24,0.72)] via-[rgba(26,26,24,0.2)] to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-light">
                    Edición especial
                  </p>
                  <p className="mt-1 font-serif text-lg font-light text-white">
                    Tesoros de Chile
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
