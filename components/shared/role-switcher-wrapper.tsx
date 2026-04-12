import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleSwitcher } from "./role-switcher";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

export async function RoleSwitcherWrapper() {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;
    if (!ROLE_SWITCHER_EMAILS.includes(session.user.email)) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeRole: true, role: true },
    });

    const currentRole = user?.activeRole || user?.role || "ADMIN";

    return <RoleSwitcher currentRole={currentRole} />;
  } catch (e) {
    console.error("[RoleSwitcherWrapper] Error rendering role switcher:", e);
    return null;
  }
}
