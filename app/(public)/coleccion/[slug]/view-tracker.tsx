"use client";

import { useEffect } from "react";
import { incrementProductView } from "@/lib/actions/views";

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    incrementProductView(slug);
  }, [slug]);

  return null;
}
