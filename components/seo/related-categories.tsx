import Link from "next/link";

interface RelatedCategory {
  name: string;
  href: string;
  icon?: string;
}

interface RelatedCategoriesProps {
  categories: RelatedCategory[];
  title?: string;
  className?: string;
}

export function RelatedCategories({
  categories,
  title = "Categorías relacionadas",
  className = "",
}: RelatedCategoriesProps) {
  return (
    <div className={className}>
      <h3 className="font-serif text-lg font-light text-text">
        {title}
      </h3>
      <div className="mt-2 h-px w-8 bg-accent" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group flex flex-col items-center justify-center rounded-lg border border-border bg-surface/50 p-4 text-center transition-all hover:border-accent hover:bg-surface"
          >
            {category.icon && (
              <span className="text-2xl">{category.icon}</span>
            )}
            <span className="mt-2 font-sans text-sm font-medium text-text group-hover:text-accent">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
