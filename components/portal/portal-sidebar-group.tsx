"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PortalSidebarGroup({
  label,
  count = 0,
  hrefs,
  storageKey,
  children,
}: {
  label: string;
  count?: number;
  hrefs: string[];
  storageKey: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const containsActive = hrefs.some(
    (h) => pathname === h || pathname.startsWith(h + "/"),
  );

  const [open, setOpen] = useState<boolean>(containsActive);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`co-sidebar-${storageKey}`);
      if (stored === "1") setOpen(true);
      else if (stored === "0") setOpen(false);
      else setOpen(containsActive);
    } catch {
      setOpen(containsActive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(`co-sidebar-${storageKey}`, next ? "1" : "0");
      } catch {
        // ignore quota / privacy errors
      }
      return next;
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
          containsActive
            ? "text-text"
            : "text-text-secondary hover:bg-background hover:text-text"
        }`}
      >
        <span className="flex items-center gap-2 font-medium">
          {label}
          {count > 0 && (
            <span className="min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      {open && (
        <div className="ml-2 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {children}
        </div>
      )}
    </div>
  );
}
