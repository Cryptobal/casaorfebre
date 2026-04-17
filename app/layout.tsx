import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/auth-provider";
import { FavoritesProvider } from "@/lib/favorites-context";
import { GuestCartMerge } from "@/components/cart/guest-cart-merge";
import { RefCatcher } from "@/components/shared/ref-catcher";
import { GoogleAnalytics } from "@/components/analytics";
import { RoleSwitcherWrapper } from "@/components/shared/role-switcher-wrapper";
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Casa Orfebre · Joyería Artesanal de Plata en Chile",
    template: "%s",
  },
  description:
    "Marketplace curado de joyería artesanal de plata. Anillos, cadenas, aros, pulseras y collares hechos a mano por orfebres chilenos verificados. Plata 925 y 950 con certificado de autenticidad.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"
  ),
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "Casa Orfebre — Joyería de Autor",
    description:
      "Piezas únicas de orfebres chilenos verificados. Certificado de autenticidad digital con cada compra.",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    type: "website",
    url: "https://casaorfebre.cl",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630, alt: "Casa Orfebre — Joyería de Autor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Casa Orfebre — Joyería de Autor",
    description:
      "Piezas únicas de orfebres chilenos verificados. Certificado de autenticidad digital con cada compra.",
    images: ["/casaorfebre-og-image.png"],
    creator: "@casaorfebre",
    site: "@casaorfebre",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "theme-color": "#8B7355",
    "p:domain_verify": "a4fe96f8e14863db982efca5a0ea9a21",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${cormorantGaramond.variable} ${outfit.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://assets.casaorfebre.cl" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.casaorfebre.cl" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteJsonLd()) }}
        />
      </head>
      <body>
        <AuthProvider>
          <FavoritesProvider>
            <GuestCartMerge />
            <Suspense fallback={null}>
              <RefCatcher />
            </Suspense>
            {children}
            <Suspense fallback={null}>
              <RoleSwitcherWrapper />
            </Suspense>
          </FavoritesProvider>
        </AuthProvider>
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
