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
  id?: string;
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
    ...(product.id ? { sku: `CO-${product.id}`, mpn: `CO-${product.id}` } : {}),
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
      shippingDetails: buildShippingDetails(),
      hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
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
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  images?: { url: string }[];
  price?: number;
  stock?: number | null;
}

function buildShippingDetails() {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: 0,
      currency: "CLP",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "CL",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 2,
        maxValue: 7,
        unitCode: "DAY",
      },
    },
  };
}

function buildMerchantReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "CL",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 10,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };
}

function buildProductListItem(p: ProductItem) {
  const productUrl = `${BASE_URL}/coleccion/${p.slug}`;
  const image =
    p.images && p.images.length > 0
      ? p.images.map((img) => img.url)
      : [`${BASE_URL}/casaorfebre-og-image.png`];
  const description =
    (p.description && p.description.trim().length > 0
      ? p.description
      : `${p.name} — joya artesanal hecha a mano por orfebres chilenos verificados en Casa Orfebre.`);
  const sku = p.id ? `CO-${p.id}` : undefined;

  return {
    "@type": "Product",
    name: p.name,
    description,
    image,
    url: productUrl,
    ...(sku ? { sku, mpn: sku } : {}),
    brand: {
      "@type": "Brand",
      name: "Casa Orfebre",
    },
    ...(p.price
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "CLP",
            url: productUrl,
            availability:
              p.stock !== undefined && p.stock !== null && p.stock <= 0
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: "Casa Orfebre",
            },
            shippingDetails: buildShippingDetails(),
            hasMerchantReturnPolicy: buildMerchantReturnPolicy(),
          },
        }
      : {}),
  };
}

export function generateItemListJsonLd(products: ProductItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: buildProductListItem(p),
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

export function generateDetailedLocalBusinessJsonLd(opts: {
  name: string;
  description: string;
  streetAddress: string;
  city: string;
  region: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: opts.name,
    description: opts.description,
    url: BASE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: opts.streetAddress,
      addressLocality: opts.city,
      addressRegion: opts.region,
      ...(opts.postalCode && { postalCode: opts.postalCode }),
      addressCountry: "CL",
    },
    ...(opts.lat !== undefined && opts.lng !== undefined && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: opts.lat,
        longitude: opts.lng,
      },
    }),
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
        item: buildProductListItem(p),
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
