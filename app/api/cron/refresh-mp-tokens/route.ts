import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshArtisanToken } from "@/lib/mercadopago-refresh";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const artisans = await prisma.artisan.findMany({
    where: {
      mpOnboarded: true,
      mpRefreshToken: { not: null },
      mpTokenExpiresAt: { lte: thirtyDaysFromNow },
    },
    select: { id: true, displayName: true, mpTokenExpiresAt: true },
  });

  const results = { refreshed: 0, failed: 0, errors: [] as string[] };

  for (const artisan of artisans) {
    const success = await refreshArtisanToken(artisan.id);
    if (success) {
      results.refreshed++;
    } else {
      results.failed++;
      results.errors.push(`${artisan.displayName} (${artisan.id})`);
    }
  }

  console.log(`[cron/refresh-mp-tokens] Done: ${results.refreshed} refreshed, ${results.failed} failed out of ${artisans.length} total`);

  return NextResponse.json({ success: true, total: artisans.length, ...results });
}
