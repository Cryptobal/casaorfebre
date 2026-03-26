import {
  getAllCategories,
  getAllMaterials,
  getAllOccasions,
  getAllSpecialties,
} from "@/lib/queries/catalog";
import { CatalogManager } from "./catalog-manager";

export default async function CatalogoPage() {
  const [categories, materials, occasions, specialties] = await Promise.all([
    getAllCategories(),
    getAllMaterials(),
    getAllOccasions(),
    getAllSpecialties(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-8">
        Catálogo
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        Administra las categorías, materiales, especialidades y ocasiones disponibles para los productos.
      </p>
      <CatalogManager
        initialCategories={JSON.parse(JSON.stringify(categories))}
        initialMaterials={JSON.parse(JSON.stringify(materials))}
        initialOccasions={JSON.parse(JSON.stringify(occasions))}
        initialSpecialties={JSON.parse(JSON.stringify(specialties))}
      />
    </div>
  );
}
