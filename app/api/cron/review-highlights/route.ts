import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReviewHighlights } from "@/lib/ai/reviews";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find products with 5+ reviews that need highlights updated
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      reviews: { some: {} },
    },
    select: {
      id: true,
      reviewHighlightsAt: true,
      reviews: {
        where: { comment: { not: "" } },
        select: { rating: true, comment: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    processed++;

    // Need at least 5 reviews with comments
    if (product.reviews.length < 5) {
      skipped++;
      continue;
    }

    // Skip if highlights are up-to-date (no new reviews since last generation)
    const latestReview = product.reviews[0].createdAt;
    if (product.reviewHighlightsAt && product.reviewHighlightsAt >= latestReview) {
      skipped++;
      continue;
    }

    try {
      const highlights = await generateReviewHighlights(
        product.reviews.map((r) => ({ rating: r.rating, comment: r.comment })),
      );

      await prisma.product.update({
        where: { id: product.id },
        data: {
          reviewHighlights: highlights.length > 0 ? highlights : undefined,
          reviewHighlightsAt: new Date(),
        },
      });

      updated++;
      // Rate limit: 200ms between API calls
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (e) {
      console.error(`Review highlights failed for product ${product.id}:`, e);
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    updated,
    skipped,
    errors,
  });
}
