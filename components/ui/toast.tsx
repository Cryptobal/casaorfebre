"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TOAST_EVENT = "casaorfebre:toast";
const TOAST_DURATION_MS = 3500;

export interface ToastPayload {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

/** Fire-and-forget toast from anywhere on the client. */
export function showToast(payload: ToastPayload) {
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

interface ActiveToast extends ToastPayload {
  id: number;
}

/**
 * Minimal global toast outlet (no external deps). Mount once per layout.
 * Positioned above the mobile sticky bars; bottom-right on desktop.
 */
export function Toaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    let nextId = 1;
    function onToast(e: Event) {
      const detail = (e as CustomEvent<ToastPayload>).detail;
      if (!detail?.message) return;
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-2), { ...detail, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION_MS);
    }
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-4 rounded-lg border border-border bg-text px-4 py-3 text-sm text-background shadow-xl animate-[toast-in_0.25s_ease-out]"
        >
          <span className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-green-400"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {toast.message}
          </span>
          {toast.actionLabel && toast.actionHref && (
            <Link
              href={toast.actionHref}
              className="shrink-0 font-medium text-accent-light underline-offset-4 hover:underline"
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
            >
              {toast.actionLabel}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
