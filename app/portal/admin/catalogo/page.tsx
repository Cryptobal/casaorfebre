import { getAllCategories, getAllMaterials } from "@/lib/queries/catalog";
import { CatalogManager } from "./catalog-manager";

export default async function CatalogoPage() {
  const [categories, materials] = await Promise.all([
    getAllCategories(),
    getAllMaterials(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-8">
        Catálogo
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        Administra las categorías y materiales disponibles para los productos.
      </p>
      <CatalogManager
        initialCategories={JSON.parse(JSON.stringify(categories))}
        initialMaterials={JSON.parse(JSON.stringify(materials))}
      />
    </div>
  );
}
