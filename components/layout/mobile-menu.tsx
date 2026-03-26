"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-8 w-8 items-center justify-center text-text-secondary"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Capa por encima del header sticky (z-50) — fondo casi opaco + blur fuerte para legibilidad */}
          <div
            className="fixed inset-0 top-16 z-[60] bg-[color:var(--color-background)]/[0.97] backdrop-blur-xl backdrop-saturate-150"
            aria-hidden="true"
          />
          <div className="fixed inset-0 top-16 z-[61] flex flex-col overflow-y-auto">
            <nav className="flex flex-col items-center gap-8 px-6 pt-10 pb-12">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-serif text-2xl font-light text-text transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex min-h-[44px] min-w-[200px] items-center justify-center rounded-md border-2 border-accent bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-dark hover:text-white"
              >
                Ingresar
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
