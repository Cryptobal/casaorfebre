import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateAdminInsights, type MarketplaceStats } from "@/lib/ai/admin-insights";

// Simple in-memory cache for admin insights (1h TTL)
const insightsCache = { data: null as string[] | null, expiresAt: 0 };

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check cache
  if (insightsCache.data && Date.now() < insightsCache.expiresAt) {
    return NextResponse.json({ insights: insightsCache.data });
  }

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      salesThisWeek,
      salesLastWeek,
      newBuyers,
      pendingModeration,
      unansweredQuestions,
      totalArtisans,
      totalProducts,
      topCategoriesRaw,
      artisansWithRecentProducts,
    ] = await Promise.all([
      // Sales this week (OrderItems created in last 7 days)
      prisma.orderItem.count({
        where: { createdAt: { gte: oneWeekAgo } },
      }),
      // Sales last week
      prisma.orderItem.count({
        where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
      }),
      // New buyers in last 7 days
      prisma.user.count({
        where: { role: "BUYER", createdAt: { gte: oneWeekAgo } },
      }),
      // Products pending moderation
      prisma.product.count({
        where: { status: "PENDING_REVIEW" },
      }),
      // Unanswered questions
      prisma.productQuestion.count({
        where: { answer: null },
      }),
      // Total approved artisans
      prisma.artisan.count({
        where: { status: "APPROVED" },
      }),
      // Total approved products
      prisma.product.count({
        where: { status: "APPROVED" },
      }),
      // Top 3 categories by product count
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          name: true,
          _count: { select: { products: true } },
        },
        orderBy: { products: { _count: "desc" } },
        take: 3,
      }),
      // Artisans who have published at least one product in last 30 days
      prisma.artisan.findMany({
        where: {
          status: "APPROVED",
          products: { some: { createdAt: { gte: thirtyDaysAgo } } },
        },
        select: { id: true },
      }),
    ]);

    const inactiveArtisans = totalArtisans - artisansWithRecentProducts.length;
    const topCategories = topCategoriesRaw.map((c) => c.name);

    const stats: MarketplaceStats = {
      salesThisWeek,
      salesLastWeek,
      newBuyers,
      pendingModeration,
      inactiveArtisans: Math.max(0, inactiveArtisans),
      unansweredQuestions,
      topCategories,
      totalArtisans,
      totalProducts,
    };

    const insights = await generateAdminInsights(stats);

    // Cache for 1 hour
    insightsCache.data = insights;
    insightsCache.expiresAt = Date.now() + 60 * 60 * 1000;

    return NextResponse.json({ insights });
  } catch (e) {
    console.error("Admin insights error:", e);
    return NextResponse.json({ error: "Error generating insights" }, { status: 500 });
  }
}
