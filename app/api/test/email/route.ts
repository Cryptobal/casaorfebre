import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/emails/templates";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { to } = (await req.json()) as { to?: string };
  const recipient = to || "carlos.irigoyen@gmail.com";

  const html = `
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1a1a18;margin:0 0 16px;">Hola Carlos,</h2>
    <p style="font-size:15px;color:#4a4a48;line-height:1.7;margin:0 0 16px;">
      Este es un correo de prueba para verificar que el nuevo footer con redes sociales
      y datos de contacto se muestra correctamente en todos los emails de Casa Orfebre.
    </p>
    <p style="font-size:15px;color:#4a4a48;line-height:1.7;margin:0 0 16px;">
      Si puedes ver los iconos de redes sociales (Instagram, Facebook, Pinterest, X, TikTok)
      y el enlace a <strong>contacto@casaorfebre.cl</strong> abajo, todo funciona correctamente.
    </p>
    <p style="text-align:center;margin:24px 0;">
      <a href="https://casaorfebre.cl" style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
        Visitar Casa Orfebre
      </a>
    </p>
  `;

  const result = await sendEmail(recipient, "Prueba de Footer — Casa Orfebre", html);
  if (!result) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id, to: recipient });
}
