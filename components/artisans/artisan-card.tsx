import Link from "next/link";
import Image from "next/image";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ArtisanBadge } from "@/components/artisans/artisan-badge";
import type { Artisan } from "@prisma/client";

type ArtisanWithCount = Artisan & {
  _count: { products: number };
  subscriptions?: Array<{
    plan: { name: string; badgeText: string | null; badgeType: string | null };
  }>;
};

interface ArtisanCardProps {
  artisan: ArtisanWithCount;
}

/**
 * Etiqueta editorial del tier. Sólo MAESTRO recibe título jerárquico;
 * el resto se muestra como "Orfebre" (sin atenuantes).
 */
function tierLabel(tier: Artisan["tier"]): string {
  switch (tier) {
    case "MAESTRO":
      return "Maestro Orfebre";
    case "EMERGENTE":
      return "Orfebre";
    case "ORFEBRE":
    default:
      return "Orfebre";
  }
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  const initials = artisan.displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2);

  const activePlan = artisan.subscriptions?.[0]?.plan;

  return (
    <Link
      href={`/orfebres/${artisan.slug}`}
      className="group flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/30"
    >
      {/* Avatar */}
      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-border bg-background">
        {artisan.profileImage ? (
          <Image
            src={artisan.profileImage}
            alt={artisan.displayName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-serif text-2xl font-light text-text-secondary">
            {initials}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <h3 className="font-serif text-xl font-medium text-text">
          {artisan.displayName}
        </h3>

        <p className="mt-1 text-xs font-light uppercase tracking-[0.15em] text-accent">
          {tierLabel(artisan.tier)}
        </p>

        {/* Badge de plan — dimensión comercial, independiente del tier curatorial. */}
        {activePlan?.badgeType && (
          <div className="mt-1.5 flex justify-center">
            <ArtisanBadge
              badgeType={activePlan.badgeType}
              badgeText={activePlan.badgeText}
            />
          </div>
        )}

        <p className="mt-1 text-sm text-text-tertiary">
          {artisan.location} · {artisan.specialty}
        </p>

        {/* Materials */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {artisan.materials.slice(0, 3).map((m) => (
            <MaterialBadge key={m} material={m} />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-tertiary">
          {artisan.rating > 0 && (
            <span>★ {artisan.rating.toFixed(1)}</span>
          )}
          <span>{artisan._count.products} piezas</span>
        </div>
      </div>
    </Link>
  );
}
