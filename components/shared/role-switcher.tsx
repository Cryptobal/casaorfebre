"use client";

import { useState, useTransition } from "react";
import { switchActiveRole } from "@/lib/actions/role-switcher";

const ROLES = [
  { key: "ADMIN" as const, label: "Admin", color: "bg-red-600", ring: "ring-red-400" },
  { key: "ARTISAN" as const, label: "Orfebre", color: "bg-[#8B7355]", ring: "ring-[#8B7355]/50" },
  { key: "BUYER" as const, label: "Comprador", color: "bg-blue-600", ring: "ring-blue-400" },
];

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="fixed bottom-14 left-4 z-50 md:left-60">
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Popover */}
          <div className="absolute bottom-14 left-0 z-50 w-52 rounded-lg border border-border bg-surface p-3 shadow-lg">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">
              Viendo como
            </p>
            <div className="space-y-1">
              {ROLES.map((role) => (
                <button
                  key={role.key}
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
                    <svg className="ml-auto h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={`flex items-center gap-2 rounded-full ${active.color} px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all min-h-[44px] hover:opacity-90 active:scale-95 disabled:opacity-70 ring-2 ring-offset-2 ring-offset-background ${active.ring}`}
      >
        {isPending ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )}
        {active.label}
      </button>
    </div>
  );
}
