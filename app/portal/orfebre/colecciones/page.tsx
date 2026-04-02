import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteCollectionButton } from "./delete-collection-button";
import { AiCollectionsButton } from "./ai-collections-button";

export default async function ColeccionesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });
  if (!artisan) redirect("/");

  const collections = await prisma.collection.findMany({
    where: { artisanId: artisan.id },
    include: { _count: { select: { products: true } } },
    orderBy: { position: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-text">
          Colecciones
        </h1>
        <Link
          href="/portal/orfebre/colecciones/nueva"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          + Nueva Coleccion
        </Link>
      </div>
      <div className="mt-4">
        <AiCollectionsButton />
      </div>

      {collections.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-text-secondary">
            Aun no tienes colecciones. Crea una para agrupar tus piezas.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-text">{col.name}</h3>
                {col.description && (
                  <p className="mt-0.5 truncate text-sm text-text-secondary">
                    {col.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-text-tertiary">
                  {col._count.products}{" "}
                  {col._count.products === 1 ? "pieza" : "piezas"}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Link
                  href={`/portal/orfebre/colecciones/${col.id}`}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  Editar
                </Link>
                <DeleteCollectionButton
                  collectionId={col.id}
                  collectionName={col.name}
                  productCount={col._count.products}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
