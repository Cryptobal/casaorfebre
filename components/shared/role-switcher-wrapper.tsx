import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleSwitcher } from "./role-switcher";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

export async function RoleSwitcherWrapper() {
  let session;
  try {
    session = await auth();
  } catch (e) {
    console.error("[RoleSwitcherWrapper] auth() failed:", e);
    return null;
  }
  if (!session?.user?.email) return null;
  if (!ROLE_SWITCHER_EMAILS.includes(session.user.email)) return null;

  // Fallback to session role so the switcher ALWAYS renders for authorized users,
  // even if the prisma lookup fails or is slow.
  let currentRole: string = session.user.role || "ADMIN";
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeRole: true, role: true },
    });
    currentRole = user?.activeRole || user?.role || currentRole;
  } catch (e) {
    console.error("[RoleSwitcherWrapper] prisma lookup failed, using session role:", e);
  }

  return <RoleSwitcher currentRole={currentRole} />;
}
