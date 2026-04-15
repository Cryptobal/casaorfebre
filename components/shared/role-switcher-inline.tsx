"use client";

import { useState, useTransition } from "react";
import { switchActiveRole } from "@/lib/actions/role-switcher";

const ROLES = [
  { key: "ADMIN" as const, label: "Admin", color: "bg-red-600" },
  { key: "ARTISAN" as const, label: "Orfebre", color: "bg-[#8B7355]" },
  { key: "BUYER" as const, label: "Comprador", color: "bg-blue-600" },
];

export function RoleSwitcherInline({ currentRole }: { currentRole: string }) {
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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-label="Cambiar vista de rol"
        className={`flex items-center gap-1.5 rounded-full ${active.color} px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all min-h-[36px] hover:opacity-90 active:scale-95 disabled:opacity-70`}
      >
        {isPending ? (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
        )}
        <span>{active.label}</span>
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-surface p-2 shadow-lg">
            <p className="mb-1 px-2 pt-1 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
              Viendo como
            </p>
            <div className="space-y-0.5">
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleSwitch(role.key)}
                  disabled={isPending}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors min-h-[40px] ${
                    role.key === currentRole
                      ? "bg-background text-text"
                      : "text-text-secondary hover:bg-background hover:text-text"
                  } disabled:opacity-50`}
                >
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${role.color}`} />
                  <span>{role.label}</span>
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
    </div>
  );
}
