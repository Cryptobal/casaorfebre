"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function checkTourStatus(tourId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return true;

  const completion = await prisma.tourCompletion.findUnique({
    where: {
      userId_tourId: {
        userId: session.user.id,
        tourId,
      },
    },
  });

  return !!completion;
}

export async function completeTour(tourId: string, skipped = false) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.tourCompletion.upsert({
    where: {
      userId_tourId: {
        userId: session.user.id,
        tourId,
      },
    },
    update: skipped
      ? { skippedAt: new Date() }
      : { completedAt: new Date(), skippedAt: null },
    create: {
      userId: session.user.id,
      tourId,
      ...(skipped ? { skippedAt: new Date() } : {}),
    },
  });
}

export async function resetTour(tourId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.tourCompletion.deleteMany({
    where: {
      userId: session.user.id,
      tourId,
    },
  });
}
