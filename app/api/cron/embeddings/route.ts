import { NextResponse } from "next/server";
import { updateAllEmbeddings } from "@/lib/ai/embeddings";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await updateAllEmbeddings();

  return NextResponse.json({
    success: true,
    ...stats,
  });
}
