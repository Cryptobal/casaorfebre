export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-border" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5">
            {/* Avatar circle */}
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-border" />
            <div className="flex-1 space-y-2">
              {/* Name */}
              <div className="h-5 w-2/3 animate-pulse rounded bg-border" />
              {/* Location */}
              <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
