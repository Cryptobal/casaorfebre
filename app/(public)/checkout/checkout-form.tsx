"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutPreference } from "@/lib/actions/checkout";
import { validateGiftCard } from "@/lib/actions/gift-cards";
import { formatCLP } from "@/lib/utils";
import {
  AddressAutocomplete,
  type AddressResult,
} from "@/components/address-autocomplete";

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

interface CheckoutFormProps {
  items: CheckoutItem[];
  total: number;
  hasCustomMade: boolean;
  savedAddress?: SavedShipping;
}

export function CheckoutForm({
  items,
  total: subtotal,
  hasCustomMade,
  savedAddress,
}: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Address fields from Google
  const [addressRegion, setAddressRegion] = useState(savedAddress?.shippingRegion ?? "");
  const [addressComuna, setAddressComuna] = useState(savedAddress?.shippingCity ?? "");
  const [addressCiudad, setAddressCiudad] = useState("");
  const [addressPostal, setAddressPostal] = useState(savedAddress?.shippingPostalCode ?? "");

  // Phone
  const [phone, setPhone] = useState(savedAddress?.shippingPhone ?? "");
  const [phoneError, setPhoneError] = useState("");

  // Field errors (custom validation, no native browser popups)
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");

  // Gift state
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [giftWrapping, setGiftWrapping] = useState(false);

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountRewardId, setDiscountRewardId] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);

  // Gift card state
  const [gcCode, setGcCode] = useState("");
  const [gcBalance, setGcBalance] = useState(0);
  const [gcApplied, setGcApplied] = useState(false);
  const [gcNormalized, setGcNormalized] = useState("");
  const [gcError, setGcError] = useState("");
  const [gcValidating, setGcValidating] = useState(false);

  // Shipping cost
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingZone, setShippingZone] = useState("");
  const [shippingDays, setShippingDays] = useState("");
  const [shippingFree, setShippingFree] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [shippingThreshold, setShippingThreshold] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const handleAddressSelect = useCallback((result: AddressResult) => {
    setAddressRegion(result.region ?? "");
    setAddressComuna(result.comuna);
    setAddressCiudad(result.ciudad);
    setAddressPostal(result.postalCode);
  }, []);

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
    setPhoneError("");
  }

  // Fetch shipping cost when region changes
  useEffect(() => {
    if (!addressRegion) {
      setShippingCost(null);
      setShippingError("");
      return;
    }
    setLoadingShipping(true);
    setShippingError("");
    fetch(`/api/shipping/calculate?region=${encodeURIComponent(addressRegion)}&subtotal=${subtotal}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setShippingError(data.error);
          setShippingCost(null);
        } else {
          setShippingCost(data.cost);
          setShippingZone(data.zoneName);
          setShippingDays(data.estimatedDays);
          setShippingFree(data.isFreeShipping);
          setShippingThreshold(data.freeShippingThreshold);
        }
      })
      .catch(() => setShippingError("Error al calcular envío"))
      .finally(() => setLoadingShipping(false));
  }, [addressRegion, subtotal]);

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

  function formatGcInput(value: string) {
    const clean = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 16);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join("-");
  }

  async function handleApplyGiftCard() {
    const raw = gcCode.replace(/-/g, "").trim();
    if (!raw) return;
    setGcError("");
    setGcValidating(true);
    try {
      const result = await validateGiftCard(raw);
      if (result.valid) {
        setGcBalance(result.balance);
        setGcNormalized(result.code);
        setGcApplied(true);
      } else {
        setGcError(result.error);
        setGcBalance(0);
        setGcApplied(false);
      }
    } catch {
      setGcError("Error al validar la Gift Card");
    } finally {
      setGcValidating(false);
    }
  }

  function handleRemoveGiftCard() {
    setGcCode("");
    setGcBalance(0);
    setGcNormalized("");
    setGcApplied(false);
    setGcError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNameError("");
    setPhoneError("");
    setAddressError("");

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("shippingName") as string)?.trim();

    let hasFieldError = false;

    if (!name) {
      setNameError("Ingresa tu nombre completo.");
      hasFieldError = true;
    }

    if (phone.length !== 9) {
      setPhoneError("Ingresa 9 dígitos.");
      hasFieldError = true;
    }

    if (!addressRegion || !addressComuna) {
      setAddressError("Busca y selecciona tu dirección para completar los campos.");
      hasFieldError = true;
    }

    if (hasFieldError) return;

    formData.set("shippingRegion", addressRegion);
    formData.set("shippingCity", addressComuna);
    formData.set("shippingPhone", phone);
    if (addressPostal) formData.set("shippingPostalCode", addressPostal);
    if (discountApplied && discountRewardId) {
      formData.set("discountCode", discountCode.trim().toUpperCase());
      formData.set("discountRewardId", discountRewardId);
      formData.set("discountAmount", String(discountAmount));
    }
    if (isGift) {
      formData.set("isGift", "true");
      if (giftMessage.trim()) {
        formData.set("giftMessage", giftMessage.trim().slice(0, 200));
      }
      if (giftWrapping) {
        formData.set("giftWrapping", "true");
      }
    }
    if (gcApplied && gcNormalized) {
      formData.set("giftCardCode", gcNormalized);
      formData.set("giftCardBalance", String(gcBalance));
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
                placeholder="María González"
                className={`mt-1 ${nameError ? "border-red-400 focus:ring-red-400" : ""}`}
                autoComplete="name"
                defaultValue={savedAddress?.shippingName ?? undefined}
                onChange={() => nameError && setNameError("")}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600">{nameError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="shippingPhone">Teléfono</Label>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-text-secondary">
                  +56
                </span>
                <Input
                  id="shippingPhone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="912345678"
                  className={`flex-1 ${phoneError ? "border-red-400 focus:ring-red-400" : ""}`}
                  maxLength={9}
                />
              </div>
              {phoneError && (
                <p className="mt-1 text-xs text-red-600">{phoneError}</p>
              )}
              <p className="mt-1 text-xs text-text-tertiary">9 dígitos (celular o fijo), para el courier</p>
            </div>
          </div>

          <div>
            <Label htmlFor="shippingAddress">Dirección</Label>
            <AddressAutocomplete
              defaultValue={savedAddress?.shippingAddress ?? undefined}
              onAddressSelect={(result) => {
                handleAddressSelect(result);
                setAddressError("");
              }}
            />
            {addressError && (
              <p className="mt-1 text-xs text-red-600">{addressError}</p>
            )}
          </div>

          {(addressRegion || addressComuna || addressCiudad) && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="displayRegion">Región</Label>
                  <Input
                    id="displayRegion"
                    value={addressRegion}
                    readOnly
                    tabIndex={-1}
                    className="mt-1 cursor-default bg-muted text-text-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="displayComuna">Comuna</Label>
                  <Input
                    id="displayComuna"
                    value={addressComuna}
                    readOnly
                    tabIndex={-1}
                    className="mt-1 cursor-default bg-muted text-text-secondary"
                  />
                </div>
                <div>
                  <Label htmlFor="displayCiudad">Ciudad</Label>
                  <Input
                    id="displayCiudad"
                    value={addressCiudad}
                    readOnly
                    tabIndex={-1}
                    className="mt-1 cursor-default bg-muted text-text-secondary"
                  />
                </div>
              </div>

              {addressPostal && (
                <div className="mt-4 sm:w-1/3">
                  <Label htmlFor="displayPostal">Código postal</Label>
                  <Input
                    id="displayPostal"
                    value={addressPostal}
                    readOnly
                    tabIndex={-1}
                    className="mt-1 cursor-default bg-muted text-text-secondary"
                  />
                </div>
              )}
            </div>
          )}
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

      {/* Gift options */}
      <fieldset className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13" />
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
            </svg>
            <h2 className="text-lg font-medium text-text">
              ¿Es un regalo?
            </h2>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isGift}
            aria-label={isGift ? "Desactivar opción de regalo" : "Activar opción de regalo"}
            onClick={() => setIsGift(!isGift)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isGift ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                isGift ? "translate-x-[24px]" : "translate-x-[3px]"
              }`}
            />
          </button>
        </div>

        {isGift && (
          <div className="mt-5 animate-in fade-in slide-in-from-top-2 space-y-4 duration-200">
            <div>
              <Label htmlFor="giftMessage">
                Mensaje personal{" "}
                <span className="font-normal text-text-tertiary">(opcional)</span>
              </Label>
              <textarea
                id="giftMessage"
                value={giftMessage}
                onChange={(e) =>
                  setGiftMessage(e.target.value.slice(0, 200))
                }
                placeholder="Escribe tu mensaje aquí..."
                rows={3}
                className="mt-1 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
              />
              <p className="mt-1 text-right text-xs text-text-tertiary">
                {giftMessage.length}/200
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-background">
              <input
                type="checkbox"
                checked={giftWrapping}
                onChange={(e) => setGiftWrapping(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">
                    Agregar empaque de regalo
                  </span>
                  <span className="text-sm font-medium text-green-700">
                    Gratis
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Incluye caja de regalo y tarjeta con tu mensaje escrito a mano
                  por el orfebre
                </p>
              </div>
            </label>

            {giftMessage.trim() && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 flex-shrink-0 text-amber-600"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <p className="text-xs text-amber-800">
                  Tu mensaje aparecerá en una tarjeta dentro del paquete
                </p>
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Gift Card */}
      <fieldset className="rounded-lg border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
          </svg>
          <h2 className="text-lg font-medium text-text">
            ¿Tienes una Gift Card?
          </h2>
        </div>

        {gcApplied ? (
          <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-green-800">
                Gift Card aplicada: -{formatCLP(Math.min(gcBalance, 999999))}
              </p>
              <p className="text-xs text-green-600">
                Saldo disponible: {formatCLP(gcBalance)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveGiftCard}
              className="text-sm text-green-700 underline hover:text-green-900"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-3">
              <Input
                value={gcCode}
                onChange={(e) => {
                  setGcCode(formatGcInput(e.target.value));
                  setGcError("");
                }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="flex-1 font-mono uppercase tracking-wider"
                maxLength={19}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleApplyGiftCard}
                loading={gcValidating}
                disabled={gcCode.replace(/-/g, "").length < 16}
              >
                Aplicar
              </Button>
            </div>
            {gcError && (
              <p className="mt-2 text-sm text-red-600">{gcError}</p>
            )}
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

      {/* Shipping & order summary */}
      {addressRegion && (
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="text-sm font-medium text-text">Resumen del pedido</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal ({items.length} {items.length === 1 ? "pieza" : "piezas"})</span>
              <span className="text-text">{formatCLP(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">
                Envío {shippingZone && `(${shippingZone})`}
              </span>
              {loadingShipping ? (
                <span className="text-text-tertiary">Calculando...</span>
              ) : shippingError ? (
                <span className="text-red-600 text-xs">{shippingError}</span>
              ) : shippingFree ? (
                <span className="font-medium text-green-700">Gratis</span>
              ) : shippingCost !== null ? (
                <span className="text-text">{formatCLP(shippingCost)}</span>
              ) : (
                <span className="text-text-tertiary">—</span>
              )}
            </div>
            {shippingDays && !shippingError && (
              <p className="text-xs text-text-tertiary">Entrega estimada: {shippingDays}</p>
            )}
            {!shippingFree && shippingCost !== null && shippingThreshold > 0 && subtotal < shippingThreshold && (
              <p className="text-xs text-accent">
                Agrega {formatCLP(shippingThreshold - subtotal)} más para envío gratis
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span className="text-text">Total</span>
              <span className="text-text">{formatCLP(subtotal + (shippingCost ?? 0))}</span>
            </div>
          </div>
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
