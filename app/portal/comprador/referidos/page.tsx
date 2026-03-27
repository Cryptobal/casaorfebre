"use client";

import { useEffect, useState, useTransition } from "react";
import { getOrCreateReferralCode } from "@/lib/actions/referral";
import { formatCLP } from "@/lib/utils";

interface Referral {
  id: string;
  name: string;
  date: string;
  hasPurchased: boolean;
  rewardStatus: string | null;
}

interface ActiveReward {
  id: string;
  code: string;
  amount: number;
  expiresAt: string;
  referredName: string;
}

interface UsedReward {
  id: string;
  code: string;
  amount: number;
  usedAt: string;
  referredName: string;
}

export default function ReferidosPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [activeRewards, setActiveRewards] = useState<ActiveReward[]>([]);
  const [usedRewards, setUsedRewards] = useState<UsedReward[]>([]);

  useEffect(() => {
    startTransition(async () => {
      const code = await getOrCreateReferralCode();
      setReferralCode(code);
    });
    fetch("/api/referrals/details")
      .then((r) => r.json())
      .then((d) => {
        setReferrals(d.referrals ?? []);
        setActiveRewards(d.activeRewards ?? []);
        setUsedRewards(d.usedRewards ?? []);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const referralUrl = referralCode
    ? `https://casaorfebre.cl/?ref=${referralCode}`
    : "";

  function handleCopy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Te invito a conocer Casa Orfebre, joyas de autor hechas a mano por orfebres chilenos. Registrate con mi link y ambos ganamos: ${referralUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleEmail() {
    const subject = encodeURIComponent("Te invito a Casa Orfebre");
    const body = encodeURIComponent(
      `Hola!\n\nTe invito a conocer Casa Orfebre, un marketplace de joyería artesanal chilena. Registrate con mi link y cuando hagas tu primera compra, yo recibo un descuento:\n\n${referralUrl}\n\nSaludos!`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function referralStatus(r: Referral) {
    if (r.rewardStatus === "ACTIVATED" || r.rewardStatus === "USED")
      return { label: "Recompensa ganada", color: "text-green-700 bg-green-50" };
    if (r.hasPurchased)
      return { label: "Compró", color: "text-green-700 bg-green-50" };
    return { label: "Registrado", color: "text-amber-700 bg-amber-50" };
  }

  function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-light text-text">
        Invita Amigos
      </h1>
      <p className="mt-2 text-sm font-light text-text-secondary">
        Comparte tu link de referido. Cuando tu amigo haga su primera compra,
        recibirás <strong>$5.000 de descuento</strong> para tu próxima compra.
      </p>

      {/* Referral link section */}
      <div className="mt-8 rounded-lg border border-border bg-surface p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Tu link de referido
        </p>
        {isPending || !referralCode ? (
          <div className="mt-3 h-10 animate-pulse rounded-lg bg-background" />
        ) : (
          <div className="mt-3 flex gap-3">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-text-secondary focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-dark"
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        )}

        {/* Share buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleWhatsApp}
            disabled={!referralCode}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            disabled={!referralCode}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email
          </button>
          <button
            onClick={handleCopy}
            disabled={!referralCode}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copiar link
          </button>
        </div>
      </div>

      {/* Active rewards */}
      {activeRewards.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg font-light text-text">
            Recompensas disponibles
          </h2>
          <div className="mt-4 space-y-3">
            {activeRewards.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {formatCLP(r.amount)} de descuento
                  </p>
                  <p className="text-xs text-green-600">
                    Por referir a {r.referredName}
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    Expira en {daysUntil(r.expiresAt)} días ({formatDate(r.expiresAt)})
                  </p>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleCopyCode(r.code)}
                    className="rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-800 transition-colors hover:bg-green-100"
                  >
                    {copiedCode === r.code ? "Copiado!" : r.code}
                  </button>
                  <p className="mt-1 text-[10px] text-green-600">
                    Usa en el checkout
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referrals table */}
      <div className="mt-8">
        <h2 className="font-serif text-lg font-light text-text">
          Personas referidas
        </h2>
        {referrals.length === 0 ? (
          <div className="mt-4 rounded-lg border border-border bg-surface p-8 text-center">
            <p className="text-sm text-text-tertiary">
              Aún no has referido a nadie. Comparte tu link para comenzar.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {referrals.map((r) => {
                  const status = referralStatus(r);
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-text">{r.name}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {formatDate(r.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Used rewards (history) */}
      {usedRewards.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg font-light text-text">
            Historial de recompensas usadas
          </h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Referido
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">
                    Usado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {usedRewards.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {r.code}
                    </td>
                    <td className="px-4 py-3 text-text">
                      {formatCLP(r.amount)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {r.referredName}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {r.usedAt ? formatDate(r.usedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-10 rounded-lg border border-border bg-surface p-6">
        <h2 className="font-serif text-lg font-light text-text">
          ¿Cómo funciona?
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-text-secondary">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
              1
            </span>
            Comparte tu link de referido con amigos y familia.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
              2
            </span>
            Tu amigo se registra usando tu link.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
              3
            </span>
            Cuando hace su primera compra, recibes $5.000 de descuento.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
              4
            </span>
            Usa tu código de descuento en el checkout de tu próxima compra.
          </li>
        </ol>
      </div>
    </div>
  );
}
