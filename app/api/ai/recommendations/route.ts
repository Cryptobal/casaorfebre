import { auth } from "@/lib/auth";
import { getBuyerRecommendations } from "@/lib/ai/buyer-recommendations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const recommendations = await getBuyerRecommendations(session.user.id);
    return Response.json({ recommendations });
  } catch (error) {
    console.error("[recommendations] Error generating recommendations:", error);
    return Response.json(
      { error: "Error al generar recomendaciones" },
      { status: 500 },
    );
  }
}
