// GA4 E-commerce event helpers — SSR-safe, fire-and-forget

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category: string;
  item_brand: string;
  price: number;
  quantity: number;
  item_variant?: string;
}

type GtagFn = (...args: unknown[]) => void;

function gtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { gtag?: GtagFn }).gtag;
}

export function trackViewItem(item: GA4Item) {
  gtag()?.("event", "view_item", {
    currency: "CLP",
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: GA4Item) {
  gtag()?.("event", "add_to_cart", {
    currency: "CLP",
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackRemoveFromCart(item: GA4Item) {
  gtag()?.("event", "remove_from_cart", {
    currency: "CLP",
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackBeginCheckout(items: GA4Item[], value: number) {
  gtag()?.("event", "begin_checkout", {
    currency: "CLP",
    value,
    items,
  });
}

export function trackPurchase(
  transactionId: string,
  items: GA4Item[],
  value: number,
  shipping: number,
) {
  gtag()?.("event", "purchase", {
    transaction_id: transactionId,
    currency: "CLP",
    value,
    shipping,
    items,
  });
}

export function trackAddToWishlist(item: GA4Item) {
  gtag()?.("event", "add_to_wishlist", {
    currency: "CLP",
    value: item.price,
    items: [item],
  });
}

export function trackShare(method: string, contentType: string, itemId: string) {
  gtag()?.("event", "share", {
    method,
    content_type: contentType,
    item_id: itemId,
  });
}

export function trackSearch(searchTerm: string) {
  gtag()?.("event", "search", {
    search_term: searchTerm,
  });
}

export function trackViewItemList(listName: string, items: GA4Item[]) {
  gtag()?.("event", "view_item_list", {
    item_list_name: listName,
    items,
  });
}

export function trackSelectItem(listName: string, item: GA4Item) {
  gtag()?.("event", "select_item", {
    item_list_name: listName,
    items: [item],
  });
}
