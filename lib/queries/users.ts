import { prisma } from "@/lib/prisma";

export async function getUserShippingAddress(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      shippingName: true,
      shippingAddress: true,
      shippingCity: true,
      shippingRegion: true,
      shippingPostalCode: true,
      shippingPhone: true,
    },
  });
}
