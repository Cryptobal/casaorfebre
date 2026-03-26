import { ImageResponse } from 'next/og';
import { getArtisanBySlug } from '@/lib/queries/artisans';

export const runtime = 'nodejs';
export const alt = 'Orfebre — Casa Orfebre';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artisan = await getArtisanBySlug(slug);

  if (!artisan) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAFAF8',
            fontFamily: 'serif',
          }}
        >
          <div
            style={{
              fontSize: 48,
              letterSpacing: '0.2em',
              color: '#8B7355',
            }}
          >
            CASA ORFEBRE
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#999',
              marginTop: 16,
              fontFamily: 'sans-serif',
            }}
          >
            Orfebre no encontrado
          </div>
        </div>
      ),
      { ...size },
    );
  }

  const productCount = artisan._count.products;
  const reviewCount = artisan._count.reviews;

  // Build star string for rating
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FAFAF8',
          padding: '60px 80px',
          fontFamily: 'serif',
        }}
      >
        {/* Top — Brand */}
        <div
          style={{
            fontSize: 18,
            letterSpacing: '0.25em',
            color: '#8B7355',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase' as const,
          }}
        >
          Casa Orfebre
        </div>

        {/* Center — Artisan Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontFamily: 'serif',
              color: '#1A1A1A',
              lineHeight: 1.15,
            }}
          >
            {artisan.displayName}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: 20,
              fontSize: 24,
              color: '#666',
              fontFamily: 'sans-serif',
            }}
          >
            <span>{artisan.location}</span>
            <span style={{ color: '#CCC' }}>|</span>
            <span>{artisan.specialty}</span>
          </div>

          <div
            style={{
              fontSize: 22,
              color: '#8B7355',
              marginTop: 24,
              fontFamily: 'sans-serif',
            }}
          >
            {productCount} {productCount === 1 ? 'pieza publicada' : 'piezas publicadas'}
          </div>

          {/* Rating */}
          {artisan.rating > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: 16,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  color: '#D4A853',
                  letterSpacing: '0.05em',
                }}
              >
                {renderStars(artisan.rating)}
              </span>
              <span
                style={{
                  fontSize: 20,
                  color: '#999',
                  fontFamily: 'sans-serif',
                }}
              >
                ({artisan.rating.toFixed(1)}) {reviewCount}{' '}
                {reviewCount === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            width: '100%',
            height: '3px',
            backgroundColor: '#8B7355',
            borderRadius: '2px',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
