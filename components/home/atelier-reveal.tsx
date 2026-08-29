"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Replica el reveal de docs/mockup-onepager.html:
 * translateY(18px), 0.9s ease, threshold 0.08.
 * Solo oculta el bloque si nace debajo del fold (como el mockup).
 */
export function AtelierReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight) {
      return;
    }

    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = "opacity .9s ease, transform .9s ease";

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.style.opacity = "1";
          target.style.transform = "none";
          io.unobserve(target);
        }
      },
      { threshold: 0.08 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
