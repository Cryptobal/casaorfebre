import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { productId } = body as { productId?: string };

  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }

  // Verify the product belongs to this artisan
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      artisan: {
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: true },
            orderBy: { startDate: "desc" },
            take: 1,
          },
        },
      },
      video: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  if (product.artisan.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Check plan allows video
  const activePlan = product.artisan.subscriptions[0]?.plan;
  if (!activePlan?.videoEnabled) {
    return NextResponse.json(
      { error: "Los videos están disponibles en el plan Maestro." },
      { status: 403 }
    );
  }

  // Check product doesn't already have a video
  if (product.video) {
    return NextResponse.json(
      { error: "Este producto ya tiene un video. Elimina el actual para subir uno nuevo." },
      { status: 400 }
    );
  }

  // Request direct upload URL from Cloudflare Stream
  const CF_ACCOUNT_ID = process.env.CF_STREAM_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CF_STREAM_API_TOKEN;

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error("Cloudflare Stream credentials not configured");
    return NextResponse.json({ error: "Error de configuración de video" }, { status: 500 });
  }

  try {
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds: 30,
          allowedOrigins: ["casaorfebre.cl", "localhost:3000"],
          creator: product.artisanId,
          meta: {
            productId,
            artisanId: product.artisanId,
          },
        }),
      }
    );

    if (!cfResponse.ok) {
      const cfError = await cfResponse.text();
      console.error("Cloudflare Stream error:", cfError);
      return NextResponse.json({ error: "Error al solicitar URL de subida" }, { status: 500 });
    }

    const cfData = await cfResponse.json();
    const { uid, uploadURL } = cfData.result;

    // Save video record in DB
    await prisma.productVideo.create({
      data: {
        productId,
        cloudflareStreamUid: uid,
        status: "PROCESSING",
      },
    });

    return NextResponse.json({ uploadURL, uid });
  } catch (error) {
    console.error("Video upload request error:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud de video" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Delete from Cloudflare Stream
  const CF_ACCOUNT_ID = process.env.CF_STREAM_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CF_STREAM_API_TOKEN;

  if (CF_ACCOUNT_ID && CF_API_TOKEN) {
    try {
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream/${video.cloudflareStreamUid}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
        }
      );
    } catch {
      // Best effort delete from CF
    }
  }

  await prisma.productVideo.delete({ where: { productId } });

  return NextResponse.json({ success: true });
}
