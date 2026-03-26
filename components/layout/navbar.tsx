import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";
import type { SerializedCartItem } from "@/components/cart/cart-item";

const navLinks = [
  { href: "/coleccion", label: "Colección" },
  { href: "/orfebres", label: "Orfebres" },
  { href: "/postular", label: "Postular" },
];

interface NavbarProps {
  cartCount?: number;
  cartItems?: SerializedCartItem[];
  cartTotal?: number;
}

export function Navbar({ cartCount = 0, cartItems = [], cartTotal = 0 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0">
          <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={140} height={32} priority />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <CartButton
            initialCount={cartCount}
            initialItems={cartItems}
            initialTotal={cartTotal}
          />
          <Link href="/login" className="hidden text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text md:block">
            Ingresar
          </Link>
          <MobileMenu links={navLinks} />
        </div>
      </nav>
    </header>
  );
}
