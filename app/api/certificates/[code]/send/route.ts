import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCertificateEmail } from "@/lib/emails/templates";
import { auth } from "@/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { code } = await params;
  const { email } = (await request.json()) as { email: string };

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  const cert = await prisma.certificate.findUnique({
    where: { code },
    include: { product: { select: { name: true } } },
  });

  if (!cert) {
    return NextResponse.json(
      { error: "Certificado no encontrado" },
      { status: 404 }
    );
  }

  const issuedDate = cert.issuedAt.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await sendCertificateEmail(email, {
    buyerName: email.split("@")[0],
    productName: cert.product.name,
    certCode: cert.code,
    materials: cert.materials,
    technique: cert.technique,
    artisanName: cert.artisanName,
    issuedDate,
  });

  return NextResponse.json({ success: true, sentTo: email });
}
