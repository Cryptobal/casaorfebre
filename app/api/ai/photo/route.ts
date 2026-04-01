import { auth } from "@/lib/auth";
import { removeBackground } from "@/lib/ai/photo-enhance";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ARTISAN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, imageUrl } = await req.json();

    if (action !== "remove-bg") {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return Response.json({ error: "imageUrl required" }, { status: 400 });
    }

    if (!process.env.REMOVE_BG_API_KEY) {
      return Response.json(
        { error: "Servicio de edición de fotos no disponible en este momento." },
        { status: 503 },
      );
    }

    const resultBuffer = await removeBackground(imageUrl);

    // Return as base64 data URL
    const base64 = resultBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    return Response.json({ resultUrl: dataUrl });
  } catch (e) {
    console.error("Photo API error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Error processing image" },
      { status: 500 },
    );
  }
}
