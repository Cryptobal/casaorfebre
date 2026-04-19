import Link from "next/link";
import Image from "next/image";

/**
 * SEO internal links — bloque compacto al tope del footer.
 * Se preserva para ranking / descubrimiento; el bloque editorial principal
 * vive debajo con 4 columnas.
 */
const seoColumns = [
  {
    title: "Colección",
    links: [
      { href: "/coleccion/cadenas-de-plata", label: "Cadenas de Plata" },
      { href: "/coleccion/aros-de-plata", label: "Aros de Plata" },
      { href: "/coleccion/anillos-de-plata", label: "Anillos de Plata" },
      { href: "/coleccion/pulseras-de-plata", label: "Pulseras de Plata" },
      { href: "/coleccion/collares-de-plata", label: "Collares de Plata" },
      { href: "/coleccion/colgantes-dijes-plata", label: "Colgantes y Dijes" },
    ],
  },
  {
    title: "Ocasiones",
    links: [
      { href: "/ocasion/anillos-de-compromiso-plata", label: "Anillos de Compromiso" },
      { href: "/ocasion/anillos-matrimonio-plata", label: "Argollas de Matrimonio" },
      { href: "/ocasion/joyas-para-parejas", label: "Joyas para Parejas" },
      { href: "/ocasion/joyas-dia-de-la-madre", label: "Día de la Madre" },
      { href: "/coleccion/joyas-hombre", label: "Joyas para Hombre" },
      { href: "/coleccion/joyas-mujer", label: "Joyas para Mujer" },
    ],
  },
  {
    title: "Guías",
    links: [
      { href: "/blog", label: "Historias" },
      { href: "/coleccion/regalos", label: "Encontrar regalo perfecto" },
      { href: "/guia/plata-925-950", label: "Plata 925 vs 950" },
      { href: "/galeria-santo-domingo", label: "Galería Santo Domingo" },
      { href: "/orfebres", label: "Nuestros Orfebres" },
    ],
  },
  {
    title: "Ciudades",
    links: [
      { href: "/joyerias/santiago", label: "Joyerías en Santiago" },
      { href: "/joyerias/concepcion", label: "Joyerías en Concepción" },
      { href: "/joyerias/temuco", label: "Joyerías en Temuco" },
      { href: "/joyerias/vina-del-mar", label: "Joyerías en Viña del Mar" },
      { href: "/joyerias", label: "Ver todas las ciudades" },
    ],
  },
];

/**
 * Columnas editoriales del footer — 4 grupos: Explorar, Para Orfebres,
 * Soporte, Casa. "Casa" no tiene links; se reserva para logo + redes + LX3.
 */
const mainColumns = [
  {
    title: "Explorar",
    links: [
      { href: "/coleccion", label: "Colección" },
      { href: "/orfebres", label: "Orfebres" },
      { href: "/blog", label: "Historias" },
      { href: "/sobre", label: "Sobre" },
      { href: "/seleccion-del-curador", label: "Selección del Curador" },
      { href: "/gift-cards", label: "Gift Cards" },
    ],
  },
  {
    title: "Para Orfebres",
    links: [
      { href: "/postular", label: "Postular" },
      { href: "/para-orfebres", label: "Conocer la plataforma" },
      { href: "/portal/orfebre", label: "Portal Orfebre" },
      { href: "/acuerdo-orfebre", label: "Acuerdo de Orfebre" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { href: "/garantia", label: "Garantía" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/contacto", label: "Contacto" },
      { href: "/terminos", label: "Términos y condiciones" },
      { href: "/privacidad", label: "Privacidad" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Bloque SEO: links internos compactos. */}
      <div className="border-b border-[color:var(--color-border-soft)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {seoColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-light text-text-secondary transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bloque editorial principal */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Logo centrado arriba */}
        <div className="flex justify-center pb-12">
          <Image
            src="/casaorfebre-logo-compact.svg"
            alt="Casa Orfebre"
            width={220}
            height={50}
            className="h-auto w-[200px]"
          />
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {mainColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-light text-text transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Columna "Casa" */}
          <div>
            <h3 className="text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
              Casa
            </h3>
            <p className="mt-5 font-serif text-sm font-light italic text-text-secondary">
              Santiago, Chile.
              <br />
              Joyería de autor.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <SocialLink
                href="https://www.instagram.com/casaorfebre"
                label="Instagram de Casa Orfebre"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://cl.pinterest.com/casaorfebre/"
                label="Pinterest de Casa Orfebre"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://x.com/casaorfebre"
                label="X (Twitter) de Casa Orfebre"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://www.tiktok.com/@casaorfebre"
                label="TikTok de Casa Orfebre"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.26 8.26 0 0 0 4.76 1.51V6.75a4.83 4.83 0 0 1-1-.06z" />
                </svg>
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-2 border-t border-[color:var(--color-border-soft)] pt-8 text-center text-[11px] font-light text-text-tertiary">
          <p>&copy; {new Date().getFullYear()} Casa Orfebre</p>
          <p>
            Desarrollado por{" "}
            <a
              href="https://lx3.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-text"
            >
              lx3.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-text-tertiary transition-colors hover:text-text"
    >
      {children}
    </a>
  );
}
