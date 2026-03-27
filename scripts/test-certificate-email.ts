/**
 * Test: envía email de certificado con QR hosteado via URL pública.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Resend } from "resend";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Casa Orfebre <contacto@casaorfebre.cl>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

const TEST_EMAIL = "carlos.irigoyen@gmail.com";

async function main() {
  const cert = await prisma.certificate.findFirst({
    include: { product: { select: { name: true } } },
    orderBy: { issuedAt: "desc" },
  });

  if (!cert) {
    console.error("No hay certificados en la BD.");
    return;
  }

  console.log(`Usando certificado: ${cert.code} — ${cert.product.name}`);

  const verifyUrl = `${APP_URL}/verificar/${cert.code}`;
  const pdfUrl = `${APP_URL}/api/certificates/${cert.code}/pdf`;
  const qrUrl = `${APP_URL}/api/certificates/${cert.code}/qr`;
  const issuedDate = cert.issuedAt.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const techniqueRow = cert.technique
    ? `<tr>
         <td style="padding:10px 0;border-bottom:1px solid #f0ece6;">
           <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Técnica</span><br>
           <span style="font-size:14px;color:#2c2a26;margin-top:2px;display:inline-block;">${cert.technique}</span>
         </td>
       </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#1a1a18;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a18;">
    <tr><td align="center" style="padding:48px 20px;">

      <table width="520" cellpadding="0" cellspacing="0">
        <tr><td style="padding:0 0 32px;text-align:center;">
          <p style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#b5ad9e;margin:0 0 8px;">Hola Carlos,</p>
          <p style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#8a8478;margin:0;line-height:1.5;">
            Tu pieza viene acompañada de su Certificado de Autenticidad.<br>
            Cada creación de Casa Orfebre es única e irrepetible.
          </p>
        </td></tr>
      </table>

      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#FDFCFA;border-radius:12px;overflow:hidden;">
        <tr><td style="height:3px;background:linear-gradient(90deg,#c9a96e,#8B7355,#c9a96e);font-size:0;line-height:0;">&nbsp;</td></tr>

        <tr><td style="padding:40px 48px 0;text-align:center;">
          <p style="font-size:9px;letter-spacing:6px;color:#c9a96e;margin:0 0 16px;">&#9670;&nbsp;&nbsp;&#9670;&nbsp;&nbsp;&#9670;</p>
          <p style="font-family:Georgia,serif;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#b5ad9e;margin:0 0 8px;">Casa Orfebre</p>
          <p style="font-family:Georgia,serif;font-size:24px;color:#2c2a26;margin:0 0 4px;font-weight:normal;letter-spacing:0.5px;">Certificado de Autenticidad</p>
          <p style="font-size:11px;color:#b5ad9e;letter-spacing:1px;margin:0;">Joyería de Autor &middot; Hecho a Mano en Chile</p>
        </td></tr>

        <tr><td style="padding:24px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:38%;height:1px;background:#e8e5df;font-size:0;">&nbsp;</td>
            <td style="width:24%;text-align:center;"><span style="font-size:10px;letter-spacing:3px;color:#c9a96e;">N&ordm;</span></td>
            <td style="width:38%;height:1px;background:#e8e5df;font-size:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <tr><td style="text-align:center;padding:0 48px 28px;">
          <p style="font-family:'Courier New',monospace;font-size:22px;letter-spacing:4px;color:#8B7355;margin:0;font-weight:bold;">${cert.code}</p>
        </td></tr>

        <tr><td style="padding:0 48px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ece6;">
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #f0ece6;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Pieza</span><br>
                <span style="font-size:16px;color:#2c2a26;font-weight:bold;margin-top:2px;display:inline-block;">${cert.product.name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0ece6;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Materiales</span><br>
                <span style="font-size:14px;color:#2c2a26;margin-top:2px;display:inline-block;">${cert.materials}</span>
              </td>
            </tr>
            ${techniqueRow}
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0ece6;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Orfebre</span><br>
                <span style="font-size:14px;color:#2c2a26;margin-top:2px;display:inline-block;">${cert.artisanName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Fecha de Emisión</span><br>
                <span style="font-size:14px;color:#2c2a26;margin-top:2px;display:inline-block;">${issuedDate}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- QR via hosted URL -->
        <tr><td style="padding:0 48px 32px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F2;border-radius:8px;">
            <tr><td style="padding:24px;text-align:center;">
              <div style="display:inline-block;padding:12px;background:#ffffff;border-radius:6px;border:1px solid #e8e5df;">
                <img src="${qrUrl}" width="150" height="150" alt="QR de verificación" style="display:block;">
              </div>
              <p style="font-size:10px;color:#b5ad9e;margin:12px 0 0;letter-spacing:0.5px;">
                Escanea para verificar autenticidad
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 48px 32px;text-align:center;">
          <a href="${pdfUrl}" style="display:inline-block;padding:14px 36px;background-color:#2c2a26;color:#FDFCFA;text-decoration:none;border-radius:6px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;letter-spacing:0.5px;">
            Descargar Certificado PDF
          </a>
        </td></tr>

        <tr><td style="height:3px;background:linear-gradient(90deg,#c9a96e,#8B7355,#c9a96e);font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

      <table width="520" cellpadding="0" cellspacing="0">
        <tr><td style="padding:28px 0;text-align:center;">
          <p style="font-size:11px;color:#5a574f;margin:0 0 8px;">
            Verifica este certificado en
            <a href="${verifyUrl}" style="color:#c9a96e;text-decoration:none;">${verifyUrl}</a>
          </p>
          <p style="font-size:11px;color:#4a4740;margin:0 0 4px;">
            <a href="https://casaorfebre.cl" style="color:#8a8478;text-decoration:none;letter-spacing:1px;">casaorfebre.cl</a>
          </p>
          <p style="font-size:10px;color:#4a4740;margin:0;">
            Joyería de Autor &middot; Hecho a Mano en Chile
          </p>
        </td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;

  console.log(`Enviando a ${TEST_EMAIL}...`);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TEST_EMAIL,
    subject: `Certificado de Autenticidad — ${cert.product.name}`,
    html,
  });

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Email enviado!", data);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
