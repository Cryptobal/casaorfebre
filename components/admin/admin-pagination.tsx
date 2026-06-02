import Link from "next/link";

interface AdminPaginationProps {
  basePath: string;
  /** Current search params to preserve (everything except `page`). */
  params: Record<string, string | string[] | undefined>;
  page: number;
  totalPages: number;
}

/** Build a windowed list of page numbers, using -1 as an ellipsis marker. */
function pageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1);
    result.push(sorted[i]);
  }
  return result;
}

function buildHref(
  basePath: string,
  params: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k !== "page" && typeof v === "string" && v) sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export function AdminPagination({ basePath, params, page, totalPages }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const window = pageWindow(page, totalPages);
  const linkBase =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition-colors";

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="Paginación">
      {page > 1 && (
        <Link
          href={buildHref(basePath, params, page - 1)}
          className={`${linkBase} border border-border text-text-secondary hover:border-accent/50 hover:text-text`}
        >
          ← Anterior
        </Link>
      )}
      {window.map((p, i) =>
        p === -1 ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-text-tertiary">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, params, p)}
            className={`${linkBase} ${
              p === page
                ? "bg-accent text-white"
                : "border border-border text-text-secondary hover:border-accent/50 hover:text-text"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link
          href={buildHref(basePath, params, page + 1)}
          className={`${linkBase} border border-border text-text-secondary hover:border-accent/50 hover:text-text`}
        >
          Siguiente →
        </Link>
      )}
    </nav>
  );
}
