import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
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
      <body>{children}</body>
    </html>
  );
}
