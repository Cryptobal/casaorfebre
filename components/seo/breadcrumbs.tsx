import Link from "next/link";
import { JsonLd } from "./json-ld";
import { generateBreadcrumbJsonLd } from "@/lib/seo";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLdItems = items.map((item) => ({
    name: item.label,
    url: item.href || "",
  }));

  return (
    <>
      <JsonLd data={generateBreadcrumbJsonLd(jsonLdItems)} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 font-sans text-sm text-text-tertiary">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <span className="text-text-tertiary/50" aria-hidden="true">
                    ›
                  </span>
                )}
                {isLast || !item.href ? (
                  <span className="text-text-secondary">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
