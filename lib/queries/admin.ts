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

  return {
    gmv,
    commissions,
    salesCount,
    avgTicket,
    activeArtisans,
    publishedProducts,
    pendingApplications,
    pendingProducts,
    pendingPhotos,
    openDisputes,
    pendingReturns,
    lateShipments,
  };
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
