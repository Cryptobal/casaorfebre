import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWeeklyInsights, type ArtisanStats } from "@/lib/ai/orfebre-insights";

// Simple in-memory cache for insights (24h TTL)
const insightsCache = new Map<string, { data: string[]; expiresAt: number }>();

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is an artisan
  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, displayName: true },
  });

  if (!artisan) {
    return Response.json({ error: "Not an artisan" }, { status: 403 });
  }

  // Check cache
  const cached = insightsCache.get(artisan.id);
  if (cached && Date.now() < cached.expiresAt) {
    return Response.json({ insights: cached.data });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch stats in parallel
    const [
      products,
      monthlyOrderItems,
      favorites,
      answeredQuestions,
      unansweredQuestions,
      platformStats,
    ] = await Promise.all([
      prisma.product.findMany({
        where: { artisanId: artisan.id, status: "APPROVED" },
        select: {
          name: true,
          viewCount: true,
          favoriteCount: true,
          _count: { select: { orderItems: true } },
        },
        orderBy: { viewCount: "desc" },
      }),
      prisma.orderItem.findMany({
        where: { artisanId: artisan.id, createdAt: { gte: startOfMonth } },
        select: { quantity: true, artisanPayout: true },
      }),
      prisma.favorite.count({
        where: { product: { artisanId: artisan.id } },
      }),
      prisma.productQuestion.count({
        where: { artisanId: artisan.id, answer: { not: null } },
      }),
      prisma.productQuestion.count({
        where: { artisanId: artisan.id, answer: null },
      }),
      // Platform averages
      prisma.artisan.aggregate({
        where: { status: "APPROVED" },
        _avg: { totalSales: true },
      }),
    ]);

    const totalViews = products.reduce((s, p) => s + p.viewCount, 0);

    // Average response time (approximate from answered questions)
    const recentQuestions = await prisma.productQuestion.findMany({
      where: { artisanId: artisan.id, answer: { not: null }, answeredAt: { not: null } },
      select: { createdAt: true, answeredAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    let avgResponseTimeHours = 0;
    if (recentQuestions.length > 0) {
      const totalHours = recentQuestions.reduce((sum, q) => {
        if (!q.answeredAt) return sum;
        return sum + (q.answeredAt.getTime() - q.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgResponseTimeHours = totalHours / recentQuestions.length;
    }

    const monthlySales = monthlyOrderItems.reduce((s, i) => s + i.quantity, 0);
    const monthlyRevenue = monthlyOrderItems.reduce((s, i) => s + i.artisanPayout, 0);

    // Platform average views (estimated)
    const artisanCount = await prisma.artisan.count({ where: { status: "APPROVED" } });
    const totalPlatformViews = await prisma.product.aggregate({
      where: { status: "APPROVED" },
      _sum: { viewCount: true },
    });
    const platformAvgViews = artisanCount > 0
      ? Math.round((totalPlatformViews._sum.viewCount ?? 0) / artisanCount)
      : 0;

    const stats: ArtisanStats = {
      artisanName: artisan.displayName,
      totalProducts: products.length,
      monthlyViews: totalViews,
      monthlySales,
      monthlyRevenue,
      avgResponseTimeHours,
      topProducts: products.slice(0, 5).map((p) => ({
        name: p.name,
        views: p.viewCount,
        favorites: p.favoriteCount,
        sales: p._count.orderItems,
      })),
      bottomProducts: products.slice(-3).map((p) => ({
        name: p.name,
        views: p.viewCount,
        favorites: p.favoriteCount,
      })),
      favoriteCount: favorites,
      questionsAnswered: answeredQuestions,
      questionsUnanswered: unansweredQuestions,
      platformAvgViews,
      platformAvgSales: Math.round(platformStats._avg.totalSales ?? 0),
    };

    const insights = await generateWeeklyInsights(stats);

    // Cache for 24 hours
    insightsCache.set(artisan.id, {
      data: insights,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return Response.json({ insights });
  } catch (e) {
    console.error("Insights error:", e);
    return Response.json({ error: "Error generating insights" }, { status: 500 });
  }
}
