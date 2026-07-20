"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";
import { ColeccionMegaMenu } from "./coleccion-mega-menu";
import { SearchModal, openSearch } from "@/components/shared/search-modal";

/** Label del enlace a `/blog` — cambiar aquí para revertir a "Blog". */
const NAV_BLOG_LABEL = "Journal";

const REGALAR_HREF = "/coleccion/regalos";

/** Links para el sheet móvil (SEO: ocasiones/guías siguen en MobileMenu). */
const mobileNavLinks = [
  { href: "/lo-nuevo", label: "Lo Nuevo" },
  { href: "/seleccion-del-curador", label: "Selección del Curador" },
  { href: "/tesoros-de-chile", label: "Tesoros de Chile" },
  { href: "/orfebres", label: "Orfebres" },
  { href: "/blog", label: NAV_BLOG_LABEL },
  { href: "/postular", label: "Postular" },
  { href: REGALAR_HREF, label: "Regalar" },
];

function SearchPill() {
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className="glass flex h-10 min-h-11 flex-1 items-center gap-2 rounded-full px-3.5 text-left text-sm font-light text-text-tertiary"
      aria-label="Buscar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-text-secondary"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span>Buscar…</span>
    </button>
  );
}

function DesktopSearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className="flex h-11 min-w-11 items-center justify-center gap-2 text-text-secondary transition-colors hover:text-text md:min-w-0 md:justify-start"
      aria-label="Buscar"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
        <span className="text-xs">&#8984;</span>K
      </kbd>
    </button>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }
    : null;
  const isAuthenticated = status === "authenticated";
  const isUnauthenticated = status === "unauthenticated";

  return (
    <header className="sticky top-0 z-50">
      {/* Un solo modal de búsqueda para desktop + móvil + engaste + ⌘K */}
      <SearchModal showTrigger={false} />

      {/* Utility bar — desktop */}
      <div className="hidden border-b border-border bg-surface-alt md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <p
            className="text-text-tertiary"
            style={{ fontSize: "10.5px", letterSpacing: "0.04em" }}
          >
            Envíos a todo Chile · Certificado de autenticidad en cada pieza
          </p>
          <p
            className="text-text-tertiary"
            style={{ fontSize: "10.5px", letterSpacing: "0.04em" }}
          >
            ¿Eres orfebre?{" "}
            <Link
              href="/para-orfebres"
              className="font-medium text-accent-dark transition-colors hover:text-accent"
            >
              Vende con nosotros →
            </Link>
          </p>
        </div>
      </div>

      {/* Desktop nav — fondo sólido, sin vidrio: un blur de ancho completo en
          un header sticky forzaría re-blur en cada frame de scroll = jank. */}
      <div className="hidden border-b border-border bg-surface md:block">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex-shrink-0" aria-label="Casa Orfebre — Inicio">
            <Image
              src="/casaorfebre-logo-compact.svg"
              alt="Casa Orfebre"
              width={210}
              height={48}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          <ul className="flex items-center gap-7">
            <li data-tour="nav-coleccion">
              <ColeccionMegaMenu />
            </li>
            <li>
              <Link
                href="/orfebres"
                data-tour="nav-orfebres"
                className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
              >
                Orfebres
              </Link>
            </li>
            <li data-tour="nav-regalar">
              <Link
                href={REGALAR_HREF}
                className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
              >
                Regalar
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
              >
                {NAV_BLOG_LABEL}
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-4">
            <div data-tour="nav-search">
              <DesktopSearchTrigger />
            </div>
            {isAuthenticated && user?.role === "ADMIN" && (
              <Link
                href="/portal/admin"
                className="text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark"
              >
                Panel Admin
              </Link>
            )}
            {isAuthenticated && user?.role === "ARTISAN" && (
              <Link
                href="/portal/orfebre"
                className="text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark"
              >
                Mi Portal
              </Link>
            )}
            <CartButton />
            {isAuthenticated && user ? (
              <UserMenu user={user} />
            ) : isUnauthenticated ? (
              <Link
                href="/login"
                className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
              >
                Ingresar
              </Link>
            ) : (
              <span className="h-5 w-16" aria-hidden />
            )}
          </div>
        </nav>
      </div>

      {/* Mobile top bar — Liquid Glass */}
      <div
        className="md:hidden"
        style={{
          background:
            "linear-gradient(rgba(250,250,248,.82), rgba(250,250,248,.55) 70%, transparent)",
          WebkitBackdropFilter: "blur(18px) saturate(1.5)",
          backdropFilter: "blur(18px) saturate(1.5)",
        }}
      >
        <nav className="flex h-14 items-center gap-2.5 px-3">
          <Link href="/" className="flex-shrink-0" aria-label="Casa Orfebre — Inicio">
            <Image
              src="/casaorfebre-logo-compact.svg"
              alt="Casa Orfebre"
              width={140}
              height={32}
              priority
              className="h-7 w-auto"
            />
          </Link>
          <div data-tour="nav-search" className="min-w-0 flex-1">
            <SearchPill />
          </div>
          <CartButton />
          <MobileMenu links={mobileNavLinks} user={user} />
        </nav>
      </div>
    </header>
  );
}
