"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";
import { ColeccionMegaMenu } from "./coleccion-mega-menu";
import { SearchModal } from "@/components/shared/search-modal";

/**
 * Navegación editorial: 4 ítems principales.
 * - Colección: abre mega-menu (incluye regalos y curadurías).
 * - Orfebres: link directo al directorio.
 * - Historias: ruta `/blog` renombrada (SEO preservado).
 * - Sobre: página manifiesto (creada en Task 8).
 */
const NAV_LINKS = [
  { href: "/orfebres", label: "Orfebres", tourId: "nav-orfebres" },
  { href: "/blog", label: "Historias", tourId: undefined },
  { href: "/sobre", label: "Sobre", tourId: undefined },
] as const;

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

  // Links para mobile: se expone ColeccionMegaMenu aparte, los demás van aquí.
  const mobileLinks = [{ href: "/coleccion", label: "Colección" }, ...NAV_LINKS];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      {/* Tira superior: postular como orfebre (tipografía sobria, above nav). */}
      <div className="hidden border-b border-border/60 lg:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-end px-4 sm:px-6 lg:px-8">
          <Link
            href="/postular"
            className="text-[10px] font-light uppercase tracking-[0.2em] text-text-tertiary transition-colors hover:text-text"
          >
            Orfebres — Postular
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0" aria-label="Casa Orfebre — Inicio">
          <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={210} height={48} priority />
        </Link>

        <ul className="hidden items-center gap-10 lg:flex">
          <li data-tour="nav-coleccion">
            <ColeccionMegaMenu />
          </li>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                data-tour={link.tourId}
                className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <div data-tour="nav-search">
            <SearchModal />
          </div>
          {isAuthenticated && user?.role === "ADMIN" && (
            <Link
              href="/portal/admin"
              className="hidden text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark lg:block"
            >
              Panel Admin
            </Link>
          )}
          {isAuthenticated && user?.role === "ARTISAN" && (
            <Link
              href="/portal/orfebre"
              className="hidden text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark lg:block"
            >
              Mi Portal
            </Link>
          )}
          <Link
            href={isAuthenticated ? "/portal/comprador/favoritos" : "/login?callbackUrl=%2Fportal%2Fcomprador%2Ffavoritos"}
            aria-label="Mis favoritos"
            className="hidden text-text-secondary transition-colors hover:text-text lg:inline-flex"
          >
            <Heart size={18} strokeWidth={1} aria-hidden />
          </Link>
          <CartButton />
          {isAuthenticated && user ? (
            <UserMenu user={user} />
          ) : isUnauthenticated ? (
            <Link
              href="/login"
              className="hidden text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text lg:block"
            >
              Ingresar
            </Link>
          ) : (
            <span className="hidden h-5 w-16 lg:block" aria-hidden />
          )}
          <MobileMenu links={mobileLinks} user={user} />
        </div>
      </nav>
    </header>
  );
}
