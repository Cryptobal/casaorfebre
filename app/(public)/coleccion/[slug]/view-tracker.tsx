"use client";

import { useEffect } from "react";
import { incrementProductView } from "@/lib/actions/views";
import { trackViewItem, type GA4Item } from "@/lib/analytics-events";

interface ViewTrackerProps {
  slug: string;
  ga4Item?: GA4Item;
}

export function ViewTracker({ slug, ga4Item }: ViewTrackerProps) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    incrementProductView(slug);
    if (ga4Item) trackViewItem(ga4Item);
  }, [slug, ga4Item]);

  return null;
}
