export const revalidate = 60;
export const dynamic = "force-static";

import { prisma } from "@/lib/prisma";
import {
  getLatestProducts,
  getCuratorPicks,
  getFeaturedOfMonth,
} from "@/lib/queries/products";
import { getFeaturedArtisans } from "@/lib/queries/artisans";
import { HeroSection } from "@/components/home/hero-section";
import { ManifestoSection } from "@/components/home/manifesto-section";
import { PiezaDelMesSection } from "@/components/home/pieza-del-mes-section";
import { CuratorPicksSection } from "@/components/home/curator-picks-section";
import { FeaturedArtisansSection } from "@/components/home/featured-artisans-section";
import { StoriesSection } from "@/components/home/stories-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { BuyerTour } from "@/components/guided-tour/BuyerTour";
import { auth } from "@/lib/auth";
import { generateItemListJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata = {
  title: "Casa Orfebre — Joyería de autor, hecha en Chile",
  description:
    "Galería editorial de joyería chilena. Piezas únicas y ediciones limitadas de orfebres independientes verificados. Autenticidad garantizada, certificado digital con QR.",
  alternates: { canonical: "https://casaorfebre.cl" },
  openGraph: {
    type: "website" as const,
    title: "Casa Orfebre — Joyería de autor",
    description:
      "Galería editorial de joyería chilena. Piezas únicas de orfebres verificados.",
    url: "https://casaorfebre.cl",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Casa Orfebre — Joyería de autor",
    description: "Galería editorial de joyería chilena.",
    creator: "@casaorfebre",
    site: "@casaorfebre",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function HomePage() {
  const session = await auth();

  const [latestProducts, featuredArtisans, curatorPicks, piezaDelMes, blogPosts] =
    await Promise.all([
      getLatestProducts(8),
      // Subimos el límite para filtrar luego por portrait + ≥3 piezas.
      getFeaturedArtisans(12),
      getCuratorPicks(6),
      getFeaturedOfMonth(),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          category: true,
          coverImage: true,
          publishedAt: true,
        },
      }),
    ]);

  const itemListJsonLd = generateItemListJsonLd(latestProducts);

  return (
    <>
      <BuyerTour isLoggedIn={!!session?.user?.id} />
      <JsonLd data={itemListJsonLd} />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Manifiesto */}
      <ManifestoSection />

      {/* 3. Pieza del mes — se omite si no hay ninguna marcada. */}
      {piezaDelMes && <PiezaDelMesSection product={piezaDelMes} />}

      {/* 4. Selección del Curador */}
      <CuratorPicksSection products={curatorPicks} />

      {/* 5. Orfebres destacados (sólo con retrato editorial + ≥3 piezas) */}
      <FeaturedArtisansSection artisans={featuredArtisans} />

      {/* 6. Historias (3 últimos posts del blog) */}
      <StoriesSection posts={blogPosts} />

      {/* 7. Newsletter */}
      <NewsletterSection />
    </>
  );
}
