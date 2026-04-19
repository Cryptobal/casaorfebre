/**
 * Skeletons editoriales. Sin spinners genéricos — rectángulos
 * color border-soft con shimmer sutil (1.5s loop) definido en globals.css.
 */

function ShimmerBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-[color:var(--color-border-soft)] ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 animate-editorial-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

/** Card de producto en grid — aspect 4:5 + 4 líneas de texto. */
export function ProductCardSkeleton() {
  return (
    <div className="block" aria-hidden>
      <ShimmerBox className="aspect-[4/5] w-full" />
      <div className="mt-5 space-y-2.5">
        <ShimmerBox className="h-3 w-24" />
        <ShimmerBox className="h-5 w-3/4" />
        <ShimmerBox className="h-3 w-1/2" />
        <ShimmerBox className="h-3 w-16" />
      </div>
    </div>
  );
}

/** Grid de N skeletons de ProductCard — usar en loading.tsx. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-24">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Card de orfebre — retrato 4:5 + 3 líneas de texto. */
export function ArtisanCardSkeleton() {
  return (
    <div className="block" aria-hidden>
      <ShimmerBox className="aspect-[4/5] w-full" />
      <div className="mt-5 space-y-2.5">
        <ShimmerBox className="h-3 w-32" />
        <ShimmerBox className="h-4 w-40" />
        <ShimmerBox className="h-12 w-full" />
      </div>
    </div>
  );
}

/** Hero genérico para loading.tsx de /sobre, /orfebres, etc. */
export function HeroSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <ShimmerBox className="h-10 w-48" />
      <ShimmerBox className="h-20 w-full max-w-2xl" />
      <ShimmerBox className="h-6 w-full max-w-xl" />
      <ShimmerBox className="h-6 w-3/4 max-w-xl" />
    </div>
  );
}
