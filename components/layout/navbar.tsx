"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";
import { RegalarDropdown } from "./regalar-dropdown";
import { ColeccionMegaMenu } from "./coleccion-mega-menu";
import { SearchModal } from "@/components/shared/search-modal";

const navLinksLeft = [
  { href: "/lo-nuevo", label: "Lo Nuevo", tourId: undefined },
  { href: "/seleccion-del-curador", label: "Selección del Curador", tourId: "nav-curador" },
  { href: "/tesoros-de-chile", label: "Tesoros de Chile", tourId: undefined },
];

const navLinksRight = [
  { href: "/orfebres", label: "Orfebres", tourId: "nav-orfebres" },
  { href: "/blog", label: "Blog", tourId: undefined },
  { href: "/postular", label: "Postular", tourId: undefined },
];

const navLinks = [...navLinksLeft, ...navLinksRight];

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
  // Mientras la sesión no esté resuelta, asumimos visitante público
  // (mismo comportamiento que un usuario no logueado, sin parpadeos extraños).
  const showParaOrfebres = !user || user.role === "BUYER";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0">
          <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={210} height={48} priority />
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          <li data-tour="nav-coleccion">
            <ColeccionMegaMenu />
          </li>
          {navLinksLeft.map((link) => (
            <li key={link.href}>
              <Link href={link.href} data-tour={link.tourId} className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text">
                {link.label}
              </Link>
            </li>
          ))}
          <li data-tour="nav-regalar">
            <RegalarDropdown />
          </li>
          {navLinksRight.map((link) => (
            <li key={link.href}>
              <Link href={link.href} data-tour={link.tourId} className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text">
                {link.label}
              </Link>
            </li>
          ))}
          {showParaOrfebres && (
            <li>
              <Link
                href="/para-orfebres"
                className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
              >
                Para Orfebres
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-4">
          <div data-tour="nav-search">
            <SearchModal />
          </div>
          {isAuthenticated && user?.role === "ADMIN" && (
            <Link href="/portal/admin" className="hidden text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark lg:block">
              Panel Admin
            </Link>
          )}
          {isAuthenticated && user?.role === "ARTISAN" && (
            <Link href="/portal/orfebre" className="hidden text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark lg:block">
              Mi Portal
            </Link>
          )}
          <CartButton />
          {isAuthenticated && user ? (
            <UserMenu user={user} />
          ) : isUnauthenticated ? (
            <Link href="/login" className="hidden text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text lg:block">
              Ingresar
            </Link>
          ) : (
            // status === "loading": placeholder neutral para evitar layout shift
            <span className="hidden h-5 w-16 lg:block" aria-hidden />
          )}
          <MobileMenu links={navLinks} user={user} />
        </div>
      </nav>
    </header>
  );
}
