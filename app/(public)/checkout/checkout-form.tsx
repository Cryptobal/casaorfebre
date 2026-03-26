"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutPreference } from "@/lib/actions/checkout";

const CHILEAN_REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
];

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

interface CheckoutFormProps {
  items: CheckoutItem[];
  total: number;
  hasCustomMade: boolean;
}

export function CheckoutForm({ items, total, hasCustomMade }: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

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
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shippingCity">Ciudad</Label>
              <Input
                id="shippingCity"
                name="shippingCity"
                required
                placeholder="Santiago"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="shippingRegion">Región</Label>
              <select
                id="shippingRegion"
                name="shippingRegion"
                required
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona una región
                </option>
                {CHILEAN_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:w-1/2">
            <Label htmlFor="shippingPostalCode">Código postal (opcional)</Label>
            <Input
              id="shippingPostalCode"
              name="shippingPostalCode"
              placeholder="7500000"
              className="mt-1"
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
