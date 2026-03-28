import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "Explorar",
    links: [
      { href: "/coleccion", label: "Colección" },
      { href: "/orfebres", label: "Orfebres" },
      { href: "/gift-cards", label: "Gift Cards" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Regalos Populares",
    links: [
      { href: "/coleccion/compromiso", label: "Compromiso" },
      { href: "/coleccion/matrimonio", label: "Matrimonio" },
      { href: "/coleccion/aniversario", label: "Aniversario" },
      { href: "/coleccion/dia-de-la-madre", label: "Día de la Madre" },
      { href: "/coleccion/graduacion", label: "Graduación" },
      { href: "/coleccion/autorregalo", label: "Autorregalo" },
      { href: "/regalos-bajo-30000", label: "Bajo $30.000" },
      { href: "/regalos-bajo-50000", label: "Bajo $50.000" },
      { href: "/regalos-bajo-100000", label: "Bajo $100.000" },
    ],
  },
  {
    title: "Para Orfebres",
    links: [
      { href: "/postular", label: "Postular" },
      { href: "/portal/orfebre", label: "Portal Orfebre" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { href: "/garantia", label: "Garantía" },
      { href: "/preguntas-frecuentes", label: "Preguntas Frecuentes" },
      { href: "/terminos", label: "Términos y Condiciones" },
      { href: "/privacidad", label: "Privacidad" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={180} height={42} />
            <p className="mt-3 text-sm font-light text-text-tertiary">Joyería de Autor</p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.instagram.com/casaorfebre"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Casa Orfebre"
                className="text-text-tertiary transition-colors hover:text-text"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61576780358505"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Casa Orfebre"
                className="text-text-tertiary transition-colors hover:text-text"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@casaorfebre"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de Casa Orfebre"
                className="text-text-tertiary transition-colors hover:text-text"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.26 8.26 0 0 0 4.76 1.51V6.75a4.83 4.83 0 0 1-1-.06z" />
                </svg>
              </a>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-light text-text-secondary transition-colors hover:text-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-6 text-center text-xs text-text-tertiary">
          <p>
            Desarrollado por{" "}
            <a href="https://lx3.ai" target="_blank" rel="noopener noreferrer" className="text-text-secondary transition-colors hover:text-text">
              lx3.ai
            </a>
          </p>
          <p>&copy; 2026 Casa Orfebre</p>
        </div>
      </div>
    </footer>
  );
}
