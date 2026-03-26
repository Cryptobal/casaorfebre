"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ReviewImageUpload } from "@/components/reviews/review-image-upload";

interface ReviewFormProps {
  productId: string;
  artisanId: string;
  orderId: string;
}

export function ReviewForm({ productId, artisanId, orderId }: ReviewFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return createReview(formData);
    },
    null
  );

  if (state?.success) {
    return (
      <p className="text-sm text-green-700">
        Gracias por tu opinion.
      </p>
    );
  }

  if (!expanded) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setExpanded(true)}>
        Dejar opinion
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-4 rounded-md border border-border bg-surface p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="artisanId" value={artisanId} />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />

      <div>
        <Label>Calificacion</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl transition-colors"
              aria-label={`${star} estrellas`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={star <= rating ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                className={star <= rating ? "text-amber-500" : "text-gray-300"}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="comment">Comentario</Label>
        <textarea
          id="comment"
          name="comment"
          required
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          placeholder="Cuenta tu experiencia con esta pieza..."
        />
      </div>

      <ReviewImageUpload onImagesChange={setImageUrls} />

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isPending} disabled={rating === 0}>
          Enviar opinion
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
