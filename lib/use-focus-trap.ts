"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside `ref` while `active` is true, handles Escape, and
 * restores focus to the previously focused element when deactivated. Use for
 * modal dialogs / drawers so keyboard and screen-reader users can't tab out.
 *
 * The container should have `tabIndex={-1}` so it can receive focus as a
 * fallback when it has no focusable children.
 */
export function useFocusTrap(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onEscape?: () => void,
) {
  // Keep the latest callback in a ref so inline arrow callbacks at call sites
  // don't re-trigger the effect on every parent render. Without this, each
  // keystroke in e.g. the search modal would re-run the trap and yank focus
  // back to the first focusable element.
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      );

    // Move focus into the dialog on open.
    const focusables = getFocusable();
    (focusables[0] ?? node).focus({ preventScroll: true });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active, ref, onEscape]);
}
