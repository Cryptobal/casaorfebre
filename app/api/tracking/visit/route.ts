import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, medium, campaign, landingPage, sessionId } = body;

    if (!source || !landingPage || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Dedup: skip if same session + same page in last 30 minutes
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const existing = await prisma.referralVisit.findFirst({
      where: { sessionId, landingPage, createdAt: { gte: cutoff } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    // Extract slugs from landing page
    let productSlug: string | null = null;
    let artisanSlug: string | null = null;
    const productMatch = landingPage.match(/\/coleccion\/([^/?]+)/);
    if (productMatch) productSlug = productMatch[1];
    const artisanMatch = landingPage.match(/\/orfebres\/([^/?]+)/);
    if (artisanMatch) artisanSlug = artisanMatch[1];

    await prisma.referralVisit.create({
      data: {
        source: source.slice(0, 50),
        medium: medium?.slice(0, 50) || null,
        campaign: campaign?.slice(0, 100) || null,
        landingPage: landingPage.slice(0, 500),
        productSlug,
        artisanSlug,
        sessionId: sessionId.slice(0, 100),
        userId: body.userId?.slice(0, 100) || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
