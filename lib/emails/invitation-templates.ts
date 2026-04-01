import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "./base-layout";

const CTA_STYLE =
  "display:inline-block;padding:14px 32px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:500;letter-spacing:0.3px;";

function trackingUrl(token: string): string {
  return `https://casaorfebre.cl/api/invitaciones/aceptar?token=${token}`;
}

// ---------------------------------------------------------------------------
// 1. Pioneer Invitation
// ---------------------------------------------------------------------------

export async function sendPioneerInvitationEmail(
  to: string,
  { token }: { token: string },
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Una invitación personal a Casa Orfebre",
      html: emailLayout(`
        <p style="margin:0 0 16px;">
          Hola,
        </p>
        <p style="margin:0 0 16px;">
          Estamos construyendo la plataforma de joyería artesanal más importante de Chile,
          y queremos que seas parte de los primeros en vivirla.
        </p>
        <p style="margin:0 0 24px;">
          Como Pionero tendrás acceso anticipado a la plataforma, beneficios exclusivos
          permanentes, y tu voz dará forma a las funcionalidades que construimos.
          Somos un ecosistema que conecta orfebres verificados con compradores que valoran
          lo auténtico — y tú llegas antes que todos.
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${trackingUrl(token)}" style="${CTA_STYLE}">Ver mi invitación</a>
        </p>
        <p style="margin:0;font-size:12px;color:#9e9a90;text-align:center;">
          Esta invitación es personal e intransferible.
        </p>
      `),
    });
  } catch (e) {
    console.error(`[INVITATION EMAIL] Failed to send to ${to}:`, e);
  }
}

// ---------------------------------------------------------------------------
// 2. Artisan Invitation
// ---------------------------------------------------------------------------

export async function sendArtisanInvitationEmail(
  to: string,
  { token }: { token: string },
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Tu taller merece una vitrina a la altura de tu oficio",
      html: emailLayout(`
        <p style="margin:0 0 16px;">
          Casa Orfebre es la plataforma curada para orfebres chilenos independientes.
          Fuiste invitado porque creemos que tu trabajo merece más visibilidad que la que
          dan las ferias y las redes sociales.
        </p>
        <p style="margin:0 0 16px;">
          En Casa Orfebre tendrás una vitrina profesional, herramientas con inteligencia
          artificial para gestionar tu catálogo, y la mayor parte de cada venta llega
          directamente a ti — sin intermediarios innecesarios.
        </p>
        <p style="margin:0 0 24px;">
          El proceso de postulación es simple. Revisamos tu trabajo en 3 a 7 días hábiles.
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${trackingUrl(token)}" style="${CTA_STYLE}">Conocer la plataforma</a>
        </p>
        <p style="margin:0;font-size:12px;color:#9e9a90;text-align:center;">
          Solo aceptamos orfebres que cumplen nuestros estándares de calidad y autenticidad.
        </p>
      `),
    });
  } catch (e) {
    console.error(`[INVITATION EMAIL] Failed to send to ${to}:`, e);
  }
}

// ---------------------------------------------------------------------------
// 3. Buyer Invitation
// ---------------------------------------------------------------------------

export async function sendBuyerInvitationEmail(
  to: string,
  { token }: { token: string },
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Joyería artesanal chilena única — te reservamos un lugar",
      html: emailLayout(`
        <p style="margin:0 0 16px;">
          Casa Orfebre es una galería digital de joyería de autor hecha a mano
          por orfebres chilenos verificados. Cada pieza tiene historia, materiales nobles
          y un certificado de autenticidad.
        </p>
        <p style="margin:0 0 16px;">
          Encontrarás piezas únicas que no existen en ninguna otra tienda.
          Anillos, collares, aros y pulseras creadas en talleres reales, por artesanos
          con nombre y rostro.
        </p>
        <p style="margin:0 0 24px;">
          Compra con confianza: pago protegido, garantía de 14 días
          y envío con seguimiento a todo Chile.
        </p>
        <p style="margin:0 0 8px;text-align:center;">
          <a href="${trackingUrl(token)}" style="${CTA_STYLE}">Explorar la colección</a>
        </p>
      `),
    });
  } catch (e) {
    console.error(`[INVITATION EMAIL] Failed to send to ${to}:`, e);
  }
}
