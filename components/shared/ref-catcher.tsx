"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Captures ?ref= query param from the URL and stores it in localStorage
 * so the registration page can use it even if the user browses around first.
 */
export function RefCatcher() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("casa_ref", ref);
    }
  }, [searchParams]);

  return null;
}
