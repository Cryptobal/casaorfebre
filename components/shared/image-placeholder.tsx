import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  name: string;
  className?: string;
}

export function ImagePlaceholder({ name, className }: ImagePlaceholderProps) {
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br from-border to-background", className)}>
      <span className="px-4 text-center font-serif text-lg font-light italic text-text-tertiary">{name}</span>
    </div>
  );
}
