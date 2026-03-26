import { resend, FROM_EMAIL } from "@/lib/resend";
import { emailLayout } from "./base-layout";
import { formatCLP } from "@/lib/utils";

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html: emailLayout(html) });
  } catch (error) {
    console.error(`Email failed [${subject}]:`, error);
  }
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
