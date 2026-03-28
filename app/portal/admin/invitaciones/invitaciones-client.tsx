"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  resendInvitation,
  deactivateInvitation,
} from "@/lib/actions/invitations";
import { NewInvitationModal } from "@/components/admin/new-invitation-modal";
import { CsvImportModal } from "@/components/admin/csv-import-modal";

type Invitation = {
  id: string;
  code: string;
  planName: string;
  durationDays: number;
  recipientName: string | null;
  recipientEmail: string | null;
  invitationStatus: string;
  isActive: boolean;
  campaign: string;
  sentAt: Date | null;
  openedAt: Date | null;
  appliedAt: Date | null;
  redeemedAt: Date | null;
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
              <th className="px-4 py-3">Postulado</th>
              <th className="px-4 py-3">Redimido</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
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
