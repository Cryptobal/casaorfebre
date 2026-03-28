const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collares",
  ANILLO: "Anillos",
  PULSERA: "Pulseras",
  BROCHE: "Broches",
  COLGANTE: "Colgantes",
  OTRO: "Otros",
};

const CATEGORY_SLUGS: Record<string, string> = {
  AROS: "aros",
  COLLAR: "collares",
  ANILLO: "anillos",
  PULSERA: "pulseras",
  BROCHE: "coleccion",
  COLGANTE: "colgantes",
  OTRO: "coleccion",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export function getCategorySlug(category: string): string {
  return CATEGORY_SLUGS[category] || "coleccion";
}

export function canonicalUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

interface ProductItem {
  name: string;
  slug: string;
  images?: { url: string }[];
  price?: number;
}

export function buildCollectionWithItemsJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  products: ProductItem[];
}): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${BASE_URL}${opts.url}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.products.length,
      itemListElement: opts.products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          url: `${BASE_URL}/coleccion/${p.slug}`,
          ...(p.images?.[0]?.url ? { image: p.images[0].url } : {}),
          ...(p.price
            ? {
                offers: {
                  "@type": "Offer",
                  price: p.price,
                  priceCurrency: "CLP",
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
        },
      })),
    },
  });
}
