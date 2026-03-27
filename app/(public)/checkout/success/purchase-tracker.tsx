"use client";

import { useEffect, useRef } from "react";
import { trackPurchase, type GA4Item } from "@/lib/analytics-events";

interface PurchaseTrackerProps {
  transactionId: string;
  items: GA4Item[];
  value: number;
  shipping: number;
}

export function PurchaseTracker({ transactionId, items, value, shipping }: PurchaseTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackPurchase(transactionId, items, value, shipping);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
