import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

const variantStyles: Record<AlertVariant, string> = {
  info: "border-accent/20 bg-accent/5 text-text-secondary",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}

/**
 * Consistent status banner. Replaces the ad-hoc `border-*-200 bg-*-50`
 * blocks scattered across the app (success / warning / error / info).
 */
export function Alert({ variant = "info", className, children }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
