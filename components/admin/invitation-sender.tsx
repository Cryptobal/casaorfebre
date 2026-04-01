"use client";

import { useState, useMemo } from "react";
import {
  createAndSendInvitations,
  getCampaignDetail,
  resendCampaignInvitation,
} from "@/lib/actions/campaign-invitations";
import type { InvitationCampaign, Invitation } from "@prisma/client";

// ---------------------------------------------------------------------------
// Email parser
// ---------------------------------------------------------------------------

function parseEmails(text: string): string[] {
  return [
    ...new Set(
      text
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)),
    ),
  ];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CampaignWithCount = InvitationCampaign & { _count: { invitations: number } };

interface InvitationSenderProps {
  type: "PIONEER" | "ARTISAN" | "BUYER";
  campaigns: CampaignWithCount[];
}

// ---------------------------------------------------------------------------
// Status badges
// ---------------------------------------------------------------------------

const STATUS_BADGES: Record<string, { className: string; label: string }> = {
  SENT: { className: "bg-gray-100 text-gray-700", label: "Enviado" },
  OPENED: { className: "bg-blue-100 text-blue-700", label: "Abierto" },
  CLICKED: { className: "bg-yellow-100 text-yellow-700", label: "Click" },
  ACCEPTED: { className: "bg-green-100 text-green-700", label: "Aceptado" },
  FAILED: { className: "bg-red-100 text-red-700", label: "Fallido" },
  BOUNCED: { className: "bg-orange-100 text-orange-700", label: "Rebotado" },
};

function formatDate(d: Date | string | null): string {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvitationSender({ type, campaigns }: InvitationSenderProps) {
  const [emailsText, setEmailsText] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  // Campaign detail expansion
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [detailInvitations, setDetailInvitations] = useState<Invitation[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const parsedEmails = useMemo(() => parseEmails(emailsText), [emailsText]);
  const rawCount = emailsText.split(/[\s,;]+/).filter(Boolean).length;
  const duplicatesRemoved = rawCount - parsedEmails.length;

  async function handleSend() {
    if (parsedEmails.length === 0) return;
    setIsSending(true);
    setResult(null);
    try {
      const res = await createAndSendInvitations({
        emails: parsedEmails,
        type,
        campaignName,
        campaignDescription: campaignDescription || undefined,
      });
      setResult({ sent: res.sent, failed: res.failed, skipped: res.skipped, errors: res.errors });
      if (res.success && res.sent > 0) {
        setEmailsText("");
        setCampaignName("");
        setCampaignDescription("");
      }
    } catch {
      setResult({ sent: 0, failed: parsedEmails.length, skipped: 0, errors: ["Error inesperado"] });
    }
    setIsSending(false);
  }

  async function handleToggleDetail(campaignId: string) {
    if (expandedCampaign === campaignId) {
      setExpandedCampaign(null);
      setDetailInvitations([]);
      return;
    }

    setExpandedCampaign(campaignId);
    setLoadingDetail(true);
    try {
      const detail = await getCampaignDetail(campaignId);
      setDetailInvitations(detail?.invitations ?? []);
    } catch {
      setDetailInvitations([]);
    }
    setLoadingDetail(false);
  }

  async function handleResend(id: string) {
    setResendingId(id);
    await resendCampaignInvitation(id);
    // Refresh detail
    if (expandedCampaign) {
      const detail = await getCampaignDetail(expandedCampaign);
      setDetailInvitations(detail?.invitations ?? []);
    }
    setResendingId(null);
  }

  return (
    <div className="space-y-8">
      {/* ── New Campaign ── */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="font-serif text-lg font-medium text-text">Nueva campaña</h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Nombre de campaña</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="Ej: Lanzamiento abril 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">{"Descripción (opcional)"}</label>
            <input
              type="text"
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Emails</label>
            <textarea
              rows={8}
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              placeholder={"Pega los emails separados por coma, punto y coma, o uno por línea.\n\nEjemplo:\nmaria@gmail.com, jose@outlook.com\nana@hotmail.com"}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            />
            <div className="mt-2">
              {parsedEmails.length === 0 ? (
                <p className="text-xs text-text-tertiary">No se detectaron emails válidos aún</p>
              ) : (
                <p className="text-xs font-medium text-green-700">
                  {"\u2713 "}{parsedEmails.length}{" emails válidos detectados"}
                </p>
              )}
              {duplicatesRemoved > 0 && (
                <p className="text-xs text-text-tertiary">{"Se eliminaron "}{duplicatesRemoved}{" duplicados o inválidos"}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={parsedEmails.length === 0 || !campaignName || isSending}
            className="rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            {isSending ? "Enviando... (puede tomar unos segundos)" : "Enviar invitaciones"}
          </button>

          {result && (
            <div className="rounded-md border border-border bg-background p-4 text-sm">
              <p className="text-green-700">{"Enviadas: "}{result.sent}</p>
              <p className="text-text-tertiary">{"Omitidas (ya invitadas): "}{result.skipped}</p>
              <p className="text-red-600">{"Fallidas: "}{result.failed}</p>
              {result.errors.length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-xs text-red-500">
                  {result.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Previous Campaigns ── */}
      <div>
        <h3 className="font-serif text-lg font-medium text-text">Campañas anteriores</h3>
        {campaigns.length === 0 ? (
          <p className="mt-4 text-sm text-text-tertiary">No hay campañas aún.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-text-tertiary">
                  <th className="px-4 py-3">Campaña</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Enviadas</th>
                  <th className="px-4 py-3">Abiertas</th>
                  <th className="px-4 py-3">Clicks</th>
                  <th className="px-4 py-3">Aceptadas</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <CampaignRow
                    key={c.id}
                    campaign={c}
                    isExpanded={expandedCampaign === c.id}
                    invitations={expandedCampaign === c.id ? detailInvitations : []}
                    loadingDetail={expandedCampaign === c.id && loadingDetail}
                    resendingId={resendingId}
                    onToggle={() => handleToggleDetail(c.id)}
                    onResend={handleResend}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign Row sub-component
// ---------------------------------------------------------------------------

function CampaignRow({
  campaign: c,
  isExpanded,
  invitations,
  loadingDetail,
  resendingId,
  onToggle,
  onResend,
}: {
  campaign: CampaignWithCount;
  isExpanded: boolean;
  invitations: Invitation[];
  loadingDetail: boolean;
  resendingId: string | null;
  onToggle: () => void;
  onResend: (id: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-3 font-medium">{c.name}</td>
        <td className="px-4 py-3 text-text-tertiary">{formatDate(c.createdAt)}</td>
        <td className="px-4 py-3">{c.totalSent}</td>
        <td className="px-4 py-3">{c.totalOpened}</td>
        <td className="px-4 py-3">{c.totalClicked}</td>
        <td className="px-4 py-3">{c.totalAccepted}</td>
        <td className="px-4 py-3">
          <button
            onClick={onToggle}
            className="text-xs font-medium text-accent hover:text-accent-dark"
          >
            {isExpanded ? "Ocultar" : "Ver detalle"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="bg-surface px-4 py-4">
            {loadingDetail ? (
              <p className="text-xs text-text-tertiary">Cargando...</p>
            ) : invitations.length === 0 ? (
              <p className="text-xs text-text-tertiary">Sin invitaciones</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-tertiary">
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Estado</th>
                    <th className="pb-2">Enviado</th>
                    <th className="pb-2">Abierto</th>
                    <th className="pb-2">Click</th>
                    <th className="pb-2">Aceptado</th>
                    <th className="pb-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => {
                    const badge = STATUS_BADGES[inv.status] ?? STATUS_BADGES.SENT;
                    return (
                      <tr key={inv.id} className="border-t border-border/50">
                        <td className="py-2">{inv.email}</td>
                        <td className="py-2">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2 text-text-tertiary">{formatDate(inv.sentAt)}</td>
                        <td className="py-2 text-text-tertiary">{formatDate(inv.openedAt)}</td>
                        <td className="py-2 text-text-tertiary">{formatDate(inv.clickedAt)}</td>
                        <td className="py-2 text-text-tertiary">{formatDate(inv.acceptedAt)}</td>
                        <td className="py-2">
                          {(inv.status === "FAILED" || inv.status === "BOUNCED") && (
                            <button
                              onClick={() => onResend(inv.id)}
                              disabled={resendingId === inv.id}
                              className="rounded border border-border px-2 py-0.5 text-[10px] text-text-secondary hover:bg-background disabled:opacity-50"
                            >
                              Reenviar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
