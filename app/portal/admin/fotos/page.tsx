import { getPhotosForReview } from "@/lib/queries/admin";
import { PhotoReview } from "./photo-review";

export default async function FotosPage() {
  const photos = await getPhotosForReview();

  const serialized = photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    altText: photo.altText,
    status: photo.status,
    productName: photo.product.name,
    artisanName: photo.product.artisan.displayName,
  }));

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-light">
        Revision de Fotos
      </h1>
      <PhotoReview photos={serialized} />
    </div>
  );
}
