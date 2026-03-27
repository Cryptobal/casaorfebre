"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

export async function switchActiveRole(role: "ADMIN" | "ARTISAN" | "BUYER") {
  const session = await auth();
  if (!session?.user?.email) return { error: "No autenticado" };

  if (!ROLE_SWITCHER_EMAILS.includes(session.user.email)) {
    return { error: "No autorizado" };
  }

  // If switching to ARTISAN, ensure an Artisan record exists for this user
  if (role === "ARTISAN") {
    const existing = await prisma.artisan.findUnique({
      where: { userId: session.user.id },
    });
    if (!existing) {
      await prisma.artisan.create({
        data: {
          userId: session.user.id,
          displayName: "Admin Test",
          slug: `admin-test-${session.user.id.slice(-6)}`,
          bio: "Cuenta de prueba del administrador",
          location: "Chile",
          specialty: "Orfebrería general",
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeRole: role === "ADMIN" ? null : role },
  });

  // Invalidate ALL portal pages so the layout re-renders with the new role
  revalidatePath("/portal", "layout");

  const dest =
    role === "ADMIN"
      ? "/portal/admin"
      : role === "ARTISAN"
        ? "/portal/orfebre"
        : "/portal/comprador/pedidos";

  redirect(dest);
}

export async function getActiveRole() {
  const session = await auth();
  if (!session?.user?.email) return null;

  if (!ROLE_SWITCHER_EMAILS.includes(session.user.email)) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeRole: true, role: true },
  });

  return user?.activeRole || user?.role || "ADMIN";
}
