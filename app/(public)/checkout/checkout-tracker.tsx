"use client";

import { useEffect } from "react";
import { trackBeginCheckout, type GA4Item } from "@/lib/analytics-events";

export function CheckoutTracker({ items, value }: { items: GA4Item[]; value: number }) {
  useEffect(() => {
    trackBeginCheckout(items, value);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
