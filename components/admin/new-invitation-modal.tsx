"use client";

import { useState, useTransition } from "react";
import { createInvitation } from "@/lib/actions/invitations";

type Campaign = { name: string; count: number };

export type WhatsAppModalData = {
  invitationId: string;
  name: string;
  phone: string; // E.164 +569XXXXXXXX
  type: "PIONEER" | "ARTISAN" | "BUYER";
};

function normalizeForCode(name: string): string {
  return name
    .split(" ")[0]
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

export function NewInvitationModal({
  campaigns,
  onClose,
  onWhatsAppReady,
}: {
  campaigns: Campaign[];
  onClose: () => void;
  onWhatsAppReady?: (data: WhatsAppModalData) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [planName, setPlanName] = useState("maestro");
  const [durationDays, setDurationDays] = useState(90);
  const [campaign, setCampaign] = useState(
    campaigns[0]?.name || "PIONEROS_2026",
  );
  const [newCampaign, setNewCampaign] = useState("");
  const [useNewCampaign, setUseNewCampaign] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState("");

  const defaultExpiry = new Date();
  defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
  const [expiresAt, setExpiresAt] = useState(
    defaultExpiry.toISOString().split("T")[0],
  );

  const previewCode = name
    ? `PIONERO-${normalizeForCode(name)}-${new Date().getFullYear()}`
    : "PIONERO-...";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Nombre y email son requeridos");
      return;
    }

    if (!email.includes("@")) {
      setError("Email no válido");
      return;
    }

    const finalCampaign = useNewCampaign ? newCampaign.trim() : campaign;
    if (!finalCampaign) {
      setError("Selecciona o crea una campaña");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length !== 8) {
      setError("El teléfono debe tener 8 dígitos");
      return;
    }

    startTransition(async () => {
      try {
        const created = await createInvitation({
          recipientName: name.trim(),
          recipientEmail: email.trim().toLowerCase(),
          planName,
          durationDays,
          campaign: finalCampaign,
          expiresAt: new Date(expiresAt),
          sendEmail,
          phone: phoneDigits || null,
        });
        if (created.phone && onWhatsAppReady) {
          onWhatsAppReady({
            invitationId: created.id,
            name: created.recipientName ?? name.trim(),
            phone: created.phone,
            type: "PIONEER", // este modal crea siempre invitaciones de pionero
          });
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-light">Nueva Invitación</h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text"
          >
            &#10005;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Nombre del orfebre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="María Fernanda López"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="orfebre@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              WhatsApp <span className="text-text-tertiary">(opcional)</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="rounded-l-md border border-r-0 border-border bg-background px-3 py-2 text-sm text-text-tertiary">
                +56 9
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                maxLength={8}
                pattern="[0-9]{8}"
                placeholder="8765 4321"
                className="flex-1 rounded-r-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Plan
              </label>
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="maestro">Maestro</option>
                <option value="artesano">Artesano</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Duración (días)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Campaña
            </label>
            {!useNewCampaign ? (
              <div className="flex gap-2">
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {campaigns.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setUseNewCampaign(true)}
                  className="rounded-md border border-border px-3 py-2 text-xs text-text-secondary hover:bg-background"
                >
                  Nueva
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCampaign}
                  onChange={(e) =>
                    setNewCampaign(e.target.value.toUpperCase())
                  }
                  placeholder="NOMBRE_CAMPAÑA"
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setUseNewCampaign(false)}
                  className="rounded-md border border-border px-3 py-2 text-xs text-text-secondary hover:bg-background"
                >
                  Existente
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Expiración del código
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Código (auto-generado)
            </label>
            <p className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-accent">
              {previewCode}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="accent-accent"
            />
            Enviar email de invitación ahora
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:bg-background"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
            >
              {isPending
                ? "Creando..."
                : sendEmail
                  ? "Crear y Enviar"
                  : "Crear Invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
