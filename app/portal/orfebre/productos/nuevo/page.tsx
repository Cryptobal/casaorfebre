import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createMinimalDraft } from "@/lib/actions/products";

export default async function NuevoProductoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const result = await createMinimalDraft();

  if (result.error || !result.productId) {
    redirect("/portal/orfebre/productos");
  }

  redirect(`/portal/orfebre/productos/${result.productId}`);
}
