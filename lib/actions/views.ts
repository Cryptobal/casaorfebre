"use server";

import { prisma } from "@/lib/prisma";

export async function incrementProductView(slug: string) {
  await prisma.product.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });
}
