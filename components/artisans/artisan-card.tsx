import Link from "next/link";
import Image from "next/image";
import type { Artisan } from "@prisma/client";

type ArtisanEditorial = Pick<
  Artisan,
  | "id"
  | "slug"
  | "displayName"
  | "location"
  | "profileImage"
  | "portraitUrl"
  | "quote"
  | "signatureTechniques"
  | "materials"
  | "tier"
>;

type ArtisanWithCount = ArtisanEditorial & {
  _count?: { products: number };
};

interface ArtisanCardProps {
  artisan: ArtisanWithCount;
  /**
   * Cuando true, el card escala tipográficamente. El ancho real (2 cols)
   * lo controla el grid contenedor.
   */
  featured?: boolean;
}

function tierLabel(tier: Artisan["tier"]): string {
  switch (tier) {
    case "MAESTRO":
      return "Maestro Orfebre";
    case "EMERGENTE":
      return "Orfebre emergente";
    case "ORFEBRE":
    default:
      return "Orfebre";
  }
}

/**
 * Monograma tipográfico para orfebres sin retrato editorial.
 * Sustituye explícitamente el avatar circular con iniciales (estilo CRM).
 */
function monogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function ArtisanCard({ artisan, featured = false }: ArtisanCardProps) {
  // El retrato editorial 4:5 es distinto al avatar profileImage — si no existe,
  // renderizamos un monograma tipográfico sobre fondo bg-background.
  const portrait = artisan.portraitUrl;
  const ariaLabel = `Ver obra de ${artisan.displayName}, ${tierLabel(artisan.tier).toLowerCase()} en ${artisan.location}`;

  const signatureLine = [
    artisan.signatureTechniques?.[0],
    artisan.materials?.[0],
  ]
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

  return (
    <Link
      href={`/orfebres/${artisan.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label={ariaLabel}
    >
      {/* Retrato editorial 4:5 — o monograma tipográfico si no hay foto. */}
      <div className="relative aspect-[4/5] overflow-hidden bg-background">
        {portrait ? (
          <Image
            src={portrait}
            alt={`Retrato de ${artisan.displayName}`}
            fill
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden
              className={`font-serif italic font-light leading-none text-text-tertiary ${
                featured ? "text-[12rem]" : "text-[7rem]"
              }`}
            >
              {monogram(artisan.displayName)}
            </span>
          </div>
        )}
      </div>

      {/* Bloque tipográfico editorial. */}
      <div className="relative mt-5 space-y-2">
        <p
          className={`font-light uppercase tracking-[0.15em] text-text ${
            featured ? "text-base" : "text-sm"
          }`}
        >
          {artisan.displayName}
        </p>

        <p
          className={`font-serif italic font-light text-text-secondary ${
            featured ? "text-base" : "text-sm"
          }`}
        >
          {tierLabel(artisan.tier)} · {artisan.location}
        </p>

        {artisan.quote ? (
          <blockquote
            className={`pt-2 font-serif italic font-light leading-snug text-text ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {artisan.quote}
          </blockquote>
        ) : (
          // TODO CONTENIDO: quote signature pendiente de entrevista editorial.
          <p className="pt-2 font-serif text-sm italic font-light text-text-tertiary">
            Pendiente de entrevista editorial.
          </p>
        )}

        {signatureLine && (
          <p className="pt-2 text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
            {signatureLine}
          </p>
        )}

        <p
          className={`pt-3 text-xs font-light uppercase tracking-[0.15em] text-accent transition-colors group-hover:text-accent-dark ${
            featured ? "text-sm" : "text-xs"
          }`}
        >
          Ver obra →
        </p>

        {/* Línea dorada que nace en hover. */}
        <span
          aria-hidden
          className="absolute -bottom-2 left-0 block h-px w-0 bg-accent transition-[width] duration-300 ease-out group-hover:w-full"
        />
      </div>
    </Link>
  );
}
