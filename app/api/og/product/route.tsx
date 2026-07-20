import { ImageResponse } from "next/og";

export const runtime = "edge";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const IMAGE_WIDTH = 600;
const IMAGE_HEIGHT = 630;
const BRAND = "#8B7355";
const BG = "#FAFAF8";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function toDataUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const contentType = (res.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (!ALLOWED_TYPES.has(contentType)) return null;

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > 5_000_000) return null;

    const base64 = arrayBufferToBase64(buffer);
    const mime = contentType === "image/jpg" ? "image/jpeg" : contentType;
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

function BrandWordmark() {
  return (
    <p
      style={{
        fontSize: "16px",
        color: "#1A1A18",
        textTransform: "lowercase",
        letterSpacing: "2px",
        margin: 0,
        display: "flex",
      }}
    >
      <span>casa</span>
      <span style={{ color: BRAND, fontStyle: "italic" }}>o</span>
      <span>rfebre</span>
    </p>
  );
}

function FallbackOg({ name, price }: { name: string; price: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: BG,
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        gap: "20px",
      }}
    >
      <BrandWordmark />
      <div
        style={{
          width: "60px",
          height: "2px",
          backgroundColor: BRAND,
          marginTop: "4px",
        }}
      />
      <h1
        style={{
          fontSize: "42px",
          color: "#1A1A18",
          fontWeight: 300,
          lineHeight: 1.2,
          margin: 0,
          fontFamily: "Georgia, serif",
        }}
      >
        {name}
      </h1>
      {price ? (
        <p
          style={{
            fontSize: "28px",
            color: "#1A1A18",
            fontWeight: 500,
            margin: 0,
          }}
        >
          ${price}
        </p>
      ) : null}
      <p style={{ fontSize: "14px", color: BRAND, margin: 0, marginTop: "12px" }}>
        Joyería de Autor · casaorfebre.cl
      </p>
    </div>
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "Pieza Artesanal";
  const artisan = url.searchParams.get("artisan") || "Orfebre";
  const price = url.searchParams.get("price") || "";
  const image = url.searchParams.get("image") || "";

  try {
    const dataUrl = image ? await toDataUrl(image) : null;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: BG,
          }}
        >
          {dataUrl ? (
            <div
              style={{
                width: "50%",
                height: "100%",
                display: "flex",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt=""
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          ) : null}
          <div
            style={{
              width: dataUrl ? "50%" : "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "60px",
              gap: "16px",
            }}
          >
            <BrandWordmark />
            <div
              style={{
                width: "40px",
                height: "1px",
                backgroundColor: BRAND,
              }}
            />
            <h1
              style={{
                fontSize: "36px",
                color: "#1A1A18",
                fontWeight: 300,
                lineHeight: 1.2,
                margin: 0,
                fontFamily: "Georgia, serif",
              }}
            >
              {name}
            </h1>
            <p style={{ fontSize: "18px", color: "#6b6860", margin: 0 }}>
              por {artisan}
            </p>
            {price ? (
              <p
                style={{
                  fontSize: "28px",
                  color: "#1A1A18",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                ${price}
              </p>
            ) : null}
            <div
              style={{
                marginTop: "20px",
                borderTop: "1px solid #e8e5df",
                paddingTop: "20px",
                fontSize: "14px",
                color: BRAND,
              }}
            >
              Joyería de Autor · casaorfebre.cl
            </div>
          </div>
        </div>
      ),
      { width: OG_WIDTH, height: OG_HEIGHT },
    );
  } catch (err) {
    console.error("[OG/product] fallback:", err);
    return new ImageResponse(<FallbackOg name={name} price={price} />, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    });
  }
}
