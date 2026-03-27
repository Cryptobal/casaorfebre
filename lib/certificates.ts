import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

function generateCertCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CO-CERT-${code}`;
}

export async function createCertificate(orderItemId: string) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      product: {
        select: { id: true, name: true, materials: true, technique: true },
      },
      artisan: { select: { displayName: true } },
    },
  });
  if (!item) return null;

  const existing = await prisma.certificate.findUnique({
    where: { productId: item.productId },
  });
  if (existing) return existing;

  let code = generateCertCode();
  while (await prisma.certificate.findUnique({ where: { code } })) {
    code = generateCertCode();
  }

  return prisma.certificate.create({
    data: {
      productId: item.productId,
      orderItemId,
      code,
      materials: item.product.materials.join(", "),
      technique: item.product.technique,
      artisanName: item.artisan.displayName,
    },
  });
}

export async function generateQRCodeSVG(code: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/verificar/${code}`;
  return QRCode.toString(url, { type: "svg", margin: 1, width: 150 });
}

/** Returns a base64 data URI PNG */
export async function generateQRCodeDataURI(code: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/verificar/${code}`;
  return QRCode.toDataURL(url, { margin: 1, width: 300, color: { dark: "#2c2a26", light: "#ffffff" } });
}

/** Returns raw PNG Buffer — for CID inline email attachments */
export async function generateQRCodeBuffer(code: string): Promise<Buffer> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/verificar/${code}`;
  return QRCode.toBuffer(url, { margin: 1, width: 300, color: { dark: "#2c2a26", light: "#ffffff" } });
}
