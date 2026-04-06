"use client";

import { useState } from "react";
import { trackWhatsAppSent } from "@/lib/actions/invitations";

export type WhatsAppInvitationData = {
  invitationId: string;
  name: string;
  phone: string; // formato +569XXXXXXXX
  type: "PIONEER" | "ARTISAN" | "BUYER";
};

function buildMessage(name: string, type: WhatsAppInvitationData["type"]): string {
  const firstName = name.split(" ")[0] || name;

  if (type === "ARTISAN") {
    return `Hola ${firstName}, soy Camila de Casa Orfebre. Te acabamos de enviar por mail la invitación para que vendas tus piezas en nuestra plataforma.

Mira acá todos los beneficios y cómo funciona: https://casaorfebre.cl/para-orfebre

Dato clave: nosotros no tocamos ni almacenamos tus productos. Tú despachas directo al comprador. Nosotros nos encargamos de la visibilidad, el cobro seguro y el posicionamiento.

¿Alguna duda? Escríbenos por acá.`;
  }

  if (type === "BUYER") {
    return `Hola ${firstName}, te escribimos de Casa Orfebre. Te acabamos de enviar un mail con tu invitación para descubrir joyería de autor hecha a mano por orfebres chilenos verificados.

Mira todo lo que tenemos para ti acá: https://casaorfebre.cl/para-comprador

Pago seguro, garantía de 14 días, certificado de autenticidad y tracking real. Todo lo que no tienes comprando por Instagram.

¿Dudas? Escríbenos por acá.`;
  }

  // PIONEER (default)
  return `Hola ${firstName}, soy Camila de Casa Orfebre. Te acabamos de enviar por mail tu invitación como Pionera de Casa Orfebre con tu código exclusivo.

Acá te dejo el link donde te explicamos todos los beneficios y en qué consiste: https://casaorfebre.cl/para-pionero

Lo más importante: nosotros no tocamos tus productos. Tú despachas directo al comprador. Nosotros somos el canal que te posiciona, te da visibilidad y te gestiona el cobro seguro.

¿Tienes alguna duda? Escríbenos por acá mismo.`;
}

function formatPhoneDisplay(phone: string): string {
  // +569XXXXXXXX → +56 9 XXXX XXXX
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("569")) {
    const rest = digits.slice(3);
    return `+56 9 ${rest.slice(0, 4)} ${rest.slice(4)}`;
  }
  return phone;
}

export function WhatsAppInvitationModal({
  data,
  onClose,
}: {
  data: WhatsAppInvitationData;
  onClose: () => void;
}) {
  const [isSending, setIsSending] = useState(false);
  const message = buildMessage(data.name, data.type);
  const waNumber = data.phone.replace(/\D/g, ""); // 569XXXXXXXX

  async function handleSend() {
    setIsSending(true);
    try {
      await trackWhatsAppSent(data.invitationId);
    } catch {
      // no bloquear el envío si tracking falla
    }
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-light">Enviar por WhatsApp</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-tertiary hover:text-text"
          >
            &#10005;
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              Para
            </p>
            <p className="text-sm font-medium text-text">{data.name}</p>
            <p className="text-sm text-text-tertiary">
              {formatPhoneDisplay(data.phone)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-text-tertiary">
              Mensaje
            </p>
            <textarea
              readOnly
              value={message}
              rows={10}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-text-secondary"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:bg-background"
          >
            Omitir
          </button>
          <button
            type="button"
            disabled={isSending}
            onClick={handleSend}
            className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1da851] disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            {isSending ? "Abriendo..." : "Abrir WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
