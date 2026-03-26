import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./mobile-menu";

const navLinks = [
  { href: "/coleccion", label: "Colección" },
  { href: "/orfebres", label: "Orfebres" },
  { href: "/postular", label: "Postular" },
];

export function Navbar() {
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
          <button aria-label="Carrito" className="relative text-text-secondary transition-colors hover:text-text">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </button>
          <Link href="/login" className="hidden text-sm font-light tracking-wide text-text-secondary transition-colors hover:text-text md:block">
            Ingresar
          </Link>
          <MobileMenu links={navLinks} />
        </div>
      </nav>
    </header>
  );
}
