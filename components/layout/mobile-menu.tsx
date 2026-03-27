"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut } from "next-auth/react";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const regalarOcasionLinks = [
  { href: "/coleccion/compromiso", label: "Compromiso" },
  { href: "/coleccion/matrimonio", label: "Matrimonio" },
  { href: "/coleccion/aniversario", label: "Aniversario" },
  { href: "/coleccion/dia-de-la-madre", label: "Día de la Madre" },
  { href: "/coleccion/graduacion", label: "Graduación" },
  { href: "/coleccion/autorregalo", label: "Autorregalo" },
  { href: "/coleccion/regalos", label: "Regalos" },
];

const regalarPresupuestoLinks = [
  { href: "/regalos-bajo-30000", label: "Bajo $30.000" },
  { href: "/regalos-bajo-50000", label: "Bajo $50.000" },
  { href: "/regalos-bajo-100000", label: "Bajo $100.000" },
];

interface MobileMenuProps {
  links: { href: string; label: string }[];
  user?: { name?: string | null; email?: string | null; role?: string } | null;
}

export function MobileMenu({ links, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [regalarOpen, setRegalarOpen] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const portalLink =
    user?.role === "ADMIN"
      ? "/portal/admin"
      : user?.role === "ARTISAN"
        ? "/portal/orfebre"
        : "/portal/comprador/pedidos";

  const portalLabel =
    user?.role === "ADMIN"
      ? "Panel Admin"
      : user?.role === "ARTISAN"
        ? "Mi Portal"
        : "Mi Cuenta";

  const panel =
    open &&
    isClient &&
    createPortal(
      <>
        <div
          className="fixed inset-0 top-16 z-[60] bg-[color:var(--color-background)] backdrop-blur-xl backdrop-saturate-150"
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

            {/* Regalar section */}
            <div className="flex w-full flex-col items-center">
              <button
                type="button"
                onClick={() => setRegalarOpen(!regalarOpen)}
                className="flex items-center gap-2 font-serif text-2xl font-light text-text transition-colors hover:text-accent"
              >
                Regalar
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className={`transition-transform ${regalarOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {regalarOpen && (
                <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                      Por ocasión
                    </p>
                    {regalarOcasionLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block py-1 text-sm font-light text-text-secondary transition-colors hover:text-text"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                      Por presupuesto
                    </p>
                    {regalarPresupuestoLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block py-1 text-sm font-light text-text-secondary transition-colors hover:text-text"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link
                  href={portalLink}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex min-h-[44px] min-w-[200px] items-center justify-center rounded-md border-2 border-accent bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-dark hover:text-white"
                >
                  {portalLabel}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-sm text-text-secondary transition-colors hover:text-text"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex min-h-[44px] min-w-[200px] items-center justify-center rounded-md border-2 border-accent bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-dark hover:text-white"
              >
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      </>,
      document.body
    );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
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

      {panel}
    </div>
  );
}
