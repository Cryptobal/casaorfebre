"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseGiftCard } from "@/lib/actions/gift-cards";
import { formatCLP } from "@/lib/utils";

const PRESET_AMOUNTS = [15000, 30000, 50000, 100000];
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 500000;

export function GiftCardForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amount = isCustom
    ? parseInt(customAmount, 10) || 0
    : selectedAmount || 0;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);
  const isAmountValid = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  const canSubmit = isAmountValid && isEmailValid && !isPending;

  function handlePresetClick(value: number) {
    setIsCustom(false);
    setSelectedAmount(value);
    setCustomAmount("");
  }

  function handleCustomClick() {
    setIsCustom(true);
    setSelectedAmount(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!session?.user) {
      router.push(`/login?redirect=/gift-cards`);
      return;
    }

    const formData = new FormData();
    formData.set("amount", String(amount));
    formData.set("recipientEmail", recipientEmail.trim());
    if (recipientName.trim()) formData.set("recipientName", recipientName.trim());
    if (message.trim()) formData.set("message", message.trim().slice(0, 200));

    startTransition(async () => {
      const result = await purchaseGiftCard(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      {/* Left: Form */}
      <div className="space-y-6">
        {/* Amount selection */}
        <fieldset className="rounded-lg border border-border bg-surface p-6">
          <legend className="sr-only">Monto</legend>
          <div className="mb-4 flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M12 12a3 3 0 1 0 0-0.01" />
            </svg>
            <h2 className="text-lg font-medium text-text">Elige el monto</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PRESET_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handlePresetClick(value)}
                className={`rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                  !isCustom && selectedAmount === value
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border text-text-secondary hover:border-text-tertiary"
                }`}
              >
                {formatCLP(value)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCustomClick}
            className={`mt-3 w-full rounded-lg border-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
              isCustom
                ? "border-accent bg-accent/5 text-accent"
                : "border-border text-text-secondary hover:border-text-tertiary"
            }`}
          >
            Otro monto
          </button>

          {isCustom && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="customAmount">
                Monto personalizado (CLP)
              </Label>
              <Input
                id="customAmount"
                type="number"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={1000}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`${MIN_AMOUNT.toLocaleString("es-CL")} — ${MAX_AMOUNT.toLocaleString("es-CL")}`}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Mínimo {formatCLP(MIN_AMOUNT)}, máximo {formatCLP(MAX_AMOUNT)}
              </p>
            </div>
          )}
        </fieldset>

        {/* Recipient data */}
        <fieldset className="rounded-lg border border-border bg-surface p-6">
          <legend className="sr-only">Destinatario</legend>
          <div className="mb-4 flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h2 className="text-lg font-medium text-text">Destinatario</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientName">
                ¿Para quién es?{" "}
                <span className="font-normal text-text-tertiary">(opcional)</span>
              </Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ej: María"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="recipientEmail">Email del destinatario</Label>
              <Input
                id="recipientEmail"
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="nombre@email.com"
                className="mt-1"
              />
            </div>
          </div>
        </fieldset>

        {/* Personal message */}
        <fieldset className="rounded-lg border border-border bg-surface p-6">
          <legend className="sr-only">Mensaje personal</legend>
          <div className="mb-4 flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h2 className="text-lg font-medium text-text">Mensaje personal</h2>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            placeholder="Ej: ¡Feliz cumpleaños! Elige la joya que más te guste 💝"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          />
          <p className="mt-1 text-right text-xs text-text-tertiary">
            {message.length}/200
          </p>
        </fieldset>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-red-600">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          loading={isPending}
          disabled={!canSubmit}
          className="w-full gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
          </svg>
          {amount > 0
            ? `Comprar Gift Card — ${formatCLP(amount)}`
            : "Comprar Gift Card"}
        </Button>
      </div>

      {/* Right: Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-sm font-medium text-text-tertiary">
          Vista previa
        </p>
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
          <div className="bg-gradient-to-br from-[#f5f3ef] to-[#ebe7e0] p-8 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
              casa orfebre
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Gift Card
            </p>
            <p className="mt-4 text-4xl font-bold text-accent">
              {amount > 0 ? formatCLP(amount) : "$—"}
            </p>
            {message.trim() && (
              <p className="mx-auto mt-4 max-w-xs text-sm italic text-text-secondary">
                &ldquo;{message.trim()}&rdquo;
              </p>
            )}
            {recipientName.trim() && (
              <p className="mt-4 text-sm text-text-secondary">
                Para: <span className="font-medium text-text">{recipientName.trim()}</span>
              </p>
            )}
            <div className="mx-auto mt-6 max-w-[220px] rounded-lg bg-white/60 px-4 py-3">
              <p className="text-xs text-text-tertiary">Código</p>
              <p className="mt-1 font-mono text-lg font-bold tracking-wider text-text">
                XXXX-XXXX-XXXX-XXXX
              </p>
            </div>
          </div>
          <div className="bg-surface px-6 py-4 text-center">
            <p className="text-xs text-text-tertiary">
              Válida por 1 año desde la compra
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
