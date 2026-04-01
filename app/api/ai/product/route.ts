import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiProductLimiter } from "@/lib/rate-limit";
import { analyzeAndGenerateListing } from "@/lib/ai/product-generator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // Only approved artisans (or admins) can use this endpoint
  const isAdmin = session.user.role === "ADMIN";
  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, displayName: true, status: true },
  });

  if (!isAdmin && (!artisan || artisan.status !== "APPROVED")) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { success } = await aiProductLimiter.limit(session.user.id);
  if (!success) {
    return Response.json(
      { error: "Demasiadas generaciones. Máximo 10 por hora." },
      { status: 429 },
    );
  }

  const body = await req.json() as {
    imageUrls: string[];
    artisanName?: string;
    extraContext?: string;
  };

  if (!body.imageUrls?.length) {
    return Response.json(
      { error: "Sube al menos una foto para generar con IA." },
      { status: 400 },
    );
  }

  if (body.imageUrls.length > 4) {
    return Response.json({ error: "Máximo 4 imágenes" }, { status: 400 });
  }

  try {
    const listing = await analyzeAndGenerateListing({
      imageUrls: body.imageUrls,
      artisanName: body.artisanName || artisan?.displayName || "Orfebre",
      extraContext: body.extraContext,
    });

    return Response.json({ listing });
  } catch (error) {
    console.error("AI product generation failed:", error);
    return Response.json(
      { error: "No pudimos analizar las fotos. Intenta de nuevo en un momento." },
      { status: 500 },
    );
  }
}
