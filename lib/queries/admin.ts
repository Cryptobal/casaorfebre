import { prisma } from "@/lib/prisma";

// Dashboard KPIs
export async function getAdminDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    monthlyOrders,
    activeArtisans,
    publishedProducts,
    pendingApplications,
    pendingProducts,
    pendingPhotos,
    openDisputes,
    pendingReturns,
    registeredBuyers,
    monthlyReviews,
    bypassConversations,
    expiringSubs,
  ] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        order: { status: { not: "PENDING_PAYMENT" } },
      },
      select: { productPrice: true, quantity: true, commissionAmount: true },
    }),
    prisma.artisan.count({ where: { status: "APPROVED" } }),
    prisma.product.count({ where: { status: "APPROVED" } }),
    prisma.artisanApplication.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.productImage.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.dispute.count({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    }),
    prisma.returnRequest.count({
      where: { status: { in: ["REQUESTED", "APPROVED"] } },
    }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.review.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.conversation.count({ where: { hasBypassAttempt: true, status: "ACTIVE" } }),
    prisma.membershipSubscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), gte: now },
      },
      include: {
        artisan: { select: { displayName: true } },
        plan: { select: { name: true } },
      },
    }),
  ]);

  // Calculate late shipments: OrderItems PENDING or PREPARING and older than 5 days
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const lateShipments = await prisma.orderItem.count({
    where: {
      fulfillmentStatus: { in: ["PENDING", "PREPARING"] },
      createdAt: { lt: fiveDaysAgo },
      order: { status: { not: "PENDING_PAYMENT" } },
    },
  });

  const gmv = monthlyOrders.reduce(
    (sum, i) => sum + i.productPrice * i.quantity,
    0
  );
  const commissions = monthlyOrders.reduce(
    (sum, i) => sum + i.commissionAmount,
    0
  );
  const salesCount = monthlyOrders.length;
  const avgTicket = salesCount > 0 ? Math.round(gmv / salesCount) : 0;

  // Subscription revenue estimate (sum of active subscriptions for this month)
  const activeSubs = await prisma.membershipSubscription.findMany({
    where: { status: "ACTIVE" },
    include: { plan: { select: { price: true } } },
  });
  const subscriptionRevenue = activeSubs.reduce((s, sub) => s + sub.plan.price, 0);

  // Monthly orders count (whole orders, not items)
  const monthlyOrderCount = await prisma.order.count({
    where: {
      createdAt: { gte: startOfMonth },
      status: { not: "PENDING_PAYMENT" },
    },
  });

  return {
    gmv,
    commissions,
    subscriptionRevenue,
    monthlyOrderCount,
    salesCount,
    avgTicket,
    activeArtisans,
    publishedProducts,
    registeredBuyers,
    monthlyReviews,
    pendingApplications,
    pendingProducts,
    pendingPhotos,
    openDisputes,
    pendingReturns,
    lateShipments,
    bypassConversations,
    expiringSubs,
  };
}

// Sales by month (last 6 months)
export async function getSalesLast6Months() {
  const now = new Date();
  const months: { label: string; gmv: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const items = await prisma.orderItem.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        order: { status: { not: "PENDING_PAYMENT" } },
      },
      select: { productPrice: true, quantity: true },
    });
    const gmv = items.reduce((s, i) => s + i.productPrice * i.quantity, 0);
    months.push({
      label: start.toLocaleDateString("es-CL", { month: "short" }),
      gmv,
    });
  }

  return months;
}

// Artisans by plan
export async function getArtisansByPlan() {
  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED" },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: { select: { name: true } } },
        take: 1,
      },
    },
  });

  const counts: Record<string, number> = { Esencial: 0, Artesano: 0, Maestro: 0 };
  for (const a of artisans) {
    const planName = a.subscriptions?.[0]?.plan?.name || "esencial";
    const label = planName.charAt(0).toUpperCase() + planName.slice(1);
    counts[label] = (counts[label] || 0) + 1;
  }

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// Top artisans by sales this month
export async function getTopArtisansMonth() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const items = await prisma.orderItem.findMany({
    where: {
      createdAt: { gte: startOfMonth },
      order: { status: { not: "PENDING_PAYMENT" } },
    },
    include: {
      artisan: {
        select: {
          displayName: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: { select: { name: true } } },
            take: 1,
          },
        },
      },
    },
  });

  const byArtisan: Record<string, { name: string; plan: string; total: number }> = {};
  for (const item of items) {
    const key = item.artisanId;
    if (!byArtisan[key]) {
      byArtisan[key] = {
        name: item.artisan.displayName,
        plan: item.artisan.subscriptions?.[0]?.plan?.name || "Esencial",
        total: 0,
      };
    }
    byArtisan[key].total += item.productPrice * item.quantity;
  }

  return Object.values(byArtisan)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

// Top products by units sold this month
export async function getTopProductsMonth() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const items = await prisma.orderItem.findMany({
    where: {
      createdAt: { gte: startOfMonth },
      order: { status: { not: "PENDING_PAYMENT" } },
    },
    select: {
      productName: true,
      quantity: true,
      artisan: { select: { displayName: true } },
    },
  });

  const byProduct: Record<string, { name: string; artisan: string; units: number }> = {};
  for (const item of items) {
    const key = item.productName;
    if (!byProduct[key]) {
      byProduct[key] = { name: item.productName, artisan: item.artisan.displayName, units: 0 };
    }
    byProduct[key].units += item.quantity;
  }

  return Object.values(byProduct)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
}

// Applications
export async function getPendingApplications() {
  return prisma.artisanApplication.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
}

// Products for moderation
export async function getPendingProducts() {
  return prisma.product.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" } },
    },
  });
}

// Photos for review
export async function getPhotosForReview(filter?: string) {
  const statusFilter =
    filter && filter !== "all" ? { status: filter as "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "REPLACED" } : {};
  return prisma.productImage.findMany({
    where: statusFilter,
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        select: { name: true, artisan: { select: { displayName: true } } },
      },
    },
    take: 100,
  });
}

// All artisans with metrics
export async function getAllArtisans() {
  return prisma.artisan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: { select: { name: true, badgeText: true, badgeType: true, homeHighlight: true } } },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      _count: { select: { products: true, orderItems: true, reviews: true } },
    },
  });
}

// All orders
export async function getAllOrders(statusFilter?: string) {
  return prisma.order.findMany({
    where: statusFilter
      ? { status: statusFilter as "PENDING_PAYMENT" | "PAID" | "PARTIALLY_SHIPPED" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED" }
      : {},
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true } },
          artisan: { select: { displayName: true } },
        },
      },
    },
    take: 100,
  });
}

// Late shipments
export async function getLateShipments() {
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  return prisma.orderItem.findMany({
    where: {
      fulfillmentStatus: { in: ["PENDING", "PREPARING"] },
      createdAt: { lt: fiveDaysAgo },
      order: { status: { not: "PENDING_PAYMENT" } },
    },
    include: {
      order: { select: { orderNumber: true, createdAt: true } },
      product: { select: { name: true } },
      artisan: { select: { displayName: true, slug: true } },
    },
  });
}

// Open disputes
export async function getOpenDisputes() {
  return prisma.dispute.findMany({
    where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    orderBy: { createdAt: "asc" },
    include: {
      order: { select: { orderNumber: true } },
      user: { select: { name: true, email: true } },
    },
  });
}

// Pending returns
export async function getPendingReturns() {
  return prisma.returnRequest.findMany({
    where: {
      status: {
        in: ["REQUESTED", "APPROVED", "SHIPPED_BACK", "RECEIVED_BY_ARTISAN"],
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

// Finance stats
export async function getFinanceStats() {
  const allPaidItems = await prisma.orderItem.findMany({
    where: { order: { status: { not: "PENDING_PAYMENT" } } },
    select: {
      productPrice: true,
      quantity: true,
      commissionAmount: true,
      artisanPayout: true,
      payoutStatus: true,
    },
  });

  const gmvTotal = allPaidItems.reduce(
    (s, i) => s + i.productPrice * i.quantity,
    0
  );
  const commissionsGross = allPaidItems.reduce(
    (s, i) => s + i.commissionAmount,
    0
  );
  const mpCostEstimate = Math.round(gmvTotal * 0.045); // ~4.5% MP fee estimate
  const commissionsNet = commissionsGross - mpCostEstimate;
  const pendingPayouts = allPaidItems
    .filter((i) => i.payoutStatus === "HELD")
    .reduce((s, i) => s + i.artisanPayout, 0);

  return {
    gmvTotal,
    commissionsGross,
    mpCostEstimate,
    commissionsNet,
    pendingPayouts,
  };
}
