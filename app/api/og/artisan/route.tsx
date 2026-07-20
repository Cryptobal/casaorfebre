import { ImageResponse } from "next/og";

export const runtime = "edge";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const AVATAR_SIZE = 120;
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
    <div
      style={{
        marginTop: "20px",
        borderTop: "1px solid #e8e5df",
        paddingTop: "20px",
        fontSize: "14px",
        color: BRAND,
        textTransform: "lowercase",
        letterSpacing: "2px",
        display: "flex",
      }}
    >
      casaorfebre · joyería de autor
    </div>
  );
}

function FallbackOg({
  name,
  region,
  products,
  initials,
}: {
  name: string;
  region: string;
  products: string;
  initials: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: `${AVATAR_SIZE}px`,
          height: `${AVATAR_SIZE}px`,
          borderRadius: "60px",
          backgroundColor: BRAND,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "40px", color: "#FFFFFF", fontWeight: 300 }}>
          {initials}
        </span>
      </div>
      <div
        style={{
          width: "60px",
          height: "2px",
          backgroundColor: BRAND,
        }}
      />
      <h1
        style={{
          fontSize: "42px",
          color: "#1A1A18",
          fontWeight: 300,
          margin: 0,
          fontFamily: "Georgia, serif",
        }}
      >
        {name}
      </h1>
      {region ? (
        <p style={{ fontSize: "20px", color: "#6b6860", margin: 0 }}>
          {region}, Chile
        </p>
      ) : null}
      <p style={{ fontSize: "16px", color: "#9e9a90", margin: 0 }}>
        {products} piezas en Casa Orfebre
      </p>
      <BrandWordmark />
    </div>
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "Orfebre";
  const region = url.searchParams.get("region") || "";
  const products = url.searchParams.get("products") || "0";
  const image = url.searchParams.get("image") || "";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: `${AVATAR_SIZE}px`,
              height: `${AVATAR_SIZE}px`,
              borderRadius: "60px",
              backgroundColor: BRAND,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt=""
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              <span
                style={{ fontSize: "40px", color: "#FFFFFF", fontWeight: 300 }}
              >
                {initials}
              </span>
            )}
          </div>

          <div
            style={{
              width: "40px",
              height: "1px",
              backgroundColor: BRAND,
            }}
          />

          <h1
            style={{
              fontSize: "42px",
              color: "#1A1A18",
              fontWeight: 300,
              margin: 0,
              fontFamily: "Georgia, serif",
            }}
          >
            {name}
          </h1>

          {region ? (
            <p style={{ fontSize: "20px", color: "#6b6860", margin: 0 }}>
              {region}, Chile
            </p>
          ) : null}

          <p style={{ fontSize: "16px", color: "#9e9a90", margin: 0 }}>
            {products} piezas en Casa Orfebre
          </p>

          <BrandWordmark />
        </div>
      ),
      { width: OG_WIDTH, height: OG_HEIGHT },
    );
  } catch (err) {
    console.error("[OG/artisan] fallback:", err);
    return new ImageResponse(
      (
        <FallbackOg
          name={name}
          region={region}
          products={products}
          initials={initials}
        />
      ),
      { width: OG_WIDTH, height: OG_HEIGHT },
    );
  }
}
