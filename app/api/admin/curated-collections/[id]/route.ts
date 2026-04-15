import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as { isActive?: boolean };

  const collection = await prisma.curatedCollection.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  revalidatePath("/colecciones");
  revalidatePath(`/colecciones/${collection.slug}`);
  revalidatePath(`/portal/admin/colecciones`);
  revalidatePath(`/portal/admin/colecciones/${id}`);

  return Response.json({ collection });
}
