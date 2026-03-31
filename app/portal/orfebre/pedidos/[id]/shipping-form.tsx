"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { markAsShipped } from "@/lib/actions/orders";
import {
  getTrackingUrl,
  CARRIERS,
  validateTrackingNumber,
  sanitizeTrackingNumber,
} from "@/lib/tracking";

export function ShippingForm({ orderItemId }: { orderItemId: string }) {
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sanitized = sanitizeTrackingNumber(trackingNumber);
  const trackingUrl = carrier ? getTrackingUrl(carrier, sanitized) : null;

  function handleVerify() {
    setError(null);
    if (!carrier || !sanitized) {
      setError("Completa el courier y número de seguimiento");
      return;
    }
    const validationError = validateTrackingNumber(carrier, sanitized);
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowVerify(true);
    setVerified(false);
  }

  function handleConfirmShip() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("trackingCarrier", carrier);
      formData.set("trackingNumber", sanitized);
      const result = await markAsShipped(orderItemId, formData);
      if (result.error) {
        setError(result.error);
        setShowVerify(false);
        setVerified(false);
      }
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-text">
        Ingresa los datos de envío para marcar como despachado.
      </p>

      <div>
        <Label htmlFor="trackingCarrier">Courier</Label>
        <select
          id="trackingCarrier"
          value={carrier}
          onChange={(e) => {
            setCarrier(e.target.value);
            setShowVerify(false);
            setVerified(false);
            setError(null);
          }}
          required
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        >
          <option value="">Seleccionar courier</option>
          {CARRIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="trackingNumber">Número de seguimiento</Label>
        <Input
          id="trackingNumber"
          value={trackingNumber}
          onChange={(e) => {
            setTrackingNumber(e.target.value);
            setShowVerify(false);
            setVerified(false);
            setError(null);
          }}
          required
          placeholder="Ej: 99123456789"
          className="mt-1"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Step 1: Verify tracking */}
      {!showVerify && (
        <Button type="button" onClick={handleVerify} variant="secondary">
          Verificar número de tracking
        </Button>
      )}

      {/* Step 2: Verification modal */}
      {showVerify && (
        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
          <p className="text-sm font-medium text-text">
            Verifica que tu tracking funciona
          </p>

          {trackingUrl ? (
            <>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Abrir seguimiento en {carrier}
              </a>
              <p className="text-xs text-text-tertiary">
                Abre el enlace, verifica que el código muestra tu envío, y luego confirma abajo.
              </p>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              El courier &ldquo;{carrier}&rdquo; no tiene seguimiento en línea.
              Asegúrate de que el número <strong>{sanitized}</strong> es correcto.
            </p>
          )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="verifyCheck"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <label htmlFor="verifyCheck" className="text-sm text-text">
              Confirmo que verifiqué el número de tracking y es correcto
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleConfirmShip}
              disabled={!verified || isPending}
            >
              {isPending ? "Despachando..." : "Marcar como despachado"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowVerify(false);
                setVerified(false);
              }}
            >
              Corregir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
