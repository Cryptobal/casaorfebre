import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { randomUUID } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const key = formData.get("key") as string | null;
  const name = formData.get("name") as string | null;

  if (!file || !key) {
    return NextResponse.json({ error: "Archivo y key son requeridos" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "El archivo no debe superar los 10 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const r2Key = `admin-assets/${key}-${randomUUID().slice(0, 8)}.pdf`;
  const url = await uploadToR2(buffer, r2Key, file.type);

  const asset = await prisma.adminAsset.upsert({
    where: { key },
    update: {
      fileName: file.name,
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: session.user.email ?? "admin",
      name: name || file.name,
    },
    create: {
      key,
      name: name || file.name,
      fileName: file.name,
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: session.user.email ?? "admin",
    },
  });

  return NextResponse.json({ success: true, asset });
}
