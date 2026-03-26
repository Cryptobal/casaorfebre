import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQRCodeSVG } from "@/lib/certificates";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { code },
    include: {
      product: { select: { name: true, slug: true } },
    },
  });

  if (!cert) {
    return NextResponse.json(
      { error: "Certificado no encontrado" },
      { status: 404 }
    );
  }

  // QR SVG is generated from our own trusted certificate code — safe to embed
  const qrSvg = await generateQRCodeSVG(cert.code);

  const issuedDate = cert.issuedAt.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado ${cert.code} — Casa Orfebre</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Outfit:wght@300;400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Outfit', sans-serif;
      color: #1a1a18;
      background: #fff;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
    }

    .certificate {
      max-width: 600px;
      width: 100%;
      position: relative;
      overflow: hidden;
      padding: 48px 40px;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-family: 'Cormorant Garamond', serif;
      font-size: 90px;
      font-weight: 600;
      color: rgba(139, 115, 85, 0.06);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 12px;
    }

    .content { position: relative; z-index: 1; }

    .header { text-align: center; margin-bottom: 32px; }

    .brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #8B7355;
      letter-spacing: 2px;
      text-transform: lowercase;
    }

    .subtitle {
      font-size: 13px;
      color: #6b6860;
      margin-top: 4px;
      letter-spacing: 1px;
    }

    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #8B7355, transparent);
      margin: 24px 0;
    }

    .code-display {
      text-align: center;
      font-family: monospace;
      font-size: 18px;
      letter-spacing: 3px;
      color: #8B7355;
      margin: 24px 0;
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 24px 0;
    }

    .info-item {
      padding: 12px 16px;
      background: #FAFAF8;
      border-radius: 6px;
    }

    .info-item.full { grid-column: 1 / -1; }

    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9e9a90;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 14px;
      color: #1a1a18;
    }

    .qr-section {
      text-align: center;
      margin: 32px 0 24px;
    }

    .qr-section svg {
      width: 120px;
      height: 120px;
    }

    .footer {
      text-align: center;
      font-size: 11px;
      color: #9e9a90;
      border-top: 1px solid #e8e5df;
      padding-top: 16px;
      margin-top: 16px;
    }

    @media print {
      body { margin: 0; padding: 20px; }
      .certificate { max-width: 100%; padding: 32px; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">CASA ORFEBRE</div>
    <div class="content">
      <div class="header">
        <div class="brand">casa orfebre</div>
        <div class="subtitle">Certificado de Autenticidad</div>
      </div>

      <div class="divider"></div>

      <div class="code-display">${cert.code}</div>

      <div class="info-grid">
        <div class="info-item full">
          <div class="info-label">Pieza</div>
          <div class="info-value">${cert.product.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Materiales</div>
          <div class="info-value">${cert.materials}</div>
        </div>
        ${
          cert.technique
            ? `<div class="info-item">
          <div class="info-label">Tecnica</div>
          <div class="info-value">${cert.technique}</div>
        </div>`
            : ""
        }
        <div class="info-item">
          <div class="info-label">Orfebre</div>
          <div class="info-value">${cert.artisanName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Fecha</div>
          <div class="info-value">${issuedDate}</div>
        </div>
      </div>

      <div class="qr-section">
        ${qrSvg}
      </div>

      <div class="footer">
        casaorfebre.cl &middot; Verificar en /verificar/${cert.code}
      </div>
    </div>
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
