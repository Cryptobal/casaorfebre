const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

/* ─── Breadcrumb ─── */

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return buildBreadcrumbJsonLd(items);
}

/* ─── Product ─── */

interface ProductForJsonLd {
  name: string;
  description: string;
  slug: string;
  price: number;
  stock?: number;
  images?: { url: string }[];
  artisan?: { displayName: string; slug?: string };
  productionType?: string;
}

export function generateProductJsonLd(product: ProductForJsonLd) {
  const productUrl = `${BASE_URL}/coleccion/${product.slug}`;
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [`${BASE_URL}/casaorfebre-og-image.png`];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "Casa Orfebre",
    },
    ...(product.artisan
      ? {
          manufacturer: {
            "@type": "Person",
            name: product.artisan.displayName,
            ...(product.artisan.slug
              ? { url: `${BASE_URL}/orfebres/${product.artisan.slug}` }
              : {}),
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CLP",
      url: productUrl,
      availability:
        product.stock !== undefined && product.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Casa Orfebre",
      },
    },
  };
}

/* ─── FAQ ─── */

interface FAQ {
  question: string;
  answer: string;
}

export function generateFAQJsonLd(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/* ─── ItemList ─── */

interface ProductItem {
  name: string;
  slug: string;
  images?: { url: string }[];
  price?: number;
}

export function generateItemListJsonLd(products: ProductItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
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
  };
}

/* ─── Organization ─── */

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Casa Orfebre",
    url: BASE_URL,
    logo: `${BASE_URL}/casaorfebre-logo-compact.svg`,
    image: `${BASE_URL}/casaorfebre-og-image.png`,
    description:
      "Marketplace curado de joyería artesanal de plata. Anillos, cadenas, aros, pulseras y collares hechos a mano por orfebres chilenos verificados.",
    sameAs: ["https://www.instagram.com/casaorfebre.cl"],
  };
}

/* ─── LocalBusiness ─── */

export function generateLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#business`,
    name: "Casa Orfebre",
    url: BASE_URL,
    logo: `${BASE_URL}/casaorfebre-logo-compact.svg`,
    image: `${BASE_URL}/casaorfebre-og-image.png`,
    description:
      "Joyería artesanal de plata hecha a mano por orfebres chilenos verificados. Plata 925 y 950 con certificado de autenticidad.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CL",
    },
    priceRange: "$$",
    currenciesAccepted: "CLP",
    paymentAccepted: "Tarjeta de crédito, Tarjeta de débito",
  };
}

/* ─── Collection page (existing, updated to return object) ─── */

export function buildCollectionWithItemsJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  products: ProductItem[];
}) {
  return {
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
  };
}

/* ─── Category helpers ─── */

const CATEGORY_LABELS: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collares",
  ANILLO: "Anillos",
  PULSERA: "Pulseras",
  BROCHE: "Broches",
  COLGANTE: "Colgantes",
  CADENA: "Cadenas",
  OTRO: "Otros",
};

const CATEGORY_SLUGS: Record<string, string> = {
  AROS: "aros",
  COLLAR: "collares",
  ANILLO: "anillos",
  PULSERA: "pulseras",
  BROCHE: "coleccion",
  COLGANTE: "colgantes",
  CADENA: "cadenas",
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
