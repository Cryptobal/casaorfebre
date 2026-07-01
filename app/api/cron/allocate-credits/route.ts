import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addCredits, getOrCreateCredits } from "@/lib/credits";
import { CreditTransactionType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // --- Autenticación: mismo patrón Bearer que el resto de crons.
  // Validamos que el secreto exista para no autorizar con "Bearer undefined". ---
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Asignar créditos a todos los orfebres con plan activo que otorga créditos ---
  const activeSubs = await prisma.membershipSubscription.findMany({
    where: { status: "ACTIVE", plan: { monthlyCredits: { gt: 0 } } },
    include: { plan: true, artisan: { select: { id: true } } },
  });

  const now = new Date();
  let allocated = 0;
  const results: { artisanId: string; credits: number }[] = [];

  for (const sub of activeSubs) {
    const artisanId = sub.artisan.id;
    const monthly = sub.plan.monthlyCredits;
    const credits = await getOrCreateCredits(artisanId);

    // Evitar doble asignación en el mismo ciclo mensual
    const lastAlloc = credits.lastAllocated;
    const alreadyThisMonth =
      lastAlloc &&
      lastAlloc.getFullYear() === now.getFullYear() &&
      lastAlloc.getMonth() === now.getMonth();
    if (alreadyThisMonth) continue;

    // Completar hasta la asignación mensual sin tocar créditos comprados extra
    const deficit = Math.max(0, monthly - credits.balance);
    if (deficit > 0) {
      await addCredits(
        artisanId,
        deficit,
        CreditTransactionType.MONTHLY_ALLOCATION,
        `Asignación mensual plan ${sub.plan.name}`
      );
    }
    await prisma.artisanCredits.update({
      where: { artisanId },
      data: { lastAllocated: now },
    });
    allocated++;
    results.push({ artisanId, credits: deficit });
  }

  return NextResponse.json({ ok: true, allocated, results });
}
