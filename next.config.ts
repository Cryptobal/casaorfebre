import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
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
