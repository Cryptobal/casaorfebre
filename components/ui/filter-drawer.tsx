"use client";

import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function FilterDrawer({
  open,
  onClose,
  title = "Filtros",
  children,
  footer,
}: FilterDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 transition-visibility duration-300",
        open ? "visible" : "invisible",
      )}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, right sheet on md+ */}
      <div
        ref={panelRef}
        className={cn(
          "absolute flex flex-col bg-surface shadow-2xl transition-transform duration-300 ease-out",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl",
          // Desktop: right sheet
          "md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-[380px] md:max-h-none md:rounded-t-none md:rounded-l-2xl",
          // Animation
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-lg font-light">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-border/50 hover:text-text"
            aria-label="Cerrar filtros"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
