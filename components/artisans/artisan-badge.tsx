interface ArtisanBadgeProps {
  badgeType: string | null;
  badgeText: string | null;
  size?: "sm" | "md";
}

export function ArtisanBadge({ badgeType, badgeText, size = "sm" }: ArtisanBadgeProps) {
  if (!badgeType || !badgeText) return null;

  const styles =
    badgeType === "maestro"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  const iconColor = badgeType === "maestro" ? "text-amber-500" : "text-blue-500";

  const sizeClasses = size === "md" ? "px-3 py-1 text-xs gap-1.5" : "px-2 py-0.5 text-[11px] gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${styles} ${sizeClasses}`}
    >
      <svg
        className={`h-3 w-3 ${iconColor}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      {badgeText}
    </span>
  );
}
