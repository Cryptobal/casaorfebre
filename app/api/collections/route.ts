import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No auth" }, { status: 401 });
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });
  if (!artisan || artisan.status !== "APPROVED") {
    return NextResponse.json({ error: "No artisan" }, { status: 403 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  let slug = slugify(name.trim());
  const existing = await prisma.collection.findUnique({
    where: { artisanId_slug: { artisanId: artisan.id, slug } },
  });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
  }

  const collection = await prisma.collection.create({
    data: { artisanId: artisan.id, name: name.trim(), slug },
  });

  return NextResponse.json({ id: collection.id, name: collection.name });
}
