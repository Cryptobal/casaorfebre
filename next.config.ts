import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    const securityHeaders = [
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
    ];

    const noIndexHeaders = [
      ...securityHeaders,
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/_next/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/manifest.json",
        headers: noIndexHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Prefijo /es (p. ej. favoritos): misma app; URLs canónicas sin prefijo de idioma
      { source: "/es", destination: "/", permanent: false },
      { source: "/es/:path*", destination: "/:path*", permanent: false },
      { source: "/artesano/panel", destination: "/portal/orfebre", permanent: true },
      { source: "/artesano/productos", destination: "/portal/orfebre/productos", permanent: true },
      { source: "/artesano/preguntas", destination: "/portal/orfebre/preguntas", permanent: true },
      { source: "/artesano/pagos", destination: "/portal/orfebre/finanzas", permanent: true },
      { source: "/artesano/pedidos/:path*", destination: "/portal/orfebre/pedidos", permanent: true },
      { source: "/mis-pedidos", destination: "/portal/comprador/pedidos", permanent: true },
      { source: "/explorar", destination: "/coleccion", permanent: true },
      // Landing page consolidation: singular → plural
      { source: "/para-comprador", destination: "/para-compradores", permanent: true },
      { source: "/para-orfebre", destination: "/para-orfebres", permanent: true },
      { source: "/para-pionero", destination: "/pioneros", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "assets.casaorfebre.cl",
      },
    ],
  },
};

export default nextConfig;
