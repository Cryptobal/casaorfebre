import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "./base-layout";
import { formatCLP } from "@/lib/utils";

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
// 1. Buyer Welcome
// ---------------------------------------------------------------------------
export async function sendBuyerWelcomeEmail(
  to: string,
  { name }: { name: string },
) {
  await sendEmail(
    to,
    "Bienvenido a Casa Orfebre",
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Te damos la bienvenida a <strong>Casa Orfebre</strong>, tu espacio para descubrir joyería de autor hecha a mano por artesanos chilenos.</p>
     <p style="margin:0 0 16px;">Explora nuestro catálogo y encuentra piezas únicas creadas con dedicación y oficio.</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/explorar" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Explorar piezas</a>
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
  await sendEmail(
    to,
    "¡Tu postulación fue aprobada!",
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">¡Felicidades! Tu postulación a <strong>Casa Orfebre</strong> ha sido aprobada. Ya formas parte de nuestra comunidad de artesanos.</p>
     <p style="margin:0 0 16px;">Estos son tus próximos pasos:</p>
     <ol style="margin:0 0 16px;padding-left:20px;">
       <li style="margin-bottom:8px;">Vincula tu cuenta de Mercado Pago para recibir pagos.</li>
       <li style="margin-bottom:8px;">Sube tus primeras piezas al catálogo.</li>
     </ol>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/artesano/panel" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ir a mi panel</a>
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
  { name, orderNumber, items, total }: {
    name: string;
    orderNumber: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
  },
) {
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

  await sendEmail(
    to,
    `Confirmación de compra #${orderNumber}`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Tu compra fue confirmada. Aquí está el resumen de tu pedido <strong>#${orderNumber}</strong>:</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
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
     </table>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/mis-pedidos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis pedidos</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 5. New Order (artisan) — NO buyer contact info
// ---------------------------------------------------------------------------
export async function sendNewOrderToArtisanEmail(
  to: string,
  { artisanName, orderNumber, items, shippingName, shippingAddress, shippingCity, shippingRegion }: {
    artisanName: string;
    orderNumber: string;
    items: { name: string; quantity: number; price: number }[];
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingRegion: string;
  },
) {
  const itemList = items
    .map((i) => `<li style="margin-bottom:4px;">${i.name} x${i.quantity} — ${formatCLP(i.price)}</li>`)
    .join("");

  await sendEmail(
    to,
    `Nuevo pedido #${orderNumber}`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tienes un nuevo pedido <strong>#${orderNumber}</strong>.</p>
     <p style="margin:0 0 8px;font-weight:bold;">Productos:</p>
     <ul style="margin:0 0 16px;padding-left:20px;">${itemList}</ul>
     <p style="margin:0 0 8px;font-weight:bold;">Dirección de envío:</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;">
       ${shippingName}<br>
       ${shippingAddress}<br>
       ${shippingCity}, ${shippingRegion}
     </p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/artesano/pedidos/${orderNumber}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver pedido</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 6. Order Shipped
// ---------------------------------------------------------------------------
export async function sendOrderShippedEmail(
  to: string,
  { name, orderNumber, trackingNumber, trackingCarrier }: {
    name: string;
    orderNumber: string;
    trackingNumber: string;
    trackingCarrier: string;
  },
) {
  await sendEmail(
    to,
    `Tu pedido #${orderNumber} fue despachado`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Tu pedido <strong>#${orderNumber}</strong> ya fue despachado.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;">
       <strong>Courier:</strong> ${trackingCarrier}<br>
       <strong>Número de seguimiento:</strong> ${trackingNumber}
     </p>
     <p style="margin:0 0 16px;">Te notificaremos cuando sea entregado.</p>`,
  );
}

// ---------------------------------------------------------------------------
// 7. Order Delivered
// ---------------------------------------------------------------------------
export async function sendOrderDeliveredEmail(
  to: string,
  { name, orderNumber }: { name: string; orderNumber: string },
) {
  await sendEmail(
    to,
    `Tu pedido #${orderNumber} fue entregado`,
    `<p style="margin:0 0 16px;">Hola ${name},</p>
     <p style="margin:0 0 16px;">Tu pedido <strong>#${orderNumber}</strong> fue entregado exitosamente.</p>
     <p style="margin:0 0 16px;">En unos días te invitaremos a dejar una reseña sobre las piezas que recibiste. Tu opinión ayuda a otros compradores y a los artesanos.</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/mis-pedidos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis pedidos</a>
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
  await sendEmail(
    to,
    `Nueva pregunta sobre ${productName}`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Alguien hizo una pregunta sobre tu pieza <strong>${productName}</strong>:</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;font-style:italic;">"${question}"</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/artesano/preguntas" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Responder</a>
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
  await sendEmail(
    to,
    `Tu pregunta sobre ${productName} fue respondida`,
    `<p style="margin:0 0 16px;">Hola ${buyerName},</p>
     <p style="margin:0 0 16px;">El artesano respondió tu pregunta sobre <strong>${productName}</strong>:</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;">"${answer}"</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/explorar" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver producto</a>
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
  await sendEmail(
    to,
    `Tu pieza '${productName}' fue aprobada`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tu pieza <strong>${productName}</strong> fue aprobada y ya está publicada en el catálogo.</p>
     <p style="margin:0 0 16px;">Los compradores pueden verla y adquirirla desde ahora.</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/artesano/productos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis productos</a>
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
  await sendEmail(
    to,
    `Sobre tu pieza '${productName}'`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Revisamos tu pieza <strong>${productName}</strong> y no pudo ser aprobada en esta oportunidad.</p>
     <p style="margin:0 0 16px;padding:12px 16px;background-color:#f5f3ef;border-radius:4px;"><strong>Motivo:</strong> ${reason}</p>
     <p style="margin:0 0 16px;">Puedes editar la publicación y enviarla nuevamente para revisión.</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/artesano/productos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Editar producto</a>
     </p>`,
  );
}

// ---------------------------------------------------------------------------
// 12. Shipment Alert (to artisan)
// ---------------------------------------------------------------------------
export async function sendShipmentAlertEmail(
  to: string,
  { artisanName, orderNumber, daysSince }: {
    artisanName: string;
    orderNumber: string;
    daysSince: number;
  },
) {
  await sendEmail(
    to,
    `Alerta: pedido #${orderNumber} pendiente de despacho`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Tu pedido <strong>#${orderNumber}</strong> lleva <strong>${daysSince} días</strong> sin ser despachado.</p>
     <p style="margin:0 0 16px;">Por favor, procesa el envío lo antes posible para mantener una buena experiencia para el comprador.</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/artesano/pedidos/${orderNumber}" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver pedido</a>
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
  await sendEmail(
    to,
    `Pago liberado: ${formatCLP(amount)}`,
    `<p style="margin:0 0 16px;">Hola ${artisanName},</p>
     <p style="margin:0 0 16px;">Se ha liberado un pago por <strong>${formatCLP(amount)}</strong> a tu cuenta de Mercado Pago.</p>
     <p style="margin:0 0 16px;">El monto debería reflejarse en tu cuenta en las próximas horas.</p>
     <p style="margin:0 0 0;">
       <a href="https://casaorfebre.cl/artesano/pagos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis pagos</a>
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
       <a href="https://casaorfebre.cl/mis-pedidos" style="display:inline-block;padding:12px 24px;background-color:#8B7355;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;">Ver mis pedidos</a>
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
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
