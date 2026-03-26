import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Casa Orfebre <contacto@casaorfebre.cl>",
      to: ["contacto@casaorfebre.cl", "carlos.irigoyen@me.com"],
      subject: "Test Casa Orfebre - Email Funcionando",
      html:
        "<h1>Los emails de Casa Orfebre funcionan!</h1><p>Este es un email de prueba.</p>",
    });
    if (error) {
      return Response.json(
        {
          success: false,
          error: error,
          hint: "Resend devolvió error sin lanzar excepción — revisa API key, dominio `from` y destinatarios.",
        },
        { status: 500 },
      );
    }
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
