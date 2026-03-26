import { ImageResponse } from 'next/og';
import { getProductBySlug } from '@/lib/queries/products';

export const runtime = 'nodejs';
export const alt = 'Producto — Casa Orfebre';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
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
            Producto no encontrado
          </div>
        </div>
      ),
      { ...size },
    );
  }

  const formattedPrice = `$${product.price.toLocaleString('es-CL')}`;

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

        {/* Center — Product Info */}
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
              fontSize: 56,
              fontFamily: 'serif',
              color: '#1A1A1A',
              lineHeight: 1.15,
              maxWidth: '900px',
            }}
          >
            {product.name}
          </div>

          <div
            style={{
              fontSize: 42,
              color: '#8B7355',
              marginTop: 24,
              fontFamily: 'sans-serif',
              fontWeight: 600,
            }}
          >
            {formattedPrice}
          </div>

          <div
            style={{
              fontSize: 22,
              color: '#666',
              marginTop: 12,
              fontFamily: 'sans-serif',
            }}
          >
            por {product.artisan.displayName}
          </div>

          {/* Material badges */}
          {product.materials.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: 28,
              }}
            >
              {product.materials.slice(0, 4).map((material) => (
                <div
                  key={material}
                  style={{
                    fontSize: 16,
                    color: '#8B7355',
                    border: '1.5px solid #8B7355',
                    borderRadius: '20px',
                    padding: '6px 18px',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {material}
                </div>
              ))}
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
