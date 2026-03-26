import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Mi Cuenta",
};

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, hashedPassword: true },
  });

  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="font-serif text-2xl font-light text-text">Mi Cuenta</h1>
      <ProfileForm
        name={user.name ?? ""}
        email={user.email ?? ""}
        hasPassword={!!user.hashedPassword}
      />
    </div>
  );
}
