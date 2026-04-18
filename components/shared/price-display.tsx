import { formatCLP, cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  /** @deprecated editorial v1 no renderiza precio tachado; se mantiene para trazabilidad en DB. */
  compareAtPrice?: number | null;
  className?: string;
}

export function PriceDisplay({ price, className }: PriceDisplayProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-medium text-text">{formatCLP(price)}</span>
    </div>
  );
}
