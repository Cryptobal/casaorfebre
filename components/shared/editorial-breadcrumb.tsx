import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EditorialBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb tipográfico editorial.
 * - Outfit uppercase tracking-[0.15em] text-[11px].
 * - Separador en color border-soft, no caracteres ASCII.
 * - El último ítem no es link (es la página actual).
 */
export function EditorialBreadcrumb({ items, className = "" }: EditorialBreadcrumbProps) {
  return (
    <nav aria-label="Ruta de navegación" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 text-[11px] font-light uppercase tracking-[0.15em] text-text-tertiary">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-x-2">
              {i > 0 && <span className="text-[color:var(--color-border)]">/</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-text"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-text-secondary">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
