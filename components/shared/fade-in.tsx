"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Distancia inicial en px. Default 24 (translate-y-6). El mockup atelier usa 18. */
  offsetPx?: number;
  /** Duración en ms. Default 700. El mockup atelier usa 900. */
  durationMs?: number;
}

export function FadeIn({
  children,
  delay = 0,
  className,
  offsetPx = 24,
  durationMs = 700,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect reduced-motion: show content immediately, no fade/translate.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    // threshold 0: con elementos muy altos (p. ej. cuerpo de un blog largo), un umbral
    // del 10 % puede nunca alcanzarse en móvil (viewport / altura del bloque < 0.1),
    // dejando el contenido invisible de forma permanente.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: "0px 0px 32px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const customReveal = offsetPx !== 24 || durationMs !== 700;

  return (
    <div
      ref={ref}
      className={cn(
        !customReveal && "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : !customReveal && "translate-y-6 opacity-0",
        customReveal && (visible ? "opacity-100" : "opacity-0"),
        className
      )}
      style={
        customReveal
          ? {
              transition: `opacity ${durationMs}ms ease, transform ${durationMs}ms ease`,
              transform: visible ? "none" : `translateY(${offsetPx}px)`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
