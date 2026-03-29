import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/portal/",
          "/api/",
          "/checkout/",
          "/_next/",
          "/login",
          "/registro",
          "/recuperar-contrasena",
          "/verificar",
          "/social/",
          "/manifest.json",
          "/carrito",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
