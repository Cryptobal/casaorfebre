"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { openSearch } from "@/components/shared/search-modal";
import { cn } from "@/lib/utils";

const FAVORITES_PATH = "/portal/comprador/favoritos";

function isHiddenPath(pathname: string): boolean {
  if (pathname.startsWith("/portal")) return true;
  if (pathname.startsWith("/checkout")) return true;
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname === "/registro" || pathname.startsWith("/registro/")) return true;
  return false;
}

/** Ficha de producto: `/coleccion/[slug]` — no categorías ni listados conocidos. */
const COLLECTION_LIST_SLUGS = new Set([
  "anillos",
  "aniversario",
  "aros",
  "autorregalo",
  "categoria",
  "cobre",
  "colgantes",
  "collares",
  "compromiso",
  "dia-de-la-madre",
  "graduacion",
  "joyas-hombre",
  "joyas-mujer",
  "lapislazuli",
  "matrimonio",
  "oro",
  "piedras-naturales",
  "plata-925",
  "pulseras",
  "regalos",
  "cadenas-de-plata",
  "aros-de-plata",
  "anillos-de-plata",
  "pulseras-de-plata",
  "collares-de-plata",
  "colgantes-dijes-plata",
]);

function isProductDetailPath(pathname: string): boolean {
  const m = pathname.match(/^\/coleccion\/([^/]+)\/?$/);
  if (!m) return false;
  return !COLLECTION_LIST_SLUGS.has(m[1]);
}

function portalHref(role?: string): string {
  if (role === "ADMIN") return "/portal/admin";
  if (role === "ARTISAN") return "/portal/orfebre";
  return "/portal/comprador/pedidos";
}

function TabIcon({
  name,
  active,
}: {
  name: "home" | "collection" | "saved" | "account";
  active: boolean;
}) {
  const stroke = active ? "var(--color-accent-dark)" : "currentColor";
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "collection":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "saved":
      return (
        <svg {...common}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
        </svg>
      );
  }
}

function SparkleIcon() {
  /* Estrella de 4 puntas */
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2.5 13.8 10.2 21.5 12 13.8 13.8 12 21.5 10.2 13.8 2.5 12 10.2 10.2 12 2.5z" />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname() || "/";
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (isHiddenPath(pathname) || isProductDetailPath(pathname)) {
    return null;
  }

  const savedHref =
    status === "authenticated"
      ? FAVORITES_PATH
      : `/login?next=${encodeURIComponent(FAVORITES_PATH)}`;

  const accountHref =
    status === "authenticated" ? portalHref(role) : "/login";

  const tabs: {
    key: string;
    href: string;
    label: string;
    icon: "home" | "collection" | "saved" | "account";
    match: (p: string) => boolean;
  }[] = [
    {
      key: "home",
      href: "/",
      label: "Inicio",
      icon: "home",
      match: (p) => p === "/",
    },
    {
      key: "coleccion",
      href: "/coleccion",
      label: "Colección",
      icon: "collection",
      match: (p) => p.startsWith("/coleccion"),
    },
    {
      key: "saved",
      href: savedHref,
      label: "Guardado",
      icon: "saved",
      match: (p) => p.startsWith("/portal/comprador/favoritos"),
    },
    {
      key: "account",
      href: accountHref,
      label: "Cuenta",
      icon: "account",
      match: (p) => p.startsWith("/portal") || p.startsWith("/login"),
    },
  ];

  return (
    <nav
      className="mobile-tab-bar-glass glass fixed z-50 md:hidden"
      style={{
        left: 14,
        right: 14,
        bottom: "max(14px, env(safe-area-inset-bottom))",
        height: 66,
        borderRadius: 33,
      }}
      aria-label="Navegación principal"
    >
      <ul className="relative z-[1] grid h-full grid-cols-5 items-end px-1 pb-1.5">
        {/* Inicio */}
        <li className="flex justify-center">
          <TabLink tab={tabs[0]} pathname={pathname} />
        </li>
        {/* Colección */}
        <li className="flex justify-center">
          <TabLink tab={tabs[1]} pathname={pathname} />
        </li>
        {/* Engaste — búsqueda IA */}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={() => openSearch()}
            className="gem gem-appear"
            aria-label="Buscar con IA"
          >
            <SparkleIcon />
          </button>
        </li>
        {/* Guardado */}
        <li className="flex justify-center">
          <TabLink tab={tabs[2]} pathname={pathname} />
        </li>
        {/* Cuenta */}
        <li className="flex justify-center">
          <TabLink tab={tabs[3]} pathname={pathname} />
        </li>
      </ul>
    </nav>
  );
}

function TabLink({
  tab,
  pathname,
}: {
  tab: {
    href: string;
    label: string;
    icon: "home" | "collection" | "saved" | "account";
    match: (p: string) => boolean;
  };
  pathname: string;
}) {
  const active = tab.match(pathname);
  return (
    <Link
      href={tab.href}
      className={cn(
        "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 px-1",
        active ? "text-text" : "text-text-tertiary",
      )}
      aria-current={active ? "page" : undefined}
    >
      <TabIcon name={tab.icon} active={active} />
      <span
        className="uppercase"
        style={{
          fontSize: "8.5px",
          letterSpacing: "0.08em",
          color: active ? "var(--color-text)" : undefined,
        }}
      >
        {tab.label}
      </span>
    </Link>
  );
}
