"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }
    : null;

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <nav
        className={cn(
          "flex items-center justify-between border-b bg-background/92 px-[clamp(20px,5vw,56px)] py-[18px] backdrop-blur-[8px] transition-[border-color] duration-300 ease-out",
          scrolled ? "border-border" : "border-transparent"
        )}
      >
        <Link
          href="/"
          className="font-serif text-[19px] font-light tracking-[0.22em] text-text transition-colors duration-[250ms] ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          casa orfebre
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/blog"
            className="text-[11px] font-normal uppercase tracking-[0.2em] text-text-secondary transition-colors duration-[250ms] ease-out hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Blog
          </Link>
          {status === "authenticated" && user ? <UserMenu user={user} /> : null}
        </div>
      </nav>
    </header>
  );
}
