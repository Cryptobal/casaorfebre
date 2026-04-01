import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = '3 meses gratis \u2014 Programa Pioneros Casa Orfebre';
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';

export default async function Image() {
  const cormorant = fetch(
    new URL(
      'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.ttf',
    ),
  ).then((res) => res.arrayBuffer());

  const outfit = fetch(
    new URL(
      'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0EwItq6fNIg.ttf',
    ),
  ).then((res) => res.arrayBuffer());

  const [cormorantData, outfitData] = await Promise.all([cormorant, outfit]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A1A18',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #8B7355',
            padding: '40px',
          }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: 50,
              fontFamily: 'Cormorant Garamond',
              fontWeight: 300,
              color: '#FAFAF8',
              letterSpacing: '0.08em',
            }}
          >
            casa orfebre
          </div>

          {/* Gold line */}
          <div
            style={{
              width: 80,
              height: 1,
              backgroundColor: '#8B7355',
              marginTop: 20,
              marginBottom: 20,
            }}
          />

          {/* Program label */}
          <div
            style={{
              fontSize: 14,
              fontFamily: 'Outfit',
              fontWeight: 400,
              color: '#8B7355',
              letterSpacing: '6px',
              textTransform: 'uppercase' as const,
            }}
          >
            PROGRAMA PIONEROS
          </div>

          {/* Main text */}
          <div
            style={{
              fontSize: 40,
              fontFamily: 'Cormorant Garamond',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#c4b49a',
              marginTop: 24,
            }}
          >
            3 meses gratis
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 14,
              fontFamily: 'Outfit',
              fontWeight: 300,
              color: 'rgba(250,250,248,0.5)',
              marginTop: 20,
            }}
          >
            Plan Maestro + 0% comisi\u00f3n \u00b7 Cupos limitados
          </div>

          {/* URL at bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 44,
              fontSize: 13,
              fontFamily: 'Outfit',
              fontWeight: 300,
              color: 'rgba(250,250,248,0.35)',
              letterSpacing: '3px',
              textTransform: 'uppercase' as const,
            }}
          >
            casaorfebre.cl/para-pionero
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Cormorant Garamond',
          data: cormorantData,
          weight: 300,
          style: 'normal',
        },
        {
          name: 'Outfit',
          data: outfitData,
          weight: 300,
          style: 'normal',
        },
      ],
    },
  );
}
