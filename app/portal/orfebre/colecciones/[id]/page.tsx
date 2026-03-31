import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CollectionForm } from "../collection-form";

export default async function EditarColeccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });
  if (!artisan) redirect("/");

  const collection = await prisma.collection.findFirst({
    where: { id, artisanId: artisan.id },
  });
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 font-serif text-2xl font-semibold text-text">
        Editar Coleccion
      </h1>
      <CollectionForm
        collection={{
          id: collection.id,
          name: collection.name,
          description: collection.description,
        }}
      />
    </div>
  );
}
