"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const ocasionLinks = [
  { href: "/coleccion/compromiso", label: "Compromiso" },
  { href: "/coleccion/matrimonio", label: "Matrimonio" },
  { href: "/coleccion/aniversario", label: "Aniversario" },
  { href: "/coleccion/dia-de-la-madre", label: "Día de la Madre" },
  { href: "/coleccion/graduacion", label: "Graduación" },
  { href: "/coleccion/autorregalo", label: "Autorregalo" },
  { href: "/coleccion/regalos", label: "Regalos" },
];

const presupuestoLinks = [
  { href: "/regalos-bajo-30000", label: "Bajo $30.000" },
  { href: "/regalos-bajo-50000", label: "Bajo $50.000" },
  { href: "/regalos-bajo-100000", label: "Bajo $100.000" },
];

export function RegalarDropdown() {
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
      >
        Regalar
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
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[420px] -translate-x-1/2 rounded-lg border border-border bg-background p-5 shadow-lg">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Por ocasión
              </h4>
              <ul className="space-y-2">
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
            <div>
              <h4 className="mb-3 text-[11px] font-medium uppercase tracking-widest text-text-tertiary">
                Por presupuesto
              </h4>
              <ul className="space-y-2">
                {presupuestoLinks.map((link) => (
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
          </div>
        </div>
      )}
    </div>
  );
}
