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
        <div className="fixed inset-0 top-16 z-40 bg-background">
          <nav className="flex flex-col items-center gap-8 pt-16">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="font-serif text-2xl font-light text-text-secondary transition-colors hover:text-text">
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="mt-4 rounded-md border border-accent px-8 py-3 text-sm text-accent transition-colors hover:bg-accent hover:text-white">
              Ingresar
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
