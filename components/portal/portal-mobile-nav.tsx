"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileNavItem =
  | {
      kind: "link";
      href: string;
      label: string;
      badge?: number;
      ai?: boolean;
      exact?: boolean;
    }
  | { kind: "heading"; label: string };

interface PortalMobileNavProps {
  title: string;
  items: MobileNavItem[];
}

export function PortalMobileNav({ title, items }: PortalMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const panel =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        {/* Drawer */}
        <aside className="fixed inset-y-0 left-0 z-[61] flex w-72 flex-col bg-surface shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <span className="text-sm font-medium text-text">{title}</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {items.map((item, idx) => {
                if (item.kind === "heading") {
                  return (
                    <p
                      key={`h-${idx}-${item.label}`}
                      className="mb-1 mt-4 px-3 text-xs font-medium uppercase tracking-widest text-text-tertiary first:mt-0"
                    >
                      {item.label}
                    </p>
                  );
                }
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const badgeBg =
                  item.href.startsWith("/portal/orfebre") && item.badge != null && item.badge > 0
                    ? "bg-amber-500"
                    : "bg-accent";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-accent/10 font-medium text-accent"
                        : "text-text-secondary hover:bg-background hover:text-text"
                    }`}
                  >
                    <span className="flex items-center">
                      {item.label}
                      {item.ai && (
                        <span className="ml-1 inline-flex items-center rounded-full border border-[#8B7355]/30 bg-[#8B7355]/10 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-[#8B7355]">
                          AI
                        </span>
                      )}
                    </span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white ${badgeBg}`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
          {/* Footer */}
          <div className="border-t border-border p-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-text-tertiary transition-colors hover:text-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver al sitio
            </Link>
          </div>
        </aside>
      </>,
      document.body
    );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de navegación"
        className="flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      {panel}
    </div>
  );
}
