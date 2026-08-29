"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

function groupIsActive(pathname: string, hrefs: string[]) {
  return hrefs.some((h) => pathname === h || pathname.startsWith(h + "/"));
}

function readStoredOpen(storageKey: string): boolean | null {
  try {
    const stored = window.localStorage.getItem(`co-sidebar-${storageKey}`);
    if (stored === "1") return true;
    if (stored === "0") return false;
    return null;
  } catch {
    return null;
  }
}

/** Ruta activa siempre abierta; si no, preferencia guardada; si no, defaultCollapsed (undefined = colapsado, como en marketplace). */
function resolveOpen(
  containsActive: boolean,
  defaultCollapsed: boolean | undefined,
  stored: boolean | null,
): boolean {
  if (containsActive) return true;
  if (stored !== null) return stored;
  if (defaultCollapsed === undefined) return false;
  return !defaultCollapsed;
}

export function PortalSidebarGroup({
  label,
  count = 0,
  hrefs,
  storageKey,
  defaultCollapsed,
  children,
}: {
  label: string;
  count?: number;
  hrefs: string[];
  storageKey: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const containsActive = groupIsActive(pathname, hrefs);

  const [open, setOpen] = useState<boolean>(() =>
    resolveOpen(containsActive, defaultCollapsed, null),
  );

  useEffect(() => {
    setOpen(resolveOpen(containsActive, defaultCollapsed, readStoredOpen(storageKey)));
    // Solo re-leer storage al cambiar de grupo; containsActive se cubre en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, defaultCollapsed]);

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
        className={`flex w-full items-start justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
          containsActive
            ? "text-text"
            : "text-text-secondary hover:bg-background hover:text-text"
        }`}
      >
        <span className="flex min-w-0 flex-1 items-start gap-2 text-left font-medium leading-snug">
          <span className="min-w-0 break-words">{label}</span>
          {count > 0 && (
            <span className="mt-0.5 min-w-[1.25rem] shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
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
          className={`mt-1 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
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
