import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "Explorar",
    links: [
      { href: "/coleccion", label: "Colección" },
      { href: "/orfebres", label: "Orfebres" },
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
      { href: "mailto:soporte@casaorfebre.cl", label: "Contacto" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={120} height={28} />
            <p className="mt-3 text-sm font-light text-text-tertiary">Joyería de Autor</p>
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

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-text-tertiary sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Casa Orfebre</p>
          <p>
            Desarrollado por{" "}
            <a href="https://lx3.ai" target="_blank" rel="noopener noreferrer" className="text-text-secondary transition-colors hover:text-text">
              LX3.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
