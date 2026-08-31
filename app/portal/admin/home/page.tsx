import { getAdminHomeContent, getProductPhotosForGallery } from "@/lib/queries/home-content";
import { GalleryManager } from "./gallery-manager";
import { TextsEditor } from "./texts-editor";

export default async function AdminHomeContentPage() {
  const [{ stored, images }, productPhotos] = await Promise.all([
    getAdminHomeContent(),
    getProductPhotosForGallery(),
  ]);

  return (
    <div className="mx-auto max-w-3xl pb-[max(1rem,env(safe-area-inset-bottom))]">
      <h1 className="font-serif text-3xl font-light">Contenido de la Home</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Cambia las fotos y los textos de casaorfebre.cl desde el teléfono. Los cambios se ven al instante. Si dejas un texto vacío, vuelve el original.
      </p>

      <div className="mt-6">
        <GalleryManager images={images} productPhotos={productPhotos} />
      </div>

      <h2 className="mb-3 mt-8 font-serif text-2xl font-light">Textos</h2>
      <TextsEditor stored={stored} />
    </div>
  );
}
