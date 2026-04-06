"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  resendInvitation,
  deactivateInvitation,
  deleteInvitation,
} from "@/lib/actions/invitations";
import { NewInvitationModal } from "@/components/admin/new-invitation-modal";
import { CsvImportModal } from "@/components/admin/csv-import-modal";
import {
  WhatsAppInvitationModal,
  type WhatsAppInvitationData,
} from "@/components/admin/whatsapp-invitation-modal";

type Invitation = {
  id: string;
  code: string;
  planName: string;
  durationDays: number;
  recipientName: string | null;
  recipientEmail: string | null;
  phone: string | null;
  invitationStatus: string;
  isActive: boolean;
  campaign: string;
  metadata: unknown;
  sentAt: Date | null;
  openedAt: Date | null;
  appliedAt: Date | null;
  redeemedAt: Date | null;
  whatsappSentAt: Date | null;
  createdAt: Date;
  expiresAt: Date;
};

type Campaign = { name: string; count: number };

const STATUS_BADGES: Record<string, { className: string; label: string }> = {
  DRAFT: { className: "bg-gray-100 text-gray-700", label: "Borrador" },
  SENT: { className: "bg-blue-100 text-blue-700", label: "Enviado" },
  OPENED: { className: "bg-yellow-100 text-yellow-700", label: "Abierto" },
  APPLIED: { className: "bg-orange-100 text-orange-700", label: "Postulado" },
  REDEEMED: { className: "bg-green-100 text-green-700", label: "Aprobado" },
  EXPIRED: { className: "bg-red-100 text-red-700", label: "Expirado" },
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });
}

function whatsAppTypeFromMetadata(metadata: unknown): "PIONEER" | "ARTISAN" {
  const meta = metadata as { invitationKind?: "PIONEER" | "ORFEBRE" } | null;
  return meta?.invitationKind === "ORFEBRE" ? "ARTISAN" : "PIONEER";
}

export function InvitacionesClient({
  invitations,
  campaigns,
  currentCampaign,
  currentStatus,
  currentSearch,
}: {
  invitations: Invitation[];
  campaigns: Campaign[];
  currentCampaign: string;
  currentStatus: string;
  currentSearch: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppInvitationData | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (key === "campaign") {
      if (value) params.set("campaign", value);
      if (currentStatus) params.set("status", currentStatus);
      if (currentSearch) params.set("search", currentSearch);
    } else if (key === "status") {
      if (currentCampaign) params.set("campaign", currentCampaign);
      if (value) params.set("status", value);
      if (currentSearch) params.set("search", currentSearch);
    } else if (key === "search") {
      if (currentCampaign) params.set("campaign", currentCampaign);
      if (currentStatus) params.set("status", currentStatus);
      if (value) params.set("search", value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(`/portal/admin/invitaciones${qs ? `?${qs}` : ""}`);
    });
  }

  async function handleResend(id: string) {
    setActionId(id);
    try {
      await resendInvitation(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al re-enviar");
    }
    setActionId(null);
  }

  async function handleDeactivate(id: string) {
    if (!confirm("¿Desactivar esta invitación? El código dejará de funcionar."))
      return;
    setActionId(id);
    try {
      await deactivateInvitation(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al desactivar");
    }
    setActionId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta invitación? Se borrará permanentemente."))
      return;
    setActionId(id);
    try {
      await deleteInvitation(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    }
    setActionId(null);
  }

  return (
    <>
      {/* Action bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowNewModal(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
        >
          + Nueva Invitación
        </button>
        <button
          onClick={() => setShowCsvModal(true)}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background"
        >
          Importar CSV
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={currentStatus}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_BADGES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={currentCampaign}
            onChange={(e) => updateFilter("campaign", e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">Todas las campañas</option>
            {campaigns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("search", e.currentTarget.value);
              }
            }}
            className="w-40 rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>

      {isPending && (
        <p className="mt-4 text-sm text-text-tertiary">Cargando...</p>
      )}

      {/* Table */}
      <Card className="mt-4 overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-text-tertiary">
              <th className="px-4 py-3">Orfebre</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Enviado</th>
              <th className="px-4 py-3">Abierto</th>
              <th className="px-4 py-3">WA</th>
              <th className="px-4 py-3">Postulado</th>
              <th className="px-4 py-3">Redimido</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-text-tertiary"
                >
                  No hay invitaciones
                </td>
              </tr>
            ) : (
              invitations.map((inv) => {
                const badge = STATUS_BADGES[inv.invitationStatus] ??
                  STATUS_BADGES.DRAFT;
                const canSend =
                  inv.isActive &&
                  ["DRAFT", "SENT"].includes(inv.invitationStatus);
                const canDeactivate =
                  inv.isActive &&
                  ["DRAFT", "SENT", "OPENED"].includes(inv.invitationStatus);
                const canDelete =
                  inv.invitationStatus !== "REDEEMED";
                const loading = actionId === inv.id;

                return (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {inv.recipientName ?? "—"}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {inv.recipientEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                        {inv.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 capitalize">{inv.planName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {formatDate(inv.sentAt)}
                    </td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {formatDate(inv.openedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {inv.whatsappSentAt ? (
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          WA {formatDate(inv.whatsappSentAt)}
                        </span>
                      ) : inv.phone ? (
                        <button
                          type="button"
                          onClick={() =>
                            setWhatsAppData({
                              invitationId: inv.id,
                              name: inv.recipientName ?? "",
                              phone: inv.phone!,
                              type: whatsAppTypeFromMetadata(inv.metadata),
                            })
                          }
                          className="inline-flex items-center gap-1 rounded border border-[#25D366]/40 px-2 py-0.5 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/10"
                          title="Enviar por WhatsApp"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          Enviar
                        </button>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {formatDate(inv.appliedAt)}
                    </td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {formatDate(inv.redeemedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {canSend && (
                          <button
                            disabled={loading}
                            onClick={() => handleResend(inv.id)}
                            className="rounded border border-border px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-background disabled:opacity-50"
                          >
                            {inv.invitationStatus === "DRAFT"
                              ? "Enviar"
                              : "Re-enviar"}
                          </button>
                        )}
                        {canDeactivate && (
                          <button
                            disabled={loading}
                            onClick={() => handleDeactivate(inv.id)}
                            className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            Desactivar
                          </button>
                        )}
                        {canDelete && (
                          <button
                            disabled={loading}
                            onClick={() => handleDelete(inv.id)}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {showNewModal && (
        <NewInvitationModal
          campaigns={campaigns}
          onClose={() => setShowNewModal(false)}
          onWhatsAppReady={(data) => setWhatsAppData(data)}
        />
      )}

      {whatsAppData && (
        <WhatsAppInvitationModal
          data={whatsAppData}
          onClose={() => setWhatsAppData(null)}
        />
      )}

      {showCsvModal && (
        <CsvImportModal
          campaigns={campaigns}
          onClose={() => setShowCsvModal(false)}
        />
      )}
    </>
  );
}
