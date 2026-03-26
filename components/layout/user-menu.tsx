"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const portalLink =
    user.role === "ADMIN"
      ? "/portal/admin"
      : user.role === "ARTISAN"
        ? "/portal/orfebre"
        : "/portal/comprador/pedidos";

  return (
    <div ref={menuRef} className="relative hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
        aria-label="Menú de usuario"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-border bg-surface py-2 shadow-lg">
          <div className="border-b border-border px-4 pb-2">
            <p className="text-sm font-medium text-text truncate">
              {user.name || "Usuario"}
            </p>
            <p className="text-xs text-text-tertiary truncate">{user.email}</p>
          </div>

          <Link
            href={portalLink}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
          >
            Mi Portal
          </Link>
          <Link
            href="/portal/comprador/favoritos"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
          >
            Favoritos
          </Link>
          <Link
            href="/portal/comprador/perfil"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
          >
            Mi Cuenta
          </Link>

          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full px-4 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-background hover:text-text"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
