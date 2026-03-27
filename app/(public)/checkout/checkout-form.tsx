"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutPreference } from "@/lib/actions/checkout";
import {
  CHILEAN_REGIONS,
  citiesForRegion,
  type ChileanRegion,
} from "@/lib/chile-cities";

const OTHER_CITY = "Otra comuna";

interface CheckoutItem {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string; altText: string | null }[];
  };
}

export type SavedShipping = {
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingRegion: string | null;
  shippingPostalCode: string | null;
  shippingPhone?: string | null;
} | null;

function getInitialShippingState(saved: SavedShipping | undefined) {
  if (!saved?.shippingRegion) {
    return { region: "", cityChoice: "", cityOther: "" };
  }
  const r = saved.shippingRegion;
  if (!CHILEAN_REGIONS.includes(r as ChileanRegion)) {
    return { region: "", cityChoice: "", cityOther: "" };
  }
  const list = citiesForRegion(r);
  const sc = saved.shippingCity?.trim() ?? "";
  if (!sc) return { region: r, cityChoice: "", cityOther: "" };
  if (list.includes(sc)) return { region: r, cityChoice: sc, cityOther: "" };
  return { region: r, cityChoice: OTHER_CITY, cityOther: sc };
}

interface CheckoutFormProps {
  items: CheckoutItem[];
  total: number;
  hasCustomMade: boolean;
  savedAddress?: SavedShipping;
}

const selectClass =
  "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1";

export function CheckoutForm({
  hasCustomMade,
  savedAddress,
}: CheckoutFormProps) {
  const initialShipping = getInitialShippingState(savedAddress);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [region, setRegion] = useState(initialShipping.region);
  const [cityChoice, setCityChoice] = useState(initialShipping.cityChoice);
  const [cityOther, setCityOther] = useState(initialShipping.cityOther);

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountRewardId, setDiscountRewardId] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);

  const cityOptions = useMemo(
    () => (region ? citiesForRegion(region) : []),
    [region]
  );

  function handleRegionChange(value: string) {
    setRegion(value);
    setCityChoice("");
    setCityOther("");
  }

  async function handleApplyDiscount() {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    setDiscountError("");
    setValidatingCode(true);
    try {
      const res = await fetch("/api/referrals/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountAmount(data.discountAmount);
        setDiscountRewardId(data.rewardId);
        setDiscountApplied(true);
      } else {
        setDiscountError(data.error || "Código no válido");
        setDiscountAmount(0);
        setDiscountRewardId("");
        setDiscountApplied(false);
      }
    } catch {
      setDiscountError("Error al validar el código");
    } finally {
      setValidatingCode(false);
    }
  }

  function handleRemoveDiscount() {
    setDiscountCode("");
    setDiscountAmount(0);
    setDiscountRewardId("");
    setDiscountApplied(false);
    setDiscountError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!region) {
      setError("Selecciona una región.");
      return;
    }

    let shippingCity = "";
    if (!cityChoice) {
      setError("Selecciona una comuna o ciudad.");
      return;
    }
    if (cityChoice === OTHER_CITY) {
      const t = cityOther.trim();
      if (!t) {
        setError("Indica el nombre de tu comuna o ciudad.");
        return;
      }
      shippingCity = t;
    } else {
      shippingCity = cityChoice;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("shippingRegion", region);
    formData.set("shippingCity", shippingCity);
    if (discountApplied && discountRewardId) {
      formData.set("discountCode", discountCode.trim().toUpperCase());
      formData.set("discountRewardId", discountRewardId);
      formData.set("discountAmount", String(discountAmount));
    }

    startTransition(async () => {
      const result = await createCheckoutPreference(formData);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping */}
      <fieldset className="rounded-lg border border-border bg-surface p-6">
        <legend className="sr-only">Datos de envío</legend>
        <div className="mb-5 flex items-center gap-2.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h2 className="text-lg font-medium text-text">
            Dirección de envío
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shippingName">Nombre completo</Label>
              <Input
                id="shippingName"
                name="shippingName"
                required
                placeholder="María González"
                className="mt-1"
                autoComplete="name"
                defaultValue={savedAddress?.shippingName ?? undefined}
              />
            </div>
            <div>
              <Label htmlFor="shippingPhone">
                Teléfono{" "}
                <span className="font-normal text-text-tertiary">(para el courier)</span>
              </Label>
              <Input
                id="shippingPhone"
                name="shippingPhone"
                type="tel"
                placeholder="+56 9 1234 5678"
                className="mt-1"
                autoComplete="tel"
                defaultValue={savedAddress?.shippingPhone ?? undefined}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shippingAddress">Dirección</Label>
            <Input
              id="shippingAddress"
              name="shippingAddress"
              required
              placeholder="Av. Principal 123, Depto 4B"
              className="mt-1"
              autoComplete="street-address"
              defaultValue={savedAddress?.shippingAddress ?? undefined}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shippingRegion">Región</Label>
              <select
                id="shippingRegion"
                value={region}
                onChange={(e) => handleRegionChange(e.target.value)}
                required
                className={selectClass}
              >
                <option value="" disabled>
                  Selecciona una región
                </option>
                {CHILEAN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="shippingCitySelect">
                Comuna / Ciudad
              </Label>
              <select
                id="shippingCitySelect"
                value={cityChoice}
                onChange={(e) => {
                  setCityChoice(e.target.value);
                  if (e.target.value !== OTHER_CITY) setCityOther("");
                }}
                disabled={!region}
                required={!!region}
                className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <option value="">
                  {region
                    ? "Selecciona una comuna"
                    : "Primero elige región"}
                </option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cityChoice === OTHER_CITY && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <Label htmlFor="shippingCityOther">
                Nombre de la comuna o ciudad
              </Label>
              <Input
                id="shippingCityOther"
                value={cityOther}
                onChange={(e) => setCityOther(e.target.value)}
                placeholder="Ej.: Isla de Pascua"
                className="mt-1"
                autoComplete="address-level2"
              />
            </div>
          )}

          <div className="sm:w-1/3">
            <Label htmlFor="shippingPostalCode">
              Código postal{" "}
              <span className="font-normal text-text-tertiary">(opcional)</span>
            </Label>
            <Input
              id="shippingPostalCode"
              name="shippingPostalCode"
              placeholder="7500000"
              className="mt-1"
              autoComplete="postal-code"
              defaultValue={savedAddress?.shippingPostalCode ?? undefined}
            />
          </div>
        </div>
      </fieldset>

      {/* Discount code */}
      <fieldset className="rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" />
            <path d="M13 17v2" />
            <path d="M13 11v2" />
          </svg>
          <h2 className="text-lg font-medium text-text">
            Código de descuento
          </h2>
        </div>

        {discountApplied ? (
          <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-green-800">
                Descuento aplicado: -${discountAmount.toLocaleString("es-CL")}
              </p>
              <p className="text-xs text-green-600">
                Código: {discountCode.toUpperCase()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveDiscount}
              className="text-sm text-green-700 underline hover:text-green-900"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-3">
              <Input
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value);
                  setDiscountError("");
                }}
                placeholder="Ej: REF-ABC123"
                className="flex-1 uppercase"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleApplyDiscount}
                loading={validatingCode}
                disabled={!discountCode.trim()}
              >
                Aplicar
              </Button>
            </div>
            {discountError && (
              <p className="mt-2 text-sm text-red-600">{discountError}</p>
            )}
            <p className="mt-2 text-xs text-text-tertiary">
              Si tienes un código de referido, ingrésalo aquí para obtener tu descuento.
            </p>
          </div>
        )}
      </fieldset>

      {/* Custom-made warning */}
      {hasCustomMade && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 flex-shrink-0 text-amber-600"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <p className="text-sm text-amber-800">
            Tu carrito incluye piezas personalizadas que no admiten devolución.
            Al pagar, aceptas esta condición.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 flex-shrink-0 text-red-600"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Pay button */}
      <Button
        type="submit"
        size="lg"
        loading={isPending}
        className="w-full gap-2"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Pagar con Mercado Pago
      </Button>
    </form>
  );
}
