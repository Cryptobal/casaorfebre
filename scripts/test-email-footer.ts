/**
 * Quick one-off script to test the new email footer.
 * Usage: npx tsx scripts/test-email-footer.ts
 */
import "dotenv/config";
import { getResend, FROM_EMAIL } from "../lib/resend";
import { emailLayout } from "../lib/emails/base-layout";

async function main() {
  const to = "carlos.irigoyen@gmail.com";
  const subject = "Prueba de Footer — Casa Orfebre";
  const content = `
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1a18;margin:0 0 16px;">Hola Carlos,</h2>
    <p style="font-size:15px;color:#4a4a48;line-height:1.7;margin:0 0 16px;">
      Este es un correo de prueba para verificar que el nuevo footer con redes sociales
      y datos de contacto se muestra correctamente en todos los emails de Casa Orfebre.
    </p>
    <p style="font-size:15px;color:#4a4a48;line-height:1.7;margin:0 0 16px;">
      Si puedes ver los &iacute;conos de redes sociales (Instagram, Facebook, Pinterest, X, TikTok)
      y el enlace a <strong>contacto@casaorfebre.cl</strong> abajo, todo est&aacute; funcionando correctamente.
    </p>
    <p style="text-align:center;margin:24px 0;">
      <a href="https://casaorfebre.cl" style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
        Visitar Casa Orfebre
      </a>
    </p>
  `;

  const html = emailLayout(content);
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Error sending test email:", error);
    process.exit(1);
  }

  console.log("Test email sent successfully!", data);
}

main();
