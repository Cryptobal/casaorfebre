interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ title, subtitle, className, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <Tag className="font-serif text-3xl font-light tracking-tight text-text sm:text-4xl">
        {title}
      </Tag>
      {subtitle && (
        <p className="mt-3 text-sm font-light text-text-secondary sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
