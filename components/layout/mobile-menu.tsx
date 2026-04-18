"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu as MenuIcon, X as CloseIcon, ChevronDown, Search as SearchIcon } from "lucide-react";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/**
 * Grupos del submenu "Colección" para mobile. Los labels y hrefs están
 * alineados con ColeccionMegaMenu (desktop) para mantener consistencia.
 */
const COLECCION_GROUPS = [
  {
    title: "Por categoría",
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
    title: "Por ocasión",
    links: [
      { href: "/ocasion/anillos-de-compromiso-plata", label: "Compromiso" },
      { href: "/ocasion/anillos-matrimonio-plata", label: "Matrimonio" },
      { href: "/coleccion/dia-de-la-madre", label: "Día de la Madre" },
      { href: "/coleccion/aniversario", label: "Aniversario" },
      { href: "/coleccion/joyas-hombre", label: "Para él" },
      { href: "/coleccion/joyas-mujer", label: "Para ella" },
      { href: "/coleccion/regalos", label: "Regalar" },
    ],
  },
  {
    title: "Curadurías",
    links: [
      { href: "/seleccion-del-curador", label: "Selección del Curador" },
      { href: "/lo-nuevo", label: "Lo Nuevo" },
      { href: "/tesoros-de-chile", label: "Tesoros de Chile" },
    ],
  },
] as const;

interface MobileMenuProps {
  /** Links top-level no-Colección (Orfebres, Historias, Sobre, etc.). */
  links: { href: string; label: string }[];
  user?: { name?: string | null; email?: string | null; role?: string } | null;
}

export function MobileMenu({ links, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [coleccionOpen, setColeccionOpen] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const portalLink =
    user?.role === "ADMIN"
      ? "/portal/admin"
      : user?.role === "ARTISAN"
        ? "/portal/orfebre"
        : "/portal/comprador/pedidos";

  const portalLabel =
    user?.role === "ADMIN" ? "Panel Admin" : user?.role === "ARTISAN" ? "Mi Portal" : "Mi Cuenta";

  // Filtramos "Colección" de los links — se renderiza como submenu dedicado.
  const flatLinks = links.filter((l) => l.href !== "/coleccion");

  /** Dispara el modal de búsqueda (Search ⌘K) simulando el shortcut. */
  function triggerSearch() {
    setOpen(false);
    // Espera al siguiente frame para que el menú se desmonte y el modal reciba focus.
    requestAnimationFrame(() => {
      const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
      window.dispatchEvent(event);
    });
  }

  const panel =
    open &&
    isClient &&
    createPortal(
      <div className="fixed inset-0 top-16 z-[60] animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-background" aria-hidden />
        <div className="relative flex h-full flex-col overflow-y-auto px-6 pt-10 pb-12">
          <nav className="flex flex-1 flex-col items-center gap-6">
            {/* Colección — con submenu expandible */}
            <div className="flex w-full flex-col items-center">
              <button
                type="button"
                onClick={() => setColeccionOpen((v) => !v)}
                className="flex min-h-[56px] items-center gap-2 font-serif text-2xl font-light text-text transition-colors hover:text-accent"
                aria-expanded={coleccionOpen}
              >
                Colección
                <ChevronDown
                  size={18}
                  strokeWidth={1}
                  className={`transition-transform ${coleccionOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {coleccionOpen && (
                <div className="mt-2 w-full max-w-xs space-y-6 pb-2">
                  {COLECCION_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="mb-3 text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
                        {group.title}
                      </p>
                      <ul className="space-y-1">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={() => setOpen(false)}
                              className="block min-h-[44px] py-2 text-sm font-light text-text transition-colors hover:text-accent"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {flatLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[56px] items-center font-serif text-2xl font-light text-text transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}

            {/* Buscar ⌘K como ítem explícito */}
            <button
              type="button"
              onClick={triggerSearch}
              className="flex min-h-[56px] items-center gap-3 font-serif text-2xl font-light text-text transition-colors hover:text-accent"
            >
              <SearchIcon size={20} strokeWidth={1} aria-hidden />
              Buscar
            </button>
          </nav>

          {/* Pie: auth + postular (tira pequeña) */}
          <div className="mt-12 flex flex-col items-center gap-6 border-t border-border pt-8">
            {user ? (
              <>
                <Link
                  href={portalLink}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[48px] min-w-[220px] items-center justify-center border border-text px-8 py-3 text-sm font-light tracking-wide text-text transition-colors hover:bg-text hover:text-background"
                >
                  {portalLabel}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-sm font-light text-text-secondary transition-colors hover:text-text"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[48px] min-w-[220px] items-center justify-center border border-text px-8 py-3 text-sm font-light tracking-wide text-text transition-colors hover:bg-text hover:text-background"
              >
                Ingresar
              </Link>
            )}

            <Link
              href="/postular"
              onClick={() => setOpen(false)}
              className="text-[10px] font-light uppercase tracking-[0.2em] text-text-tertiary transition-colors hover:text-text"
            >
              Orfebres — Postular
            </Link>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:text-text"
      >
        {open ? (
          <CloseIcon size={20} strokeWidth={1} aria-hidden />
        ) : (
          <MenuIcon size={20} strokeWidth={1} aria-hidden />
        )}
      </button>
      {panel}
    </div>
  );
}
