import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";
import { UserMenu } from "./user-menu";
import { RegalarDropdown } from "./regalar-dropdown";
import { SearchModal } from "@/components/shared/search-modal";
import type { SerializedCartItem } from "@/components/cart/cart-item";

const navLinksLeft = [
  { href: "/coleccion", label: "Colección" },
  { href: "/lo-nuevo", label: "Lo Nuevo" },
  { href: "/seleccion-del-curador", label: "Selección del Curador" },
  { href: "/tesoros-de-chile", label: "Tesoros de Chile" },
];

const navLinksRight = [
  { href: "/orfebres", label: "Orfebres" },
  { href: "/postular", label: "Postular" },
];

const navLinks = [...navLinksLeft, ...navLinksRight];

interface NavbarProps {
  cartItems?: SerializedCartItem[];
  cartTotal?: number;
  isLoggedIn?: boolean;
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string } | null;
}

export function Navbar({
  cartItems = [],
  cartTotal = 0,
  isLoggedIn = false,
  user,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0">
          <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={210} height={48} priority />
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {navLinksLeft.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <RegalarDropdown />
          </li>
          {navLinksRight.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <SearchModal />
          {user?.role === "ADMIN" && (
            <Link href="/portal/admin" className="hidden text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark lg:block">
              Panel Admin
            </Link>
          )}
          {user?.role === "ARTISAN" && (
            <Link href="/portal/orfebre" className="hidden text-xs font-medium tracking-wide text-accent transition-colors hover:text-accent-dark lg:block">
              Mi Portal
            </Link>
          )}
          <CartButton
            initialItems={cartItems}
            initialTotal={cartTotal}
            isLoggedIn={isLoggedIn}
          />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login" className="hidden text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text lg:block">
              Ingresar
            </Link>
          )}
          <MobileMenu links={navLinks} user={user} />
        </div>
      </nav>
    </header>
  );
}
