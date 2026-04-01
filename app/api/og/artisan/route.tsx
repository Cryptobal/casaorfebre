import { ImageResponse } from "next/og";

export const runtime = "edge";

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

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAFAF8",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: "#8B7355",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
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

        <h1
          style={{
            fontSize: "42px",
            color: "#1A1A18",
            fontWeight: 300,
            margin: 0,
          }}
        >
          {name}
        </h1>

        {region && (
          <p style={{ fontSize: "20px", color: "#6b6860", margin: 0 }}>
            {region}, Chile
          </p>
        )}

        <p style={{ fontSize: "16px", color: "#9e9a90", margin: 0 }}>
          {products} piezas en Casa Orfebre
        </p>

        <div
          style={{
            marginTop: "20px",
            borderTop: "1px solid #e8e5df",
            paddingTop: "20px",
            fontSize: "14px",
            color: "#8B7355",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Casa Orfebre · Joyería de Autor
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
