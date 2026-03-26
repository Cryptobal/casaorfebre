import Link from "next/link";
import { MaterialBadge } from "@/components/shared/material-badge";
import type { Artisan } from "@prisma/client";

type ArtisanWithCount = Artisan & { _count: { products: number } };

interface ArtisanCardProps {
  artisan: ArtisanWithCount;
}

export function ArtisanCard({ artisan }: ArtisanCardProps) {
  const initials = artisan.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <Link
      href={`/orfebres/${artisan.slug}`}
      className="group block rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/30"
    >
      {/* Avatar */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background">
        <span className="font-serif text-2xl font-light text-text-secondary">
          {initials}
        </span>
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <h3 className="font-serif text-xl font-medium text-text">
          {artisan.displayName}
        </h3>
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
