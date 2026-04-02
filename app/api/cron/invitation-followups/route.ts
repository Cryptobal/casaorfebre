import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendFollowUp1Email,
  sendFollowUp2Email,
  sendFollowUp3Email,
} from "@/lib/emails/invitation-templates";

// Vercel Cron calls this daily. We check which invitations need follow-ups.
// Schedule: Day 3 → Follow-up 1, Day 7 → Follow-up 2, Day 14 → Follow-up 3. Max 3 follow-ups.
// Never send on weekends (Saturday=6, Sunday=0 in Chile time).

const FOLLOW_UP_DELAYS_DAYS = [3, 7, 14]; // Day 3, Day 7, Day 14 after initial send
const MAX_FOLLOW_UPS = 3;

function isWeekend(): boolean {
  // Chile is UTC-3 or UTC-4 depending on DST
  const now = new Date();
  const chileOffset = -4; // conservative
  const chileHour = now.getUTCHours() + chileOffset;
  const chileDate = new Date(now.getTime() + chileOffset * 60 * 60 * 1000);
  const day = chileDate.getUTCDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Never send on weekends
  if (isWeekend()) {
    return NextResponse.json({ message: "Skipped — weekend", processed: 0 });
  }

  try {
    // Find invitations eligible for follow-up:
    // - Status is SENT or OPENED (not CLICKED, ACCEPTED, FAILED, BOUNCED)
    // - followUpCount < MAX_FOLLOW_UPS
    const candidates = await prisma.invitation.findMany({
      where: {
        status: { in: ["SENT", "OPENED"] },
        followUpCount: { lt: MAX_FOLLOW_UPS },
      },
      include: { campaign: true },
    });

    let sent = 0;
    let skipped = 0;

    for (const inv of candidates) {
      const referenceDate = inv.lastFollowUpAt ?? inv.sentAt;
      const nextFollowUpDay = FOLLOW_UP_DELAYS_DAYS[inv.followUpCount];

      if (!nextFollowUpDay) {
        skipped++;
        continue;
      }

      const elapsed = daysSince(referenceDate);
      if (elapsed < nextFollowUpDay) {
        skipped++;
        continue;
      }

      // Check if user already registered (has an account)
      const userExists = await prisma.user.findUnique({
        where: { email: inv.email },
        select: { id: true },
      });

      if (userExists) {
        // User already registered — mark as accepted and skip
        await prisma.invitation.update({
          where: { id: inv.id },
          data: { status: "ACCEPTED", acceptedAt: new Date() },
        });
        skipped++;
        continue;
      }

      // Send the follow-up
      try {
        if (inv.followUpCount === 0) {
          await sendFollowUp1Email(inv.email, { token: inv.token, type: inv.type });
        } else if (inv.followUpCount === 1) {
          await sendFollowUp2Email(inv.email, { token: inv.token, type: inv.type });
        } else {
          await sendFollowUp3Email(inv.email, { token: inv.token, type: inv.type });
        }

        const newCount = inv.followUpCount + 1;
        await prisma.invitation.update({
          where: { id: inv.id },
          data: {
            followUpCount: newCount,
            lastFollowUpAt: new Date(),
            nextFollowUpAt:
              newCount < MAX_FOLLOW_UPS
                ? new Date(Date.now() + FOLLOW_UP_DELAYS_DAYS[newCount] * 24 * 60 * 60 * 1000)
                : null,
          },
        });

        sent++;
      } catch {
        skipped++;
      }

      // Rate limiting: 200ms between emails
      await new Promise((r) => setTimeout(r, 200));
    }

    return NextResponse.json({
      message: "Follow-ups processed",
      total: candidates.length,
      sent,
      skipped,
    });
  } catch (e) {
    console.error("[CRON] Follow-up processing error:", e);
    return NextResponse.json(
      { error: "Failed to process follow-ups" },
      { status: 500 },
    );
  }
}
