import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmailCopy, type EmailTrigger } from "@/lib/ai/email-marketing";
import { sendEmail } from "@/lib/emails/templates";

const CRON_SECRET = process.env.CRON_SECRET;

// Max 50 emails per cron run
const MAX_EMAILS_PER_RUN = 50;
// Max 1 marketing email per user per week
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let emailsSent = 0;
  const errors: string[] = [];

  try {
    // Track which users already got an email this run
    const sentToUsers = new Set<string>();

    // ── Trigger 1: WISHLIST_REMINDER ──
    // Users with items in wishlist added 7+ days ago, product stock <= 3
    if (emailsSent < MAX_EMAILS_PER_RUN) {
      const sevenDaysAgo = new Date(Date.now() - ONE_WEEK_MS);

      const wishlistItems = await prisma.wishlistItem.findMany({
        where: {
          addedAt: { lte: sevenDaysAgo },
          product: {
            status: "APPROVED",
            stock: { lte: 3, gt: 0 },
          },
        },
        include: {
          wishlist: {
            include: {
              user: { select: { id: true, name: true, email: true, updatedAt: true } },
            },
          },
          product: {
            select: {
              name: true,
              slug: true,
              price: true,
              artisan: { select: { displayName: true } },
              images: { take: 1, select: { url: true } },
            },
          },
        },
        take: MAX_EMAILS_PER_RUN,
      });

      // Group by user
      const userProducts = new Map<string, { user: { id: string; name: string | null; email: string }; products: typeof wishlistItems }>();
      for (const item of wishlistItems) {
        const userId = item.wishlist.user.id;
        if (sentToUsers.has(userId)) continue;
        const existing = userProducts.get(userId);
        if (existing) {
          existing.products.push(item);
        } else {
          userProducts.set(userId, { user: item.wishlist.user, products: [item] });
        }
      }

      for (const [userId, data] of userProducts) {
        if (emailsSent >= MAX_EMAILS_PER_RUN) break;

        try {
          const copy = await generateEmailCopy({
            trigger: "WISHLIST_REMINDER",
            buyerName: data.user.name || "amigo/a",
            products: data.products.slice(0, 3).map((wi) => ({
              name: wi.product.name,
              slug: wi.product.slug,
              price: wi.product.price,
              image: wi.product.images[0]?.url,
              artisanName: wi.product.artisan.displayName,
            })),
          });

          await sendEmail(data.user.email, copy.subject, copy.bodyHtml);
          emailsSent++;
          sentToUsers.add(userId);
        } catch (e) {
          errors.push(`WISHLIST_REMINDER for ${userId}: ${e}`);
        }
      }
    }

    // ── Trigger 2: POST_PURCHASE_CROSS_SELL ──
    // Buyers who purchased exactly 30 days ago
    if (emailsSent < MAX_EMAILS_PER_RUN) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      const recentOrders = await prisma.order.findMany({
        where: {
          status: { in: ["COMPLETED", "DELIVERED"] },
          createdAt: { gte: thirtyOneDaysAgo, lte: thirtyDaysAgo },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              artisan: { select: { id: true, displayName: true } },
            },
          },
        },
        take: MAX_EMAILS_PER_RUN,
      });

      for (const order of recentOrders) {
        if (emailsSent >= MAX_EMAILS_PER_RUN) break;
        if (sentToUsers.has(order.userId)) continue;

        // Find new products from the same artisans
        const artisanIds = [...new Set(order.items.map((i) => i.artisanId))];
        const newProducts = await prisma.product.findMany({
          where: {
            artisanId: { in: artisanIds },
            status: "APPROVED",
            createdAt: { gte: thirtyDaysAgo },
          },
          select: {
            name: true,
            slug: true,
            price: true,
            artisan: { select: { displayName: true } },
            images: { take: 1, select: { url: true } },
          },
          take: 4,
        });

        if (newProducts.length === 0) continue;

        try {
          const copy = await generateEmailCopy({
            trigger: "POST_PURCHASE_CROSS_SELL",
            buyerName: order.user.name || "amigo/a",
            products: newProducts.map((p) => ({
              name: p.name,
              slug: p.slug,
              price: p.price,
              image: p.images[0]?.url,
              artisanName: p.artisan.displayName,
            })),
            artisanName: newProducts[0].artisan.displayName,
          });

          await sendEmail(order.user.email, copy.subject, copy.bodyHtml);
          emailsSent++;
          sentToUsers.add(order.userId);
        } catch (e) {
          errors.push(`POST_PURCHASE for ${order.userId}: ${e}`);
        }
      }
    }

    // ── Trigger 3: NEW_FROM_FOLLOWED_ARTISAN ──
    // Products approved in last 24h, notify buyers who favorited products from same artisan
    if (emailsSent < MAX_EMAILS_PER_RUN) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const newProducts = await prisma.product.findMany({
        where: {
          status: "APPROVED",
          publishedAt: { gte: yesterday },
        },
        select: {
          name: true,
          slug: true,
          price: true,
          artisanId: true,
          artisan: { select: { displayName: true } },
          images: { take: 1, select: { url: true } },
        },
      });

      // Group by artisan
      const byArtisan = new Map<string, typeof newProducts>();
      for (const p of newProducts) {
        const existing = byArtisan.get(p.artisanId);
        if (existing) existing.push(p);
        else byArtisan.set(p.artisanId, [p]);
      }

      for (const [artisanId, products] of byArtisan) {
        if (emailsSent >= MAX_EMAILS_PER_RUN) break;

        // Find buyers who favorited products from this artisan
        const interestedBuyers = await prisma.favorite.findMany({
          where: {
            product: { artisanId },
          },
          select: {
            user: { select: { id: true, name: true, email: true } },
          },
          distinct: ["userId"],
          take: 20,
        });

        for (const fav of interestedBuyers) {
          if (emailsSent >= MAX_EMAILS_PER_RUN) break;
          if (sentToUsers.has(fav.user.id)) continue;

          try {
            const copy = await generateEmailCopy({
              trigger: "NEW_FROM_FOLLOWED_ARTISAN",
              buyerName: fav.user.name || "amigo/a",
              products: products.slice(0, 3).map((p) => ({
                name: p.name,
                slug: p.slug,
                price: p.price,
                image: p.images[0]?.url,
                artisanName: p.artisan.displayName,
              })),
              artisanName: products[0].artisan.displayName,
            });

            await sendEmail(fav.user.email, copy.subject, copy.bodyHtml);
            emailsSent++;
            sentToUsers.add(fav.user.id);
          } catch (e) {
            errors.push(`NEW_ARTISAN for ${fav.user.id}: ${e}`);
          }
        }
      }
    }
  } catch (e) {
    console.error("Email marketing cron error:", e);
    return Response.json({ error: "Cron failed", details: String(e) }, { status: 500 });
  }

  return Response.json({
    success: true,
    emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
