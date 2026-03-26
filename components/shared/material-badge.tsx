import { cn } from "@/lib/utils";

interface MaterialBadgeProps {
  material: string;
  className?: string;
}

export function MaterialBadge({ material, className }: MaterialBadgeProps) {
  return (
    <span className={cn("inline-block rounded-full border border-border px-2.5 py-0.5 text-xs font-light text-text-secondary", className)}>
      {material}
    </span>
  );
}
