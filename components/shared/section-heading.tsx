interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <h2 className="font-serif text-3xl font-light tracking-tight text-text sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm font-light text-text-secondary sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
