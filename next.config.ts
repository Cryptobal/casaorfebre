import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
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
