import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "./base-layout";

/* ================================================================== */
/*  SHARED STYLES                                                      */
/* ================================================================== */

const CTA_PRIMARY =
  "display:inline-block;background:#8B7355;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.5px;";

const CTA_DARK =
  "display:inline-block;background:#1a1a18;color:#FAFAF8;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none;letter-spacing:0.5px;";

const BADGE = (text: string) =>
  `<div style="text-align:center;margin:0 0 24px;">
    <span style="display:inline-block;background:#8B7355;color:#FAFAF8;padding:6px 20px;border-radius:20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${text}</span>
  </div>`;

const HEADING = (text: string) =>
  `<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a18;text-align:center;margin:0 0 16px;line-height:1.3;">${text}</h1>`;

const SUBTEXT = (text: string) =>
  `<p style="font-size:15px;color:#4a4a48;text-align:center;line-height:1.7;margin:0 0 24px;">${text}</p>`;

const FEATURE_CARD_START =
  `<div style="background:#FAFAF8;border:1px solid #e8e4de;border-radius:12px;padding:28px 24px;margin:0 0 28px;">`;

const FEATURE_CARD_TITLE = (text: string) =>
  `<p style="font-size:11px;color:#8B7355;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;text-align:center;font-weight:600;">${text}</p>`;

const CHECK = (text: string) =>
  `<div style="font-size:14px;color:#4a4a48;padding:8px 0;border-bottom:1px solid #f0ece6;">
    <span style="color:#8B7355;margin-right:8px;">&#10003;</span> ${text}
  </div>`;

const DIVIDER = `<div style="height:1px;background:#e8e4de;margin:24px 0;"></div>`;

const CTA_CENTER = (href: string, text: string, style: string = CTA_PRIMARY) =>
  `<p style="text-align:center;margin:0 0 24px;">
    <a href="${href}" style="${style}">${text}</a>
  </p>`;

const NOTE = (text: string) =>
  `<div style="background:#f8f6f2;border-radius:8px;padding:16px 20px;margin:0 0 8px;">
    <p style="font-size:13px;color:#6a6a68;margin:0;line-height:1.6;text-align:center;">${text}</p>
  </div>`;

const STAT_BLOCK = (stats: { value: string; label: string }[]) =>
  `<div style="display:flex;text-align:center;margin:0 0 24px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      ${stats.map((s) => `<td style="padding:12px;text-align:center;">
        <p style="font-family:Georgia,serif;font-size:24px;color:#8B7355;margin:0;font-weight:400;">${s.value}</p>
        <p style="font-size:11px;color:#9e9a90;margin:4px 0 0;text-transform:uppercase;letter-spacing:1px;">${s.label}</p>
      </td>`).join("")}
    </tr></table>
  </div>`;

/* ================================================================== */
/*  TRACKING HELPERS                                                    */
/* ================================================================== */

function trackingUrl(token: string): string {
  return `https://casaorfebre.cl/api/invitaciones/aceptar?token=${token}`;
}

function openPixel(token: string): string {
  return `<img src="https://casaorfebre.cl/api/invitaciones/open?token=${encodeURIComponent(token)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;
}

/* ================================================================== */
/*  INITIAL INVITATIONS                                                */
/* ================================================================== */

// ── Pioneer ──────────────────────────────────────────────────────────

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
        ${BADGE("Acceso Anticipado")}
        ${HEADING("Has sido seleccionado como Pionero")}
        ${SUBTEXT("Estamos construyendo la plataforma de joyería artesanal más importante de Chile, y queremos que seas parte de los primeros en vivirla.")}

        ${STAT_BLOCK([
          { value: "1ros", label: "Acceso" },
          { value: "∞", label: "Beneficios" },
          { value: "100%", label: "Permanente" },
        ])}

        ${FEATURE_CARD_START}
          ${FEATURE_CARD_TITLE("Como Pionero tendrás")}
          ${CHECK("Acceso anticipado a la plataforma antes del lanzamiento público")}
          ${CHECK("Beneficios exclusivos permanentes en tu cuenta")}
          ${CHECK("Tu voz dará forma a las funcionalidades que construimos")}
          ${CHECK("Acceso a orfebres y piezas antes que nadie")}
          ${CHECK("Badge de Pionero visible en tu perfil")}
        </div>

        ${SUBTEXT("Somos un ecosistema que conecta orfebres verificados con compradores que valoran lo auténtico — y tú llegas antes que todos.")}

        ${CTA_CENTER(trackingUrl(token), "Ver mi invitación")}

        ${DIVIDER}

        ${NOTE("Esta invitación es personal e intransferible. Cupos limitados.")}

        ${openPixel(token)}
      `),
    });
  } catch (e) {
    console.error(`[INVITATION EMAIL] Failed to send to ${to}:`, e);
  }
}

// ── Artisan ──────────────────────────────────────────────────────────

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
        ${BADGE("Para Orfebres")}
        ${HEADING("Tu taller merece una vitrina a la altura de tu oficio")}
        ${SUBTEXT("Casa Orfebre es la plataforma curada para orfebres chilenos independientes. Fuiste invitado porque creemos que tu trabajo merece más visibilidad que la que dan las ferias y las redes sociales.")}

        ${STAT_BLOCK([
          { value: "24/7", label: "Vitrina" },
          { value: "6", label: "Canales" },
          { value: "$0", label: "Costo inicial" },
        ])}

        ${FEATURE_CARD_START}
          ${FEATURE_CARD_TITLE("Lo que obtienes")}
          ${CHECK("Vitrina profesional con criterio editorial")}
          ${CHECK("IA para gestionar tu catálogo y optimizar fotos")}
          ${CHECK("Google Shopping + Pinterest + Instagram automático")}
          ${CHECK("Pagos directos vía Mercado Pago — sin intermediarios")}
          ${CHECK("Certificado de autenticidad digital con QR")}
          ${CHECK("Compradores verificados que valoran el trabajo artesanal")}
          ${CHECK("Soporte dedicado para orfebres")}
        </div>

        <p style="font-size:14px;color:#4a4a48;text-align:center;line-height:1.6;margin:0 0 24px;">
          El proceso de postulación es simple.<br>Revisamos tu trabajo en <strong>3 a 7 días hábiles</strong>.
        </p>

        ${CTA_CENTER(trackingUrl(token), "Conocer la plataforma")}

        ${DIVIDER}

        ${NOTE("Solo aceptamos orfebres que cumplen nuestros estándares de calidad y autenticidad.")}

        ${openPixel(token)}
      `),
    });
  } catch (e) {
    console.error(`[INVITATION EMAIL] Failed to send to ${to}:`, e);
  }
}

// ── Buyer ────────────────────────────────────────────────────────────

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
        ${BADGE("Invitación Exclusiva")}
        ${HEADING("Joyería que cuenta historias")}
        ${SUBTEXT("Casa Orfebre es una galería digital de joyería de autor hecha a mano por orfebres chilenos verificados. Cada pieza tiene historia, materiales nobles y un certificado de autenticidad.")}

        ${STAT_BLOCK([
          { value: "100%", label: "Artesanal" },
          { value: "QR", label: "Certificado" },
          { value: "14d", label: "Garantía" },
        ])}

        ${FEATURE_CARD_START}
          ${FEATURE_CARD_TITLE("Por qué Casa Orfebre")}
          ${CHECK("Piezas únicas de orfebres chilenos verificados")}
          ${CHECK("Certificado de autenticidad digital con código QR")}
          ${CHECK("Búsqueda inteligente con IA — encuentra lo que imaginas")}
          ${CHECK("Pago protegido vía Mercado Pago")}
          ${CHECK("Garantía de 14 días en piezas estándar")}
          ${CHECK("Envío con seguimiento a todo Chile")}
        </div>

        ${SUBTEXT("Encontrarás anillos, collares, aros y pulseras creados en talleres reales, por artesanos con nombre y rostro.")}

        ${CTA_CENTER(trackingUrl(token), "Explorar la colección", CTA_DARK)}

        ${openPixel(token)}
      `),
    });
  } catch (e) {
    console.error(`[INVITATION EMAIL] Failed to send to ${to}:`, e);
  }
}

/* ================================================================== */
/*  FOLLOW-UP 1 (Day 3) — Gentle reminder                             */
/* ================================================================== */

export async function sendFollowUp1Email(
  to: string,
  { token, type }: { token: string; type: "PIONEER" | "ARTISAN" | "BUYER" },
): Promise<void> {
  const config = {
    PIONEER: {
      subject: "Tu lugar como Pionero sigue reservado",
      badge: "Recordatorio",
      heading: "No queremos que pierdas tu lugar",
      body: "Hace unos días te invitamos al programa Pionero de Casa Orfebre. Tu invitación sigue activa, pero los cupos son limitados.",
      highlight: "Los Pioneros acceden primero a todo: orfebres, piezas, funcionalidades. Y los beneficios son permanentes.",
      cta: "Ver mi invitación",
    },
    ARTISAN: {
      subject: "Tu invitación a Casa Orfebre sigue activa",
      badge: "Recordatorio",
      heading: "Tu vitrina te espera",
      body: "Te invitamos a exhibir tu trabajo en Casa Orfebre, la plataforma curada de joyería artesanal chilena. Tu invitación sigue vigente.",
      highlight: "Mientras lees esto, otros orfebres ya están publicando sus piezas, apareciendo en Google Shopping y recibiendo pedidos de todo Chile.",
      cta: "Conocer la plataforma",
    },
    BUYER: {
      subject: "Las piezas que te reservamos siguen disponibles",
      badge: "Recordatorio",
      heading: "Hay piezas esperándote",
      body: "Te invitamos a descubrir Casa Orfebre, la galería de joyería de autor hecha a mano en Chile. Tu acceso sigue disponible.",
      highlight: "Cada semana nuevos orfebres publican piezas únicas. Anillos, collares y aros que no encontrarás en ningún otro lugar.",
      cta: "Explorar la colección",
    },
  };

  const c = config[type];

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: c.subject,
      html: emailLayout(`
        ${BADGE(c.badge)}
        ${HEADING(c.heading)}
        ${SUBTEXT(c.body)}

        <div style="background:#FAFAF8;border-left:3px solid #8B7355;padding:16px 20px;margin:0 0 24px;border-radius:0 8px 8px 0;">
          <p style="font-size:14px;color:#1a1a18;margin:0;line-height:1.6;font-style:italic;">
            ${c.highlight}
          </p>
        </div>

        ${CTA_CENTER(trackingUrl(token), c.cta)}

        <p style="font-size:12px;color:#9e9a90;text-align:center;margin:0;">
          Si no te interesa, simplemente ignora este mensaje. No volveremos a escribirte.
        </p>

        ${openPixel(token)}
      `),
    });
  } catch (e) {
    console.error(`[FOLLOW-UP 1] Failed to send to ${to}:`, e);
  }
}

/* ================================================================== */
/*  FOLLOW-UP 2 (Day 7) — Last chance, social proof                    */
/* ================================================================== */

export async function sendFollowUp2Email(
  to: string,
  { token, type }: { token: string; type: "PIONEER" | "ARTISAN" | "BUYER" },
): Promise<void> {
  const config = {
    PIONEER: {
      subject: "Último aviso: tu invitación de Pionero está por vencer",
      badge: "Última oportunidad",
      heading: "Los cupos se están agotando",
      body: "Esta es la última vez que te escribimos. Tu invitación al programa Pionero sigue activa, pero no por mucho más tiempo.",
      testimonial: "Los Pioneros que ya se registraron están accediendo a orfebres y piezas exclusivas antes que nadie. Sus beneficios son permanentes — los tuyos también lo serían.",
      cta: "Activar mi lugar de Pionero",
    },
    ARTISAN: {
      subject: "Última oportunidad: tu invitación a Casa Orfebre",
      badge: "Último aviso",
      heading: "Otros orfebres ya están vendiendo",
      body: "Este es nuestro último mensaje. Orfebres de todo Chile ya están recibiendo pedidos a través de Casa Orfebre.",
      testimonial: "\"Vendí más en un mes en Casa Orfebre que en tres meses de feria. Y lo mejor: no tengo que preocuparme por cobros ni disputas.\" — María José L., Valparaíso",
      cta: "Conocer la plataforma",
    },
    BUYER: {
      subject: "Última oportunidad: piezas únicas te esperan",
      badge: "Último aviso",
      heading: "Las piezas no esperan para siempre",
      body: "Este es nuestro último mensaje. La colección de Casa Orfebre crece cada semana con piezas únicas que se agotan rápidamente.",
      testimonial: "\"Descubrí a una orfebre increíble de Chiloé que trabaja con plata y madera nativa. Terminé comprando tres piezas. Es adictivo cuando sabes la historia.\" — Carolina F., Concepción",
      cta: "Ver la colección",
    },
  };

  const c = config[type];

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: c.subject,
      html: emailLayout(`
        ${BADGE(c.badge)}
        ${HEADING(c.heading)}
        ${SUBTEXT(c.body)}

        <div style="background:#1a1a18;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
          <p style="font-size:14px;color:#FAFAF8;margin:0;line-height:1.6;font-style:italic;text-align:center;">
            ${c.testimonial}
          </p>
        </div>

        ${CTA_CENTER(trackingUrl(token), c.cta)}

        <p style="font-size:12px;color:#9e9a90;text-align:center;margin:0;">
          Este es nuestro último mensaje. No recibirás más emails sobre esta invitación.
        </p>

        ${openPixel(token)}
      `),
    });
  } catch (e) {
    console.error(`[FOLLOW-UP 2] Failed to send to ${to}:`, e);
  }
}

/* ================================================================== */
/*  FOLLOW-UP 3 (Day 14) — Final urgency, invitation expiring         */
/* ================================================================== */

export async function sendFollowUp3Email(
  to: string,
  { token, type }: { token: string; type: "PIONEER" | "ARTISAN" | "BUYER" },
): Promise<void> {
  const config = {
    PIONEER: {
      subject: "Última oportunidad — tu invitación vence pronto",
      badge: "Invitación por vencer",
      heading: "Tu invitación de Pionero expira en días",
      body: "Esta es tu última oportunidad. Tu invitación al programa Pionero será desactivada pronto y los beneficios permanentes se perderán.",
      urgency: "Una vez que expire, no podremos garantizar los mismos beneficios. Los Pioneros actuales ya disfrutan de acceso exclusivo, precios preferenciales y prioridad en todo.",
      cta: "Activar antes de que expire",
    },
    ARTISAN: {
      subject: "Última oportunidad — tu invitación vence pronto",
      badge: "Invitación por vencer",
      heading: "Tu vitrina se cerrará pronto",
      body: "Tu invitación a Casa Orfebre está por vencer. Después de esta fecha, deberás postular nuevamente y no garantizamos disponibilidad.",
      urgency: "Cada día que pasa, más orfebres se suman y la competencia por visibilidad crece. Los primeros en llegar tienen ventaja permanente en posicionamiento y clientes.",
      cta: "Activar mi vitrina ahora",
    },
    BUYER: {
      subject: "Última oportunidad — tu invitación vence pronto",
      badge: "Invitación por vencer",
      heading: "Tu acceso exclusivo está por expirar",
      body: "Tu invitación a Casa Orfebre vence pronto. Después no podremos garantizarte el mismo acceso a piezas y orfebres exclusivos.",
      urgency: "Las piezas artesanales son únicas — cuando se van, no vuelven. Cada semana se agotan las más buscadas y los coleccionistas registrados tienen prioridad.",
      cta: "Activar mi acceso ahora",
    },
  };

  const c = config[type];

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: c.subject,
      html: emailLayout(`
        ${BADGE(c.badge)}
        ${HEADING(c.heading)}
        ${SUBTEXT(c.body)}

        <div style="background:#8B7355;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
          <p style="font-size:14px;color:#FAFAF8;margin:0;line-height:1.6;text-align:center;">
            ⏳ ${c.urgency}
          </p>
        </div>

        ${CTA_CENTER(trackingUrl(token), c.cta, CTA_DARK)}

        <p style="font-size:12px;color:#9e9a90;text-align:center;margin:0;">
          Este es nuestro mensaje final. Tu invitación será desactivada automáticamente si no la aceptas.
        </p>

        ${openPixel(token)}
      `),
    });
  } catch (e) {
    console.error(`[FOLLOW-UP 3] Failed to send to ${to}:`, e);
  }
}
