import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "./base-layout";

const CTA_PRIMARY =
  "display:inline-block;background:#8B7355;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;";

const CTA_SECONDARY =
  "display:inline-block;background:#1a1a18;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none;letter-spacing:0.5px;";

function trackingUrl(token: string): string {
  return `https://casaorfebre.cl/api/invitaciones/aceptar?token=${token}`;
}

function openTrackingPixel(token: string): string {
  return `<img src="https://casaorfebre.cl/api/invitaciones/open?token=${encodeURIComponent(token)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;
}

function featureItem(text: string): string {
  return `<div style="font-size:14px;color:#4a4a48;padding:8px 0;border-bottom:1px solid #f0ece6;">
    <span style="color:#8B7355;margin-right:8px;">&#10003;</span> ${text}
  </div>`;
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
        <!-- Badge -->
        <div style="text-align:center;margin:0 0 24px;">
          <span style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:6px 20px;border-radius:20px;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Acceso Anticipado</span>
        </div>

        <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a18;text-align:center;margin:0 0 16px;line-height:1.3;">
          Has sido seleccionado
        </h1>

        <p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.6;margin:0 0 24px;">
          Estamos construyendo la plataforma de joyería artesanal más importante de Chile,
          y queremos que seas parte de los primeros en vivirla.
        </p>

        <!-- Beneficios -->
        <div style="background:#FAFAF8;border:1px solid #e8e4de;border-radius:12px;padding:28px 24px;margin:0 0 28px;">
          <p style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px;text-align:center;">Como Pionero tendrás</p>
          ${featureItem("Acceso anticipado a la plataforma antes del lanzamiento público")}
          ${featureItem("Beneficios exclusivos permanentes en tu cuenta")}
          ${featureItem("Tu voz dará forma a las funcionalidades que construimos")}
          ${featureItem("Acceso a orfebres y piezas antes que nadie")}
        </div>

        <p style="font-size:14px;color:#4a4a48;text-align:center;line-height:1.6;margin:0 0 24px;">
          Somos un ecosistema que conecta orfebres verificados con compradores que valoran
          lo auténtico — y tú llegas antes que todos.
        </p>

        <p style="text-align:center;margin:0 0 24px;">
          <a href="${trackingUrl(token)}" style="${CTA_PRIMARY}">Ver mi invitación</a>
        </p>

        <!-- Nota -->
        <div style="background:#f8f6f2;border-radius:8px;padding:16px 20px;margin:0 0 8px;">
          <p style="font-size:13px;color:#6a6a68;margin:0;line-height:1.6;text-align:center;">
            Esta invitación es personal e intransferible. Cupos limitados.
          </p>
        </div>

        ${openTrackingPixel(token)}
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
        <!-- Badge -->
        <div style="text-align:center;margin:0 0 24px;">
          <span style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:6px 20px;border-radius:20px;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Para Orfebres</span>
        </div>

        <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a18;text-align:center;margin:0 0 16px;line-height:1.3;">
          Tu taller merece una vitrina a la altura de tu oficio
        </h1>

        <p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.6;margin:0 0 24px;">
          Casa Orfebre es la plataforma curada para orfebres chilenos independientes.
          Fuiste invitado porque creemos que tu trabajo merece más visibilidad que la que
          dan las ferias y las redes sociales.
        </p>

        <!-- Beneficios -->
        <div style="background:#FAFAF8;border:1px solid #e8e4de;border-radius:12px;padding:28px 24px;margin:0 0 28px;">
          <p style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px;text-align:center;">Lo que obtienes</p>
          ${featureItem("Vitrina profesional con criterio editorial")}
          ${featureItem("Herramientas con IA para gestionar tu catálogo")}
          ${featureItem("Pagos directos vía Mercado Pago — sin intermediarios")}
          ${featureItem("Compradores verificados que valoran el trabajo artesanal")}
          ${featureItem("Soporte dedicado para orfebres")}
        </div>

        <p style="font-size:14px;color:#4a4a48;text-align:center;line-height:1.6;margin:0 0 24px;">
          El proceso de postulación es simple. Revisamos tu trabajo en 3 a 7 días hábiles.
        </p>

        <p style="text-align:center;margin:0 0 24px;">
          <a href="${trackingUrl(token)}" style="${CTA_PRIMARY}">Conocer la plataforma</a>
        </p>

        <!-- Nota -->
        <div style="background:#f8f6f2;border-radius:8px;padding:16px 20px;margin:0 0 8px;">
          <p style="font-size:13px;color:#6a6a68;margin:0;line-height:1.6;text-align:center;">
            Solo aceptamos orfebres que cumplen nuestros estándares de calidad y autenticidad.
          </p>
        </div>

        ${openTrackingPixel(token)}
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
        <!-- Badge -->
        <div style="text-align:center;margin:0 0 24px;">
          <span style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:6px 20px;border-radius:20px;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Invitación Exclusiva</span>
        </div>

        <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a18;text-align:center;margin:0 0 16px;line-height:1.3;">
          Joyería que cuenta historias
        </h1>

        <p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.6;margin:0 0 24px;">
          Casa Orfebre es una galería digital de joyería de autor hecha a mano
          por orfebres chilenos verificados. Cada pieza tiene historia, materiales nobles
          y un certificado de autenticidad.
        </p>

        <!-- Beneficios -->
        <div style="background:#FAFAF8;border:1px solid #e8e4de;border-radius:12px;padding:28px 24px;margin:0 0 28px;">
          <p style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px;text-align:center;">Por qué Casa Orfebre</p>
          ${featureItem("Piezas únicas de orfebres chilenos verificados")}
          ${featureItem("Certificado de autenticidad digital con código QR")}
          ${featureItem("Pago protegido vía Mercado Pago")}
          ${featureItem("Garantía de 14 días en piezas estándar")}
          ${featureItem("Envío con seguimiento a todo Chile")}
        </div>

        <p style="font-size:14px;color:#4a4a48;text-align:center;line-height:1.6;margin:0 0 24px;">
          Encontrarás anillos, collares, aros y pulseras creados en talleres reales,
          por artesanos con nombre y rostro. No encontrarás estas piezas en ningún otro lugar.
        </p>

        <p style="text-align:center;margin:0 0 24px;">
          <a href="${trackingUrl(token)}" style="${CTA_SECONDARY}">Explorar la colección</a>
        </p>

        ${openTrackingPixel(token)}
      `),
    });
  } catch (e) {
    console.error(`[INVITATION EMAIL] Failed to send to ${to}:`, e);
  }
}
