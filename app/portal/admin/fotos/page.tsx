import { getPhotosForReview, getPhotoReviewCounts } from "@/lib/queries/admin";
import { PhotoReview } from "./photo-review";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FotosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = (params.tab as string) || "PENDING_REVIEW";
  const sort = (params.sort as string) || "recientes";
  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const [{ items, total, totalPages }, counts] = await Promise.all([
    getPhotosForReview({ status: tab, sort, page }),
    getPhotoReviewCounts(),
  ]);

  const serialized = items.map((photo) => ({
    id: photo.id,
    url: photo.url,
    altText: photo.altText,
    status: photo.status,
    createdAt: photo.createdAt.toISOString(),
    productName: photo.product.name,
    artisanName: photo.product.artisan.displayName,
  }));

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-light">
        Revision de Fotos
      </h1>
      <PhotoReview
        key={`${tab}-${sort}-${page}`}
        photos={serialized}
        counts={counts}
        activeTab={tab}
        sort={sort}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
