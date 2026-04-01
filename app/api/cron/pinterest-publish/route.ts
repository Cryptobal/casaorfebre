import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishProductToPinterest } from "@/lib/actions/pinterest-publish";
import {
  pinterestClient,
  getPublishedBlogPins,
  markBlogPinPublished,
} from "@/lib/pinterest";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    return NextResponse.json({ message: "Pinterest not configured" });
  }

  // ── Products ──
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      pinterestPinId: null,
      publishedAt: { gte: cutoff },
      images: { some: { status: "APPROVED" } },
    },
    select: { id: true, name: true },
    take: 5,
    orderBy: { publishedAt: "desc" },
  });

  let published = 0;
  let errors = 0;
  const results: { name: string; type: string; status: string }[] = [];

  for (const product of products) {
    const result = await publishProductToPinterest(product.id);
    if (result.success) {
      published++;
      results.push({ name: product.name, type: "product", status: "published" });
    } else {
      errors++;
      results.push({
        name: product.name,
        type: "product",
        status: result.error || "error",
      });
    }
  }

  // ── Blog posts ──
  const blogBoardId = process.env.PINTEREST_BOARD_BLOG;
  if (blogBoardId) {
    const publishedBlogPins = getPublishedBlogPins();
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true, excerpt: true, coverImage: true },
      orderBy: { publishedAt: "desc" },
    });

    const unpublished = blogPosts.filter(
      (p) => !publishedBlogPins[p.slug],
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

    for (const post of unpublished.slice(0, 2)) {
      const imageUrl = post.coverImage?.startsWith("http")
        ? post.coverImage
        : post.coverImage
          ? `${appUrl}${post.coverImage}`
          : `${appUrl}/casaorfebre-og-image.png`;

      const description = `${post.title} — ${post.excerpt.slice(0, 300)}. Lee más en Casa Orfebre 📖`;

      const result = await pinterestClient.createPin({
        title: post.title,
        description: description.slice(0, 500),
        link: `${appUrl}/blog/${post.slug}`,
        board_id: blogBoardId,
        media_source: { source_type: "image_url", url: imageUrl },
      });

      if (result) {
        markBlogPinPublished(post.slug, result.id);
        published++;
        results.push({
          name: post.title,
          type: "blog",
          status: "published",
        });
      } else {
        errors++;
        results.push({ name: post.title, type: "blog", status: "error" });
      }
    }
  }

  return NextResponse.json({
    published,
    errors,
    results,
  });
}
