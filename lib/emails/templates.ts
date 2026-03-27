import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "./base-layout";
import { formatCLP } from "@/lib/utils";

/** Base URL for links in transactional emails (no trailing slash). */
function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl").replace(
    /\/$/,
    "",
  );
}

async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: emailLayout(html),
  });
  if (error) {
    console.error(`Email failed [${subject}]:`, error);
    return;
  }
  return data;
}

// ---------------------------------------------------------------------------
// 0. Email Verification
// ---------------------------------------------------------------------------
export async function sendVerificationEmail(
  to: string,
  { name, token }: { name: string; token: string },
) {
  const verifyUrl = `${appUrl()}/api/auth/verify?token=${token}`;

  await sendEmail(
    to,
    "Verifica tu email — Casa Orfebre",
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Confirma tu email haciendo clic en el siguiente enlace para completar tu registro en <strong>Casa Orfebre</strong>.</p>
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Verificar mi email</a>
     </p>
     <p style="margin:0 0 0;font-size:13px;color:#9e9a90;">Este enlace expira en 24 horas.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 0b. Password reset
// ---------------------------------------------------------------------------
export async function sendPasswordResetEmail(
  to: string,
  { name, token }: { name: string; token: string },
) {
  const base = appUrl();
  const resetUrl = `${base}/recuperar-contrasena/${encodeURIComponent(token)}`;

  await sendEmail(
    to,
    "Contraseña — Casa Orfebre",
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Recibimos una solicitud para <strong>crear o actualizar la contraseña</strong> de tu cuenta en <strong>Casa Orfebre</strong> (sirve también si es tu primer acceso con correo y contraseña).</p>
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Definir contraseña</a>
     </p>
     <p style="margin:0 0 8px;font-size:13px;color:#9e9a90;">El enlace vence en 1 hora. Si no pediste este cambio, puedes ignorar este mensaje.</p>
     <p style="margin:0;font-size:12px;color:#b5ad9e;word-break:break-all;">${resetUrl}</p>`,
  );
}

// ---------------------------------------------------------------------------
// 1. Buyer Welcome
// ---------------------------------------------------------------------------
export async function sendBuyerWelcomeEmail(
  to: string,
  { name }: { name: string },
) {
  const base = appUrl();
  await sendEmail(
    to,
    "Bienvenido a Casa Orfebre",
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Te damos la bienvenida a <strong>Casa Orfebre</strong>, tu espacio para descubrir joyería de autor hecha a mano por artesanos chilenos.</p>
     <p style="margin:0 0 16px;">Explora nuestro catálogo y encuentra piezas únicas creadas con dedicación y oficio.</p>
     <p style="margin:0 0 0;">
       <a href="${base}/coleccion" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Explorar piezas</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 2. Artisan Welcome (application approved)
// ---------------------------------------------------------------------------
export async function sendArtisanWelcomeEmail(
  to: string,
  { name }: { name: string },
) {
  const base = appUrl();
  await sendEmail(
    to,
    "¡Tu postulación fue aprobada!",
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">¡Felicidades! Tu postulación a <strong>Casa Orfebre</strong> ha sido aprobada. Ya formas parte de nuestra comunidad de artesanos.</p>
     <p style="margin:0 0 8px;font-weight:bold;">¿Cómo ingresar al portal?</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;font-size:14px;line-height:1.5;">
       Tu cuenta quedó asociada a <strong>este mismo correo</strong>. No recibiste una contraseña automática.<br><br>
       <strong>Si usas Google</strong> (p. ej. Gmail) con este email: entra en <a href="${base}/login" style="color:#8B7355;">Iniciar sesión</a> y elige <strong>«Continuar con Google»</strong>.<br><br>
       <strong>Si prefieres correo y contraseña:</strong> en la misma página de inicio de sesión abre <strong>«¿Olvidaste tu contraseña?»</strong>, ingresa este correo y te enviaremos un enlace para <strong>definir tu contraseña</strong> la primera vez (o cambiarla si ya tenías una).
     </p>
     <p style="margin:0 0 16px;">Luego, en el portal:</p>
     <ol style="margin:0 0 16px;padding-left:20px;">
       <li style="margin-bottom:8px;">Vincula tu cuenta de Mercado Pago para recibir pagos.</li>
       <li style="margin-bottom:8px;">Sube tus primeras piezas al catálogo.</li>
     </ol>
     <p style="margin:0 0 0;">
       <a href="${base}/login" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ir a iniciar sesión</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 3. Application Rejected
// ---------------------------------------------------------------------------
export async function sendApplicationRejectedEmail(
  to: string,
  { name, reason }: { name: string; reason: string },
) {
  await sendEmail(
    to,
    "Sobre tu postulación a Casa Orfebre",
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Revisamos tu postulación con atención. Lamentablemente, en esta oportunidad no podemos aprobarla.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;"><strong>Motivo:</strong> ${reason}</p>
     <p style="margin:0 0 16px;">Te invitamos a postular nuevamente cuando lo desees. Estaremos encantados de revisar tu trabajo otra vez.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 4. Purchase Confirmation (buyer)
// ---------------------------------------------------------------------------
export async function sendPurchaseConfirmationEmail(
  to: string,
  { name, orderNumber, items, total, isGift, giftMessage, giftWrapping }: {
    name: string;
    orderNumber: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
    isGift?: boolean;
    giftMessage?: string | null;
    giftWrapping?: boolean;
  },
) {
  const base = appUrl();

  // For gift orders: hide prices, show gift section
  let itemsHtml: string;
  if (isGift) {
    const giftItemRows = items
      .map(
        (i) =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;">${i.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;text-align:center;">${i.quantity}</td>
          </tr>`,
      )
      .join("");

    const giftIncludes: string[] = [];
    if (giftMessage) giftIncludes.push("Tarjeta con tu mensaje personal");
    if (giftWrapping) giftIncludes.push("Empaque de regalo especial");

    const giftIncludesHtml = giftIncludes.length > 0
      ? `<div style="margin:16px 0;padding:16px;background-color:#fef9ee;border-radius:8px;border:1px solid #f3e8d0;">
           <p style="margin:0 0 8px;font-weight:bold;">🎁 Tu regalo incluye:</p>
           <ul style="margin:0;padding-left:20px;">
             ${giftIncludes.map((g) => `<li style="margin-bottom:4px;">${g}</li>`).join("")}
           </ul>
           <p style="margin:8px 0 0;font-size:13px;color:#9e9a90;">Los precios no aparecen en el paquete</p>
         </div>`
      : "";

    itemsHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
       <tr style="font-size:13px;color:#9e9a90;">
         <td style="padding:8px 0;border-bottom:1px solid #e8e5df;">Producto</td>
         <td style="padding:8px 0;border-bottom:1px solid #e8e5df;text-align:center;">Cant.</td>
       </tr>
       ${giftItemRows}
     </table>
     ${giftIncludesHtml}`;
  } else {
    const itemRows = items
      .map(
        (i) =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;">${i.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;text-align:center;">${i.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e8e5df;text-align:right;">${formatCLP(i.price)}</td>
          </tr>`,
      )
      .join("");

    itemsHtml = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
       <tr style="font-size:13px;color:#9e9a90;">
         <td style="padding:8px 0;border-bottom:1px solid #e8e5df;">Producto</td>
         <td style="padding:8px 0;border-bottom:1px solid #e8e5df;text-align:center;">Cant.</td>
         <td style="padding:8px 0;border-bottom:1px solid #e8e5df;text-align:right;">Precio</td>
       </tr>
       ${itemRows}
       <tr>
         <td colspan="2" style="padding:12px 0;font-weight:bold;">Total</td>
         <td style="padding:12px 0;text-align:right;font-weight:bold;">${formatCLP(total)}</td>
       </tr>
     </table>`;
  }

  await sendEmail(
    to,
    `Confirmación de compra #${orderNumber}`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Tu compra fue confirmada. Aquí está el resumen de tu pedido <strong>#${orderNumber}</strong>:</p>
     ${itemsHtml}
     <p style="margin:0 0 0;">
       <a href="${base}/portal/comprador/pedidos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis pedidos</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 5. New Order (artisan) — NO buyer contact info
// ---------------------------------------------------------------------------
export async function sendNewOrderToArtisanEmail(
  to: string,
  {
    artisanName,
    orderNumber,
    orderId,
    items,
    shippingName,
    shippingAddress,
    shippingCity,
    shippingRegion,
    isGift,
    giftMessage,
    giftWrapping,
  }: {
    artisanName: string;
    orderNumber: string;
    orderId: string;
    items: { name: string; quantity: number; price: number }[];
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingRegion: string;
    isGift?: boolean;
    giftMessage?: string | null;
    giftWrapping?: boolean;
  },
) {
  const base = appUrl();
  const itemList = items
    .map((i) => `<li style="margin-bottom:4px;">${i.name} x${i.quantity} — ${formatCLP(i.price)}</li>`)
    .join("");

  const giftHtml = isGift
    ? `<div style="margin:0 0 16px;padding:16px;background-color:#fef9ee;border-radius:8px;border:1px solid #f3e8d0;">
         <p style="margin:0 0 8px;font-weight:bold;">🎁 Este pedido es un regalo</p>
         ${giftMessage ? `<p style="margin:0 0 8px;font-style:italic;">Mensaje para incluir en tarjeta: &ldquo;${giftMessage}&rdquo;</p>` : ""}
         ${giftWrapping ? `<p style="margin:0;font-size:13px;color:#92400e;">Por favor incluye caja de regalo y escribe el mensaje en una tarjeta.</p>` : ""}
       </div>`
    : "";

  await sendEmail(
    to,
    `Nuevo pedido #${orderNumber}`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tienes un nuevo pedido <strong>#${orderNumber}</strong>.</p>
     <p style="margin:0 0 8px;font-weight:bold;">Productos:</p>
     <ul style="margin:0 0 16px;padding-left:20px;">${itemList}</ul>
     ${giftHtml}
     <p style="margin:0 0 8px;font-weight:bold;">Dirección de envío:</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;">
       ${shippingName}<br>
       ${shippingAddress}<br>
       ${shippingCity}, ${shippingRegion}
     </p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/orfebre/pedidos/${orderId}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver pedido</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 6. Order Shipped
// ---------------------------------------------------------------------------

const CARRIER_TRACKING_URLS: Record<string, string> = {
  "Chilexpress": "https://www.chilexpress.cl/estado-de-envio?tracking=",
  "Starken": "https://www.starken.cl/seguimiento?codigo=",
  "Correos de Chile": "https://www.correos.cl/web/guest/seguimiento-en-linea?tracking=",
  "Blue Express": "https://www.blue.cl/seguimiento/?n=",
};

function getTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const base = CARRIER_TRACKING_URLS[carrier];
  return base ? `${base}${encodeURIComponent(trackingNumber)}` : null;
}

function getEstimatedDelivery(shippedAt: Date): string {
  const estimated = new Date(shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000);
  return estimated.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

export async function sendOrderShippedEmail(
  to: string,
  { name, orderNumber, trackingNumber, trackingCarrier, shippedAt, items }: {
    name: string;
    orderNumber: string;
    trackingNumber: string;
    trackingCarrier: string;
    shippedAt: Date;
    items: { name: string; imageUrl?: string | null; quantity: number }[];
  },
) {
  const base = appUrl();
  const trackingUrl = getTrackingUrl(trackingCarrier, trackingNumber);
  const estimatedDelivery = getEstimatedDelivery(shippedAt);

  const trackingLink = trackingUrl
    ? `<a href="${trackingUrl}" style="color:#8B7355;text-decoration:underline;" target="_blank">Seguir envío →</a>`
    : "";

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e8e5df;width:56px;vertical-align:middle;">
            ${i.imageUrl ? `<img src="${i.imageUrl}" alt="${i.name}" width="48" height="48" style="border-radius:4px;object-fit:cover;">` : `<div style="width:48px;height:48px;background-color:#f5f3ef;border-radius:4px;"></div>`}
          </td>
          <td style="padding:8px 0 8px 12px;border-bottom:1px solid #e8e5df;vertical-align:middle;">
            ${i.name}${i.quantity > 1 ? ` <span style="color:#9e9a90;">x${i.quantity}</span>` : ""}
          </td>
        </tr>`,
    )
    .join("");

  await sendEmail(
    to,
    `Tu pedido #${orderNumber} fue despachado`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Tu pedido <strong>#${orderNumber}</strong> ya fue despachado. 🎉</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;">
       <strong>Courier:</strong> ${trackingCarrier}<br>
       <strong>Número de seguimiento:</strong> ${trackingNumber}<br>
       <strong>Entrega estimada:</strong> ${estimatedDelivery}
       ${trackingLink ? `<br><br>${trackingLink}` : ""}
     </p>
     ${items.length > 0 ? `
     <p style="margin:0 0 8px;font-weight:bold;font-size:13px;color:#9e9a90;text-transform:uppercase;letter-spacing:0.5px;">Productos en tu envío</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">${itemRows}</table>` : ""}
     <p style="margin:0 0 16px;font-size:13px;color:#9e9a90;">Te notificaremos cuando sea entregado.</p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/comprador/pedidos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis pedidos</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 7. Order Delivered
// ---------------------------------------------------------------------------
export async function sendOrderDeliveredEmail(
  to: string,
  { name, orderNumber, items }: {
    name: string;
    orderNumber: string;
    items: { name: string; slug: string; imageUrl?: string | null; quantity: number }[];
  },
) {
  const base = appUrl();

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e8e5df;width:56px;vertical-align:middle;">
            ${i.imageUrl ? `<img src="${i.imageUrl}" alt="${i.name}" width="48" height="48" style="border-radius:4px;object-fit:cover;">` : `<div style="width:48px;height:48px;background-color:#f5f3ef;border-radius:4px;"></div>`}
          </td>
          <td style="padding:8px 0 8px 12px;border-bottom:1px solid #e8e5df;vertical-align:middle;">
            ${i.name}${i.quantity > 1 ? ` <span style="color:#9e9a90;">x${i.quantity}</span>` : ""}
          </td>
        </tr>`,
    )
    .join("");

  const reviewUrl = items.length === 1
    ? `${base}/coleccion/${items[0].slug}#opiniones`
    : `${base}/portal/comprador/pedidos`;

  await sendEmail(
    to,
    `Tu pedido #${orderNumber} fue entregado`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Tu pedido <strong>#${orderNumber}</strong> fue entregado exitosamente. ✨</p>
     ${items.length > 0 ? `
     <p style="margin:0 0 8px;font-weight:bold;font-size:13px;color:#9e9a90;text-transform:uppercase;letter-spacing:0.5px;">Productos recibidos</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">${itemRows}</table>` : ""}
     <p style="margin:0 0 16px;">En unos días te invitaremos a dejar una reseña. Tu opinión ayuda a otros compradores y a los artesanos.</p>
     <p style="margin:0 0 12px;">
       <a href="${reviewUrl}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Dejar mi reseña</a>
     </p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/comprador/pedidos" style="color:#8B7355;font-size:13px;text-decoration:underline;">¿Algún problema? Solicita devolución</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 8. New Question (to artisan)
// ---------------------------------------------------------------------------
export async function sendNewQuestionEmail(
  to: string,
  { artisanName, productName, question }: {
    artisanName: string;
    productName: string;
    question: string;
  },
) {
  const base = appUrl();
  await sendEmail(
    to,
    `Nueva pregunta sobre ${productName}`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Alguien hizo una pregunta sobre tu pieza <strong>${productName}</strong>:</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;font-style:italic;">"${question}"</p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/orfebre/preguntas" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Responder</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 9. Question Answered (to buyer)
// ---------------------------------------------------------------------------
export async function sendQuestionAnsweredEmail(
  to: string,
  { buyerName, productName, answer }: {
    buyerName: string;
    productName: string;
    answer: string;
  },
) {
  const base = appUrl();
  await sendEmail(
    to,
    `Tu pregunta sobre ${productName} fue respondida`,
    `<p style="margin:0 0 16px;">Hola ${buyerName},</p>
     <p style="margin:0 0 16px;">El artesano respondió tu pregunta sobre <strong>${productName}</strong>:</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;">"${answer}"</p>
     <p style="margin:0 0 0;">
       <a href="${base}/coleccion" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver catálogo</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 10. Product Approved
// ---------------------------------------------------------------------------
export async function sendProductApprovedEmail(
  to: string,
  { artisanName, productName }: { artisanName: string; productName: string },
) {
  const base = appUrl();
  await sendEmail(
    to,
    `Tu pieza '${productName}' fue aprobada`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tu pieza <strong>${productName}</strong> fue aprobada y ya está publicada en el catálogo.</p>
     <p style="margin:0 0 16px;">Los compradores pueden verla y adquirirla desde ahora.</p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/orfebre/productos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis productos</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 11. Product Rejected
// ---------------------------------------------------------------------------
export async function sendProductRejectedEmail(
  to: string,
  { artisanName, productName, reason }: {
    artisanName: string;
    productName: string;
    reason: string;
  },
) {
  const base = appUrl();
  await sendEmail(
    to,
    `Sobre tu pieza '${productName}'`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Revisamos tu pieza <strong>${productName}</strong> y no pudo ser aprobada en esta oportunidad.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;"><strong>Motivo:</strong> ${reason}</p>
     <p style="margin:0 0 16px;">Puedes editar la publicación y enviarla nuevamente para revisión.</p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/orfebre/productos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Editar producto</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 12. Shipment Alert (to artisan)
// ---------------------------------------------------------------------------
export async function sendShipmentAlertEmail(
  to: string,
  { artisanName, orderNumber, orderId, daysSince }: {
    artisanName: string;
    orderNumber: string;
    orderId: string;
    daysSince: number;
  },
) {
  const base = appUrl();
  await sendEmail(
    to,
    `Alerta: pedido #${orderNumber} pendiente de despacho`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tu pedido <strong>#${orderNumber}</strong> lleva <strong>${daysSince} días</strong> sin ser despachado.</p>
     <p style="margin:0 0 16px;">Por favor, procesa el envío lo antes posible para mantener una buena experiencia para el comprador.</p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/orfebre/pedidos/${orderId}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver pedido</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 13. Dispute Opened (to artisan)
// ---------------------------------------------------------------------------
export async function sendDisputeOpenedEmail(
  to: string,
  { artisanName, orderNumber, reason }: {
    artisanName: string;
    orderNumber: string;
    reason: string;
  },
) {
  await sendEmail(
    to,
    `Disputa abierta - pedido #${orderNumber}`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Se ha abierto una disputa en el pedido <strong>#${orderNumber}</strong>.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;"><strong>Motivo:</strong> ${reason}</p>
     <p style="margin:0 0 16px;">Nuestro equipo está revisando el caso. Te mantendremos informado sobre la resolución.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 14. Dispute Resolved
// ---------------------------------------------------------------------------
export async function sendDisputeResolvedEmail(
  to: string,
  { name, orderNumber, resolution }: {
    name: string;
    orderNumber: string;
    resolution: string;
  },
) {
  await sendEmail(
    to,
    `Disputa resuelta - pedido #${orderNumber}`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">La disputa del pedido <strong>#${orderNumber}</strong> ha sido resuelta.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;"><strong>Resolución:</strong> ${resolution}</p>
     <p style="margin:0 0 16px;">Si tienes alguna duda, no dudes en contactarnos.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 15. Payout Released
// ---------------------------------------------------------------------------
export async function sendPayoutReleasedEmail(
  to: string,
  { artisanName, amount }: { artisanName: string; amount: number },
) {
  const base = appUrl();
  await sendEmail(
    to,
    `Pago liberado: ${formatCLP(amount)}`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Se ha liberado un pago por <strong>${formatCLP(amount)}</strong> a tu cuenta de Mercado Pago.</p>
     <p style="margin:0 0 16px;">El monto debería reflejarse en tu cuenta en las próximas horas.</p>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/orfebre/finanzas" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver finanzas</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 16. Return Requested (to artisan)
// ---------------------------------------------------------------------------
export async function sendReturnRequestedEmail(
  to: string,
  { name, productName, reason }: {
    name: string;
    productName: string;
    reason: string;
  },
) {
  await sendEmail(
    to,
    `Solicitud de devolución: ${productName}`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Se ha solicitado una devolución para el producto <strong>${productName}</strong>.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;"><strong>Motivo:</strong> ${reason}</p>
     <p style="margin:0 0 16px;">La solicitud está pendiente de revisión. Te notificaremos cuando haya una resolución.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 17. Return Approved (to buyer)
// ---------------------------------------------------------------------------
export async function sendReturnApprovedEmail(
  to: string,
  { buyerName, productName }: { buyerName: string; productName: string },
) {
  const base = appUrl();
  await sendEmail(
    to,
    `Devolución aprobada: ${productName}`,
    `<p style="margin:0 0 16px;">Hola ${buyerName},</p>
     <p style="margin:0 0 16px;">Tu solicitud de devolución para <strong>${productName}</strong> fue aprobada.</p>
     <p style="margin:0 0 16px;font-weight:bold;">Instrucciones de envío:</p>
     <ol style="margin:0 0 16px;padding-left:20px;">
       <li style="margin-bottom:8px;">Empaca el producto en su estado original.</li>
       <li style="margin-bottom:8px;">Envíalo a la dirección que se indica en tu panel de pedidos.</li>
       <li style="margin-bottom:8px;">Ingresa el número de seguimiento en la plataforma.</li>
     </ol>
     <p style="margin:0 0 0;">
       <a href="${base}/portal/comprador/pedidos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis pedidos</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 18. Return Rejected (to buyer)
// ---------------------------------------------------------------------------
export async function sendReturnRejectedEmail(
  to: string,
  { buyerName, productName, reason }: {
    buyerName: string;
    productName: string;
    reason: string;
  },
) {
  await sendEmail(
    to,
    `Devolución rechazada: ${productName}`,
    `<p style="margin:0 0 16px;">Hola ${buyerName},</p>
     <p style="margin:0 0 16px;">Tu solicitud de devolución para <strong>${productName}</strong> no pudo ser aprobada.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;"><strong>Motivo:</strong> ${reason}</p>
     <p style="margin:0 0 16px;">Si tienes alguna duda, no dudes en contactarnos.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 19. Return Received (to buyer)
// ---------------------------------------------------------------------------
export async function sendReturnReceivedEmail(
  to: string,
  { buyerName, productName }: { buyerName: string; productName: string },
) {
  await sendEmail(
    to,
    `Devolución recibida: ${productName}`,
    `<p style="margin:0 0 16px;">Hola ${buyerName},</p>
     <p style="margin:0 0 16px;">Hemos recibido la devolución de <strong>${productName}</strong>.</p>
     <p style="margin:0 0 16px;">Tu reembolso está en proceso y te notificaremos cuando se haya completado.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 20. Refund Processed (to buyer)
// ---------------------------------------------------------------------------
export async function sendRefundProcessedEmail(
  to: string,
  { buyerName, amount }: { buyerName: string; amount: number },
) {
  await sendEmail(
    to,
    `Reembolso procesado: ${formatCLP(amount)}`,
    `<p style="margin:0 0 16px;">Hola ${buyerName},</p>
     <p style="margin:0 0 16px;">Tu reembolso por <strong>${formatCLP(amount)}</strong> ha sido procesado exitosamente.</p>
     <p style="margin:0 0 16px;">El monto será devuelto al mismo medio de pago utilizado en la compra original. Puede demorar entre 5 y 10 días hábiles en reflejarse.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 21. Certificate Email (to buyer) — premium standalone layout with CID image
// ---------------------------------------------------------------------------
export async function sendCertificateEmail(
  to: string,
  {
    buyerName,
    productName,
    certCode,
    materials,
    technique,
    artisanName,
    issuedDate,
  }: {
    buyerName: string;
    productName: string;
    certCode: string;
    materials: string;
    technique?: string | null;
    artisanName: string;
    issuedDate: string;
  },
) {
  const baseUrl = appUrl();
  const verifyUrl = `${baseUrl}/verificar/${certCode}`;
  const pdfUrl = `${baseUrl}/api/certificates/${certCode}/pdf`;
  const qrUrl = `${baseUrl}/api/certificates/${certCode}/qr`;

  const techniqueRow = technique
    ? `<tr>
         <td style="padding:10px 0;border-bottom:1px solid #f0ece6;">
           <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Técnica</span><br>
           <span style="font-size:14px;color:#2c2a26;margin-top:2px;display:inline-block;">${technique}</span>
         </td>
       </tr>`
    : "";

  // Full standalone email — does NOT use emailLayout()
  // QR is referenced via cid:qr-cert inline attachment
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Certificado de Autenticidad</title>
</head>
<body style="margin:0;padding:0;background-color:#1a1a18;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a18;">
    <tr><td align="center" style="padding:48px 20px;">

      <!-- Greeting -->
      <table width="520" cellpadding="0" cellspacing="0">
        <tr><td style="padding:0 0 32px;text-align:center;">
          <p style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#b5ad9e;margin:0 0 8px;">Hola ${buyerName},</p>
          <p style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;color:#8a8478;margin:0;line-height:1.5;">
            Tu pieza viene acompañada de su Certificado de Autenticidad.<br>
            Cada creación de Casa Orfebre es única e irrepetible.
          </p>
        </td></tr>
      </table>

      <!-- Certificate Card -->
      <table width="520" cellpadding="0" cellspacing="0" style="background-color:#FDFCFA;border-radius:12px;overflow:hidden;">

        <!-- Top gold accent bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#c9a96e,#8B7355,#c9a96e);font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Header -->
        <tr><td style="padding:40px 48px 0;text-align:center;">
          <p style="font-size:9px;letter-spacing:6px;color:#c9a96e;margin:0 0 16px;">&#9670;&nbsp;&nbsp;&#9670;&nbsp;&nbsp;&#9670;</p>
          <p style="font-family:Georgia,serif;font-size:11px;text-transform:uppercase;letter-spacing:4px;color:#b5ad9e;margin:0 0 8px;">Casa Orfebre</p>
          <p style="font-family:Georgia,serif;font-size:24px;color:#2c2a26;margin:0 0 4px;font-weight:normal;letter-spacing:0.5px;">Certificado de Autenticidad</p>
          <p style="font-size:11px;color:#b5ad9e;letter-spacing:1px;margin:0;">Joyería de Autor &middot; Hecho a Mano en Chile</p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:24px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:38%;height:1px;background:#e8e5df;font-size:0;">&nbsp;</td>
            <td style="width:24%;text-align:center;"><span style="font-size:10px;letter-spacing:3px;color:#c9a96e;">N&ordm;</span></td>
            <td style="width:38%;height:1px;background:#e8e5df;font-size:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- Certificate Code -->
        <tr><td style="text-align:center;padding:0 48px 28px;">
          <p style="font-family:'Courier New',monospace;font-size:22px;letter-spacing:4px;color:#8B7355;margin:0;font-weight:bold;">${certCode}</p>
        </td></tr>

        <!-- Details -->
        <tr><td style="padding:0 48px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ece6;">
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid #f0ece6;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Pieza</span><br>
                <span style="font-size:16px;color:#2c2a26;font-weight:bold;margin-top:2px;display:inline-block;">${productName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0ece6;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Materiales</span><br>
                <span style="font-size:14px;color:#2c2a26;margin-top:2px;display:inline-block;">${materials}</span>
              </td>
            </tr>
            ${techniqueRow}
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0ece6;">
                <span style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b5ad9e;">Orfebre</span><br>
                <span style="font-size:14px;color:#2c2a26;margin-top:2px;display:inline-block;">${artisanName}</span>
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

        <!-- QR Section — CID inline image -->
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

        <!-- CTA Button -->
        <tr><td style="padding:0 48px 32px;text-align:center;">
          <a href="${pdfUrl}" style="display:inline-block;padding:14px 36px;background-color:#2c2a26;color:#FDFCFA;text-decoration:none;border-radius:6px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;letter-spacing:0.5px;">
            Descargar Certificado PDF
          </a>
        </td></tr>

        <!-- Bottom gold accent bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#c9a96e,#8B7355,#c9a96e);font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

      <!-- Footer -->
      <table width="520" cellpadding="0" cellspacing="0">
        <tr><td style="padding:28px 0;text-align:center;">
          <p style="font-size:11px;color:#5a574f;margin:0 0 8px;">
            Verifica este certificado en
            <a href="${verifyUrl}" style="color:#c9a96e;text-decoration:none;">${verifyUrl}</a>
          </p>
          <p style="font-size:11px;color:#4a4740;margin:0 0 4px;">
            <a href="${baseUrl}" style="color:#8a8478;text-decoration:none;letter-spacing:1px;">casaorfebre.cl</a>
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

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Certificado de Autenticidad — ${productName}`,
    html,
  });
  if (error) {
    console.error(`Email failed [Certificate ${certCode}]:`, error);
    return;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Referral Reward Notification
// ---------------------------------------------------------------------------
export async function sendReferralRewardEmail(
  to: string,
  {
    referrerName,
    referredName,
    rewardAmount,
    discountCode,
    expiresAt,
  }: {
    referrerName: string;
    referredName: string;
    rewardAmount: number;
    discountCode: string;
    expiresAt: Date;
  },
) {
  const formattedAmount = formatCLP(rewardAmount);
  const formattedExpiry = expiresAt.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await sendEmail(
    to,
    `\u00a1Ganaste ${formattedAmount} de descuento! \u2014 Casa Orfebre`,
    `<p style="margin:0 0 16px;">Hola ${referrerName},</p>
     <p style="margin:0 0 16px;">\u00a1Tu amigo/a <strong>${referredName}</strong> hizo su primera compra en Casa Orfebre gracias a tu invitaci\u00f3n!</p>
     <p style="margin:0 0 16px;">Como agradecimiento, tienes <strong>${formattedAmount} de descuento</strong> en tu pr\u00f3xima compra.</p>
     <div style="margin:0 0 20px;padding:16px;background-color:#f5f0eb;border-radius:8px;text-align:center;">
       <p style="margin:0 0 4px;font-size:12px;color:#8a8478;text-transform:uppercase;letter-spacing:1px;">Tu c\u00f3digo de descuento</p>
       <p style="margin:0;font-size:24px;font-weight:600;color:#8B7355;letter-spacing:2px;">${discountCode}</p>
     </div>
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/coleccion" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ir a comprar</a>
     </p>
     <p style="margin:0;font-size:13px;color:#9e9a90;">V\u00e1lido hasta el ${formattedExpiry}. Aplica el c\u00f3digo en el checkout.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 22. Subscription Renewal Request
// ---------------------------------------------------------------------------
export async function sendSubscriptionRenewalEmail(
  to: string,
  {
    artisanName,
    planName,
    amount,
    paymentUrl,
  }: {
    artisanName: string;
    planName: string;
    amount: number;
    paymentUrl: string;
  },
) {
  await sendEmail(
    to,
    `Tu suscripci\u00f3n al plan ${planName} se renueva hoy \u2014 Casa Orfebre`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tu suscripci\u00f3n al plan <strong>${planName}</strong> se renueva hoy. El monto a pagar es <strong>${formatCLP(amount)}</strong>.</p>
     <p style="margin:0 0 16px;">Haz clic en el siguiente enlace para completar tu pago:</p>
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Pagar suscripci\u00f3n</a>
     </p>
     <p style="margin:0;font-size:13px;color:#9e9a90;">Si no realizas el pago dentro de 10 d\u00edas, tu plan ser\u00e1 degradado a Esencial autom\u00e1ticamente.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 23. Subscription Renewal Reminder (3 or 7 days overdue)
// ---------------------------------------------------------------------------
export async function sendSubscriptionReminderEmail(
  to: string,
  {
    artisanName,
    planName,
    amount,
    paymentUrl,
    daysOverdue,
  }: {
    artisanName: string;
    planName: string;
    amount: number;
    paymentUrl: string;
    daysOverdue: number;
  },
) {
  const isLastWarning = daysOverdue >= 7;
  const subject = isLastWarning
    ? `\u00daltimo aviso: tu plan ${planName} ser\u00e1 degradado \u2014 Casa Orfebre`
    : `Recordatorio: renueva tu plan ${planName} \u2014 Casa Orfebre`;

  await sendEmail(
    to,
    subject,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">${
       isLastWarning
         ? `Este es tu <strong>\u00faltimo aviso</strong>. Tu suscripci\u00f3n al plan <strong>${planName}</strong> venci\u00f3 hace ${daysOverdue} d\u00edas. Si no pagas en los pr\u00f3ximos d\u00edas, tu plan ser\u00e1 degradado a Esencial.`
         : `Tu suscripci\u00f3n al plan <strong>${planName}</strong> venci\u00f3 hace ${daysOverdue} d\u00edas. Te recordamos renovar para mantener todos tus beneficios.`
     }</p>
     <p style="margin:0 0 16px;">Monto: <strong>${formatCLP(amount)}</strong></p>
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Renovar ahora</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 24. Subscription Expired (downgraded to Esencial)
// ---------------------------------------------------------------------------
export async function sendSubscriptionExpiredEmail(
  to: string,
  {
    artisanName,
    planName,
    pausedProducts,
  }: {
    artisanName: string;
    planName: string;
    pausedProducts: number;
  },
) {
  const pausedMsg =
    pausedProducts > 0
      ? `<p style="margin:0 0 16px;">Adem\u00e1s, ${pausedProducts} producto${pausedProducts > 1 ? "s fueron pausados" : " fue pausado"} porque exced\u00edan el l\u00edmite del plan Esencial (10 productos).</p>`
      : "";

  await sendEmail(
    to,
    `Tu suscripci\u00f3n al plan ${planName} ha expirado \u2014 Casa Orfebre`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tu suscripci\u00f3n al plan <strong>${planName}</strong> ha expirado por falta de pago. Tu cuenta ha sido degradada al plan <strong>Esencial</strong> con una comisi\u00f3n del 18%.</p>
     ${pausedMsg}
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/portal/orfebre/plan" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Renovar mi plan</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 25. Subscription Activated/Renewed Successfully
// ---------------------------------------------------------------------------
export async function sendSubscriptionActivatedEmail(
  to: string,
  {
    artisanName,
    planName,
    endDate,
  }: {
    artisanName: string;
    planName: string;
    endDate: Date;
  },
) {
  const formattedDate = endDate.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await sendEmail(
    to,
    `Tu plan ${planName} est\u00e1 activo \u2014 Casa Orfebre`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tu suscripci\u00f3n al plan <strong>${planName}</strong> ha sido activada exitosamente.</p>
     <p style="margin:0 0 16px;">Tu plan estar\u00e1 activo hasta el <strong>${formattedDate}</strong>.</p>
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/portal/orfebre" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ir a mi taller</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// Chat: New message notification
// ---------------------------------------------------------------------------
export async function sendNewMessageEmail(
  to: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  conversationUrl: string,
) {
  const url = `${appUrl()}${conversationUrl}`;
  const preview = messagePreview.length > 100 ? messagePreview.slice(0, 100) + "..." : messagePreview;

  await sendEmail(
    to,
    `${senderName} te envió un mensaje — Casa Orfebre`,
    `<p style="margin:0 0 16px;">Hola ${recipientName},</p>
     <p style="margin:0 0 16px;"><strong>${senderName}</strong> te envió un mensaje:</p>
     <div style="margin:0 0 16px;padding:12px 16px;background-color:#f5f5f0;border-radius:8px;border-left:3px solid #8B7355;">
       <p style="margin:0;color:#555;font-style:italic;">"${preview}"</p>
     </div>
     <p style="margin:0 0 16px;text-align:center;">
       <a href="${url}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Responder</a>
     </p>
     <p style="margin:0;font-size:13px;color:#9e9a90;">Recibirás un máximo de 1 notificación cada 5 minutos por conversación.</p>`,
  );
}

// ---------------------------------------------------------------------------
// Review Reminder (to buyer, 7 days after delivery)
// ---------------------------------------------------------------------------
export async function sendReviewReminderEmail(
  to: string,
  { buyerName, productName, productSlug, productImageUrl }: {
    buyerName: string;
    productName: string;
    productSlug: string;
    productImageUrl?: string | null;
  },
) {
  const base = appUrl();
  const reviewUrl = `${base}/coleccion/${productSlug}#opiniones`;

  const imageBlock = productImageUrl
    ? `<p style="margin:0 0 16px;text-align:center;">
        <img src="${productImageUrl}" alt="${productName}" width="200" height="200" style="border-radius:8px;object-fit:cover;">
      </p>`
    : "";

  await sendEmail(
    to,
    `¿Qué te pareció tu ${productName}?`,
    `<p style="margin:0 0 16px;">Hola ${buyerName},</p>
     ${imageBlock}
     <p style="margin:0 0 16px;">Hace unos días recibiste tu <strong>${productName}</strong>. Nos encantaría saber qué te pareció.</p>
     <p style="margin:0 0 16px;">Tu opinión ayuda a otros compradores a elegir y a los artesanos a seguir mejorando. Las reseñas con foto son especialmente valiosas.</p>
     <p style="margin:0 0 0;text-align:center;">
       <a href="${reviewUrl}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Dejar mi reseña</a>
     </p>`,
  );
}
