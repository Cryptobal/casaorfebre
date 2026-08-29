import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SITE_MODE } from "@/lib/site-config";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

/**
 * Hub de `/portal`. En modo atelier, Camila (y cualquier ADMIN / usuario del
 * switcher) aterriza en Contenido de la Home, ignorando `activeRole` previo.
 * En marketplace (y para compradores/orfebres) se respeta el rol efectivo.
 */
export default async function PortalIndexPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }

  const email = session.user.email || "";
  const realRole = session.user.role || "BUYER";
  const isRoleSwitcher =
    ROLE_SWITCHER_EMAILS.includes(email) && realRole === "ADMIN";

  if (SITE_MODE === "atelier" && (isRoleSwitcher || realRole === "ADMIN")) {
    // El guard de `/portal/admin` mira el rol de sesión, no `activeRole`.
    // Aun así reseteamos `activeRole` para que el layout muestre nav de admin
    // (Home) y no la de compradora/orfebre del último switch.
    if (isRoleSwitcher) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { activeRole: true },
        });
        if (user?.activeRole) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { activeRole: null },
          });
          revalidatePath("/portal", "layout");
        }
      } catch (e) {
        console.error("[PortalIndex] failed to reset activeRole:", e);
      }
    }
    redirect("/portal/admin/home");
  }

  let role = realRole;
  if (isRoleSwitcher) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { activeRole: true },
      });
      if (user?.activeRole) role = user.activeRole;
    } catch (e) {
      console.error("[PortalIndex] failed to read activeRole:", e);
    }
  }

  if (role === "ADMIN") redirect("/portal/admin");
  if (role === "ARTISAN") redirect("/portal/orfebre");
  redirect("/portal/comprador/pedidos");
}
