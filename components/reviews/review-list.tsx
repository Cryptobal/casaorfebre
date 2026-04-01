import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ReviewImageLightbox } from "./review-image-lightbox";

interface ReviewListProps {
  productId: string;
}

export async function ReviewList({ productId }: ReviewListProps) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-border p-6">
        <h2 className="mb-2 font-serif text-lg">Opiniones</h2>
        <p className="text-sm text-text-tertiary">
          Este producto a&uacute;n no tiene opiniones.
        </p>
      </div>
    );
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / reviews.length;

  return (
    <div className="rounded-lg border border-border p-6">
      <h2 className="mb-6 font-serif text-lg">Opiniones</h2>

      {/* Average rating summary */}
      <div className="mb-8 flex items-center gap-4">
        <span className="font-serif text-4xl font-light text-text">
          {avgRating.toFixed(1)}
        </span>
        <div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= Math.round(avgRating)}
              />
            ))}
          </div>
          <p className="mt-1 text-sm text-text-tertiary">
            {reviews.length} {reviews.length === 1 ? "opini\u00f3n" : "opiniones"}
          </p>
        </div>
      </div>

      {/* Review cards */}
      <div className="divide-y divide-border">
        {reviews.map((review) => {
          const userName = review.user.name
            ? formatUserName(review.user.name)
            : "Cliente";

          return (
            <div key={review.id} className="py-6 first:pt-0 last:pb-0">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        filled={star <= review.rating}
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-text">
                    {userName}
                  </span>
                  {review.isVerified && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Compra verificada
                    </span>
                  )}
                </div>
                <time className="text-xs text-text-tertiary">
                  {review.createdAt.toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>

              {/* Comment */}
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {review.comment}
              </p>

              {/* Media (images + videos) */}
              {review.images.length > 0 && (() => {
                const images = review.images.filter((u) => !/\.(mp4|webm|mov)(\?|$)/i.test(u));
                const videos = review.images.filter((u) => /\.(mp4|webm|mov)(\?|$)/i.test(u));
                return (
                  <>
                    {images.length > 0 && (
                      <ReviewImageLightbox images={images} />
                    )}
                    {videos.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {videos.map((url) => (
                          <video
                            key={url}
                            src={url}
                            controls
                            preload="metadata"
                            className="h-32 max-w-[200px] rounded-lg border border-border object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Artisan response */}
              {review.response && (
                <div className="ml-8 mt-4 border-l-2 border-accent/20 pl-4">
                  <p className="text-xs font-medium text-text-tertiary">
                    Respuesta del orfebre:
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {review.response}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatUserName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || "Cliente";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function StarIcon({
  filled,
  size = 18,
}: {
  filled: boolean;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className={filled ? "text-[#f59e0b]" : "text-[#d1d5db]"}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
