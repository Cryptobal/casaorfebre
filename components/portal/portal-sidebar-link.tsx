"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function AiBadge() {
  return (
    <span className="ml-1 inline-flex items-center rounded-full border border-[#8B7355]/30 bg-[#8B7355]/10 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-[#8B7355]">
      AI
    </span>
  );
}

export function PortalSidebarLink({
  href,
  label,
  count = 0,
  dataTour,
  ai,
  exact,
}: {
  href: string;
  label: string;
  count?: number;
  dataTour?: string;
  ai?: boolean;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      data-tour={dataTour}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-background font-medium text-accent"
          : "text-text-secondary hover:bg-background hover:text-text"
      }`}
    >
      <span className="flex items-center">
        {label}
        {ai && <AiBadge />}
      </span>
      {count > 0 && (
        <span className="min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
