import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/auth-provider";
import { GuestCartMerge } from "@/components/cart/guest-cart-merge";
import { RefCatcher } from "@/components/shared/ref-catcher";
import { GoogleAnalytics } from "@/components/analytics";
import { RoleSwitcherWrapper } from "@/components/shared/role-switcher-wrapper";
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

export const metadata: Metadata = {
  title: {
    default: "Casa Orfebre — Joyería de Autor",
    template: "%s | Casa Orfebre",
  },
  description:
    "Marketplace curado de joyería artesanal chilena. Piezas únicas de orfebres verificados, con certificado de autenticidad y garantía de compra segura.",
  keywords: [
    "joyería artesanal",
    "joyería de autor",
    "orfebres chilenos",
    "joyería chilena",
    "anillos artesanales",
    "collares artesanales",
    "plata 950",
    "oro 18k",
    "certificado de autenticidad",
    "Casa Orfebre",
    "joyas rusticas",
    "joyas organicas",
    "orfebres rusticos",
    "joyas con piedras",
    "joyas con significado",
    "anillos de compromiso artesanales",
    "anillos de matrimonio hechos a mano",
    "regalo joyería mujer Chile",
    "joyería para regalar",
    "aros de plata chilenos",
    "pulseras artesanales Chile",
    "colgantes de autor",
    "joyas personalizadas Chile",
    "joyería hecha a mano Santiago",
    "joyas únicas Chile",
    "joyería en cobre",
    "joyas de bronce artesanal",
    "filigrana chilena",
    "joyería con lapislázuli",
    "anillos con cuarzo",
    "joyas con piedras chilenas",
    "plata 925 Chile",
    "joyería con piedras naturales",
    "joyas con turquesa",
    "comprar joyas artesanales online Chile",
    "tienda joyas artesanales",
    "donde comprar joyería de autor Chile",
    "marketplace joyería Chile",
    "joyas artesanales envío a todo Chile",
    "regalo de aniversario joyería artesanal",
    "anillo de compromiso hecho a mano Chile",
    "collar artesanal piedras naturales",
    "joyería sustentable Chile",
    "joyas con historia",
    "apoyo artesanos chilenos",
    "joyería slow fashion",
    "pieza única joyería",
    "directorio orfebres Chile",
    "artesanos joyeros chilenos",
    "taller orfebrería Chile",
    "vender joyería artesanal Chile",
    "plataforma para orfebres",
    "donde vender joyas hechas a mano",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"
  ),
  openGraph: {
    title: "Casa Orfebre — Joyería de Autor",
    description:
      "Piezas únicas de orfebres chilenos verificados. Certificado de autenticidad digital con cada compra.",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    type: "website",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
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
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <AuthProvider>
          <GuestCartMerge />
          <RefCatcher />
          {children}
          <RoleSwitcherWrapper />
        </AuthProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
