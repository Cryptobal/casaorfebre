import { cn } from "@/lib/utils";
import { type LabelHTMLAttributes, forwardRef } from "react";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("block text-sm font-medium text-text", className)}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";
