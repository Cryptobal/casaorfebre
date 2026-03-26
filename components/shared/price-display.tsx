import { formatCLP, cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
}

export function PriceDisplay({ price, compareAtPrice, className }: PriceDisplayProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-medium text-text">{formatCLP(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-sm text-text-tertiary line-through">{formatCLP(compareAtPrice)}</span>
      )}
    </div>
  );
}
