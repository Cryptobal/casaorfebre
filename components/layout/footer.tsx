import Link from "next/link";
import { PORTAL_INSTAGRAM_URL } from "@/lib/site-config";

const footerLinks = [
  { href: "/blog", label: "Blog", external: false },
  { href: PORTAL_INSTAGRAM_URL, label: "Instagram", external: true },
  { href: "/terminos", label: "Términos", external: false },
  { href: "/privacidad", label: "Privacidad", external: false },
] as const;

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-6 border-t border-border-subtle px-6 pt-12 pb-10 text-center">
      <div className="font-serif text-[17px] font-light tracking-[0.22em] text-text">
        casa orfebre
      </div>
      <nav
        className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-[11px] font-light uppercase tracking-[0.16em]"
        aria-label="Pie de página"
      >
        {footerLinks.map((link, index) => (
          <span key={link.href} className="flex items-center gap-3.5">
            {index > 0 && (
              <span className="text-text-faint" aria-hidden>
                ·
              </span>
            )}
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-[color] duration-[250ms] ease-[ease] hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-text-secondary transition-[color] duration-[250ms] ease-[ease] hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {link.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <div className="text-[10px] font-light tracking-[0.14em] text-text-faint">
        Desarrollado por LX3
      </div>
    </footer>
  );
}
