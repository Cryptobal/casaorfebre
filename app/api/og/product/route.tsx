import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "Pieza Artesanal";
  const artisan = url.searchParams.get("artisan") || "Orfebre";
  const price = url.searchParams.get("price") || "";
  const image = url.searchParams.get("image") || "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAFAF8",
        }}
      >
        {image && (
          <div style={{ width: "50%", height: "100%", display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        )}
        <div
          style={{
            width: image ? "50%" : "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              color: "#8B7355",
              textTransform: "uppercase",
              letterSpacing: "2px",
              margin: 0,
            }}
          >
            Casa Orfebre
          </p>
          <h1
            style={{
              fontSize: "36px",
              color: "#1A1A18",
              fontWeight: 300,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {name}
          </h1>
          <p style={{ fontSize: "18px", color: "#6b6860", margin: 0 }}>
            por {artisan}
          </p>
          {price && (
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
          )}
          <div
            style={{
              marginTop: "20px",
              borderTop: "1px solid #e8e5df",
              paddingTop: "20px",
              fontSize: "14px",
              color: "#8B7355",
            }}
          >
            Joyería de Autor · casaorfebre.cl
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
