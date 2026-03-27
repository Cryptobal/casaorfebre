import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }

  const video = await prisma.productVideo.findUnique({
    where: { productId },
    include: { product: { include: { artisan: true } } },
  });

  if (!video || video.product.artisan.userId !== session.user.id) {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }

  // If already READY or ERROR, return current status
  if (video.status !== "PROCESSING") {
    return NextResponse.json({ status: video.status, uid: video.cloudflareStreamUid });
  }

  // Check Cloudflare Stream for readyToStream
  const CF_ACCOUNT_ID = process.env.CF_STREAM_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CF_STREAM_API_TOKEN;

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json({ status: video.status, uid: video.cloudflareStreamUid });
  }

  try {
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${video.cloudflareStreamUid}`,
      {
        headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
      }
    );

    if (!cfResponse.ok) {
      return NextResponse.json({ status: video.status, uid: video.cloudflareStreamUid });
    }

    const cfData = await cfResponse.json();
    const streamStatus = cfData.result?.status?.state;
    const readyToStream = cfData.result?.readyToStream;

    if (readyToStream) {
      await prisma.productVideo.update({
        where: { productId },
        data: { status: "READY" },
      });
      return NextResponse.json({ status: "READY", uid: video.cloudflareStreamUid });
    }

    if (streamStatus === "error") {
      await prisma.productVideo.update({
        where: { productId },
        data: { status: "ERROR" },
      });
      return NextResponse.json({ status: "ERROR", uid: video.cloudflareStreamUid });
    }

    return NextResponse.json({ status: "PROCESSING", uid: video.cloudflareStreamUid });
  } catch {
    return NextResponse.json({ status: video.status, uid: video.cloudflareStreamUid });
  }
}
