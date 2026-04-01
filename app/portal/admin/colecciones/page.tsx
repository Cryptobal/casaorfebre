import { prisma } from "@/lib/prisma";
import { CuratedCollectionsManager } from "./curated-collections-manager";

export default async function AdminColeccionesPage() {
  const collections = await prisma.curatedCollection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-8">
        Colecciones Curadas
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        Crea y administra colecciones temáticas curadas por IA para el catálogo público.
      </p>
      <CuratedCollectionsManager
        initialCollections={JSON.parse(JSON.stringify(collections))}
      />
    </div>
  );
}
