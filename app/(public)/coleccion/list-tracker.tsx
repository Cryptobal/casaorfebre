"use client";

import { useEffect } from "react";
import { trackViewItemList, type GA4Item } from "@/lib/analytics-events";

export function ListTracker({ listName, items }: { listName: string; items: GA4Item[] }) {
  useEffect(() => {
    trackViewItemList(listName, items);
  }, [listName]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
