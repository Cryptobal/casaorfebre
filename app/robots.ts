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
          "/login",
          "/registro",
          "/recuperar-contrasena",
          "/verificar",
          "/social/",
          "/carrito",
          "/wishlist",
          "/*?*utm_",
          "/*?*ref=",
          "/*?*fbclid=",
          "/*?*gclid=",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/portal/", "/api/", "/checkout/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/portal/", "/api/", "/checkout/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
