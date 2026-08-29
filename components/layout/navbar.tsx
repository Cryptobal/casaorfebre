"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

function NavbarUser() {
  const { data: session, status } = useSession();
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string }).role,
      }
    : null;

  if (status !== "authenticated" || !user) return null;
  return <UserMenu user={user} />;
}

export function Navbar() {
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

  return (
    <nav
      className={cn(
        "fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b bg-background/92 px-[clamp(20px,5vw,56px)] py-[18px] backdrop-blur-[8px] transition-[border-color] duration-300 ease-[ease]",
        scrolled ? "border-border" : "border-transparent"
      )}
    >
      <Link
        href="/"
        className="font-serif text-[19px] font-light leading-none tracking-[0.22em] text-text transition-[color] duration-[250ms] ease-[ease] hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        casa orfebre
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/blog"
          className="text-[11px] font-normal leading-none uppercase tracking-[0.2em] text-text-secondary transition-[color] duration-[250ms] ease-[ease] hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Blog
        </Link>
        <Suspense fallback={null}>
          <NavbarUser />
        </Suspense>
      </div>
    </nav>
  );
}
