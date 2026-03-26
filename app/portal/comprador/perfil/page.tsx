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
    select: {
      name: true,
      email: true,
      hashedPassword: true,
      shippingName: true,
      shippingAddress: true,
      shippingCity: true,
      shippingRegion: true,
      shippingPostalCode: true,
      shippingPhone: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="font-serif text-2xl font-light text-text">Mi Cuenta</h1>
      <ProfileForm
        name={user.name ?? ""}
        email={user.email ?? ""}
        hasPassword={!!user.hashedPassword}
        shippingAddress={{
          shippingName: user.shippingName ?? "",
          shippingAddress: user.shippingAddress ?? "",
          shippingCity: user.shippingCity ?? "",
          shippingRegion: user.shippingRegion ?? "",
          shippingPostalCode: user.shippingPostalCode ?? "",
          shippingPhone: user.shippingPhone ?? "",
        }}
      />
    </div>
  );
}
