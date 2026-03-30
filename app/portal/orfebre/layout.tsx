import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const ROLE_SWITCHER_EMAILS = [
  "carlos.irigoyen@gmail.com",
  "camilatorrespuga@gmail.com",
];

export default async function ArtisanPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Admin role-switchers can access the orfebre portal for testing
  const email = session.user.email || "";
  const isRoleSwitcherAdmin =
    ROLE_SWITCHER_EMAILS.includes(email) && session.user.role === "ADMIN";

  if (!isRoleSwitcherAdmin) {
    const artisan = await prisma.artisan.findUnique({
      where: { userId: session.user.id },
    });

    if (!artisan || artisan.status !== "APPROVED") redirect("/");
  }

  return <>{children}</>;
}
