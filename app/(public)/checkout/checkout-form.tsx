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
  if (!sc) {
    return { region: r, cityChoice: "", cityOther: "" };
  }
  if (list.includes(sc)) {
    return { region: r, cityChoice: sc, cityOther: "" };
  }
  return { region: r, cityChoice: OTHER_CITY, cityOther: sc };
}

interface CheckoutFormProps {
  items: CheckoutItem[];
  total: number;
  hasCustomMade: boolean;
  savedAddress?: SavedShipping;
}

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

  const cityOptions = useMemo(
    () => (region ? citiesForRegion(region) : []),
    [region]
  );

  function handleRegionChange(value: string) {
    setRegion(value);
    setCityChoice("");
    setCityOther("");
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
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-medium text-text">
          Datos de envío
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="shippingName">Nombre completo</Label>
            <Input
              id="shippingName"
              name="shippingName"
              required
              placeholder="Juan Pérez"
              className="mt-1"
              defaultValue={savedAddress?.shippingName ?? undefined}
            />
          </div>
          <div>
            <Label htmlFor="shippingAddress">Dirección</Label>
            <Input
              id="shippingAddress"
              name="shippingAddress"
              required
              placeholder="Av. Principal 123, Depto 4B"
              className="mt-1"
              defaultValue={savedAddress?.shippingAddress ?? undefined}
            />
          </div>
          <div>
            <Label htmlFor="shippingRegion">Región</Label>
            <select
              id="shippingRegion"
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
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
            <p className="mt-1 text-xs text-text-tertiary">
              Elige la región primero; luego podrás seleccionar la comuna o
              ciudad.
            </p>
          </div>
          <div>
            <Label htmlFor="shippingCitySelect">Comuna o ciudad</Label>
            <select
              id="shippingCitySelect"
              value={cityChoice}
              onChange={(e) => {
                setCityChoice(e.target.value);
                if (e.target.value !== OTHER_CITY) setCityOther("");
              }}
              disabled={!region}
              required={!!region}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {region ? "Selecciona una comuna o ciudad" : "Primero elige región"}
              </option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {cityChoice === OTHER_CITY && (
            <div>
              <Label htmlFor="shippingCityOther">Nombre de la comuna o ciudad</Label>
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
          <div className="sm:w-1/2">
            <Label htmlFor="shippingPostalCode">Código postal (opcional)</Label>
            <Input
              id="shippingPostalCode"
              name="shippingPostalCode"
              placeholder="7500000"
              className="mt-1"
              defaultValue={savedAddress?.shippingPostalCode ?? undefined}
            />
          </div>
        </div>
      </div>

      {hasCustomMade && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Tu carrito incluye piezas personalizadas que no admiten devolución.
            Al pagar, aceptas esta condición.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={isPending}
        className="w-full"
      >
        Pagar con Mercado Pago
      </Button>
    </form>
  );
}
