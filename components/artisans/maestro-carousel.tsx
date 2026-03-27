"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArtisanBadge } from "@/components/artisans/artisan-badge";

interface MaestroArtisan {
  id: string;
  slug: string;
  displayName: string;
  story: string | null;
  location: string;
  profileImage: string | null;
  subscriptions: Array<{
    plan: { name: string; badgeText: string | null; badgeType: string | null };
  }>;
  products: Array<{
    slug: string;
    name: string;
    images: Array<{ url: string; altText: string | null }>;
  }>;
}

interface MaestroCarouselProps {
  artisans: MaestroArtisan[];
}

export function MaestroCarousel({ artisans }: MaestroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = artisans.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next, total]);

  if (total === 0) return null;

  return (
    <div className="relative">
      {/* Carousel viewport */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {artisans.map((artisan) => {
            const plan = artisan.subscriptions?.[0]?.plan;
            const featuredProduct = artisan.products?.[0];
            const storyExcerpt = artisan.story
              ? artisan.story.length > 120
                ? artisan.story.slice(0, 120) + "..."
                : artisan.story
              : null;

            return (
              <div
                key={artisan.id}
                className="w-full flex-shrink-0 px-2"
              >
                <Link
                  href={`/orfebres/${artisan.slug}`}
                  className="group block rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/30 sm:p-8"
                >
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                    {/* Artisan photo */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-amber-200 bg-background sm:h-28 sm:w-28">
                        {artisan.profileImage ? (
                          <Image
                            src={artisan.profileImage}
                            alt={artisan.displayName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center font-serif text-3xl font-light text-text-secondary">
                            {artisan.displayName
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>
                      {plan?.badgeType && (
                        <ArtisanBadge
                          badgeType={plan.badgeType}
                          badgeText={plan.badgeText}
                          size="md"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-serif text-xl font-medium text-text sm:text-2xl">
                        {artisan.displayName}
                      </h3>
                      <p className="mt-1 text-sm text-text-tertiary">
                        {artisan.location}
                      </p>
                      {storyExcerpt && (
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                          {storyExcerpt}
                        </p>
                      )}
                    </div>

                    {/* Featured product */}
                    {featuredProduct && featuredProduct.images[0] && (
                      <div className="flex-shrink-0">
                        <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-border sm:h-32 sm:w-32">
                          <Image
                            src={featuredProduct.images[0].url}
                            alt={featuredProduct.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-1.5 max-w-[8rem] truncate text-center text-xs text-text-tertiary">
                          {featuredProduct.name}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 rounded-full border border-border bg-surface p-2 text-text-secondary shadow-sm transition-colors hover:bg-background hover:text-text"
            aria-label="Anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 rounded-full border border-border bg-surface p-2 text-text-secondary shadow-sm transition-colors hover:bg-background hover:text-text"
            aria-label="Siguiente"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {artisans.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? "bg-accent" : "bg-border"
              }`}
              aria-label={`Ir a orfebre ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
