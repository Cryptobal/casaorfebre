import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  if (!code || state !== "casaorfebre") {
    return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
  }

  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "Pinterest app not configured" },
      { status: 500 },
    );
  }

  const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");

  const tokenResponse = await fetch(
    "https://api.pinterest.com/v5/oauth/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${appUrl}/api/auth/pinterest/callback`,
      }),
    },
  );

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error("[Pinterest OAuth] Error:", error);
    return NextResponse.redirect(
      `${appUrl}/portal/admin?pinterest=error`,
    );
  }

  const data = await tokenResponse.json();

  await prisma.systemSetting.upsert({
    where: { key: "PINTEREST_ACCESS_TOKEN" },
    update: { value: data.access_token },
    create: { key: "PINTEREST_ACCESS_TOKEN", value: data.access_token },
  });

  if (data.refresh_token) {
    await prisma.systemSetting.upsert({
      where: { key: "PINTEREST_REFRESH_TOKEN" },
      update: { value: data.refresh_token },
      create: { key: "PINTEREST_REFRESH_TOKEN", value: data.refresh_token },
    });
  }

  return NextResponse.redirect(`${appUrl}/portal/admin?pinterest=connected`);
}
