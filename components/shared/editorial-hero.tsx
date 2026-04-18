interface EditorialHeroProps {
  /** Título display (Cormorant, peso 300). */
  heading: string;
  /** Subtítulo (Outfit, puede contener <em> HTML). */
  subheading?: string;
  /** Párrafo editorial bajo el subtítulo. */
  paragraph?: string;
  className?: string;
}

/**
 * Hero tipográfico editorial para páginas de listado (coleccion, orfebres, etc.).
 * - Heading Cormorant peso 300, text-5xl mobile → text-7xl/8xl desktop.
 * - Línea dorada 60px x 1px entre subheading y paragraph.
 * - Max-width prose para paragraph.
 */
export function EditorialHero({
  heading,
  subheading,
  paragraph,
  className = "",
}: EditorialHeroProps) {
  return (
    <header className={`flex flex-col gap-6 ${className}`}>
      <h1 className="font-serif text-5xl font-light leading-[1.05] text-text sm:text-6xl lg:text-7xl xl:text-8xl">
        {heading}
      </h1>

      {subheading && (
        <p
          className="max-w-prose text-lg font-light text-text-secondary [&_em]:italic"
          // subheading puede contener <em>; origen es estático (content file), no user input.
          dangerouslySetInnerHTML={{ __html: subheading }}
        />
      )}

      <span aria-hidden className="h-px w-[60px] bg-accent" />

      {paragraph && (
        <p className="max-w-prose font-serif text-lg font-light leading-relaxed text-text">
          {paragraph}
        </p>
      )}
    </header>
  );
}
