"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { switchActiveRole } from "@/lib/actions/role-switcher";

const ROLES = [
  { key: "ADMIN" as const, label: "Admin", color: "bg-red-600" },
  { key: "ARTISAN" as const, label: "Orfebre", color: "bg-accent" },
  { key: "BUYER" as const, label: "Comprador", color: "bg-blue-600" },
];

export function RoleSwitcherInline({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuId = useId();

  const active = ROLES.find((r) => r.key === currentRole) || ROLES[0];

  function handleSwitch(role: "ADMIN" | "ARTISAN" | "BUYER") {
    if (role === currentRole) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await switchActiveRole(role);
    });
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-tertiary transition-colors hover:text-accent disabled:opacity-70"
      >
        {isPending ? (
          <svg className="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )}
        <span className="min-w-0 flex-1 truncate text-left">
          Cambiar vista · {active.label}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            id={menuId}
            role="menu"
            aria-label="Cambiar vista de rol"
            className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-lg border border-border bg-surface p-3 shadow-lg"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">
              Viendo como
            </p>
            <div className="space-y-1">
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSwitch(role.key)}
                  disabled={isPending}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                    role.key === currentRole
                      ? "bg-background text-text"
                      : "text-text-secondary hover:bg-background hover:text-text"
                  } disabled:opacity-50`}
                >
                  <span className={`inline-block h-3 w-3 rounded-full ${role.color}`} />
                  {role.label}
                  {role.key === currentRole && (
                    <svg className="ml-auto h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
