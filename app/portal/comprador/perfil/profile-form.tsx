"use client";

import { useActionState, useState, useCallback } from "react";
import { updateBuyerProfile, changePassword, updateShippingAddress } from "@/lib/actions/buyer-profile";
import { AddressAutocomplete, type AddressResult } from "@/components/address-autocomplete";

interface ShippingAddress {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingRegion: string;
  shippingPostalCode: string;
  shippingPhone: string;
}

interface ProfileFormProps {
  name: string;
  email: string;
  hasPassword: boolean;
  shippingAddress: ShippingAddress;
}

export function ProfileForm({ name, email, hasPassword, shippingAddress }: ProfileFormProps) {
  const [addrRegion, setAddrRegion] = useState(shippingAddress.shippingRegion);
  const [addrCity, setAddrCity] = useState(shippingAddress.shippingCity);
  const [addrPostal, setAddrPostal] = useState(shippingAddress.shippingPostalCode);

  const handleAddressSelect = useCallback((result: AddressResult) => {
    setAddrRegion(result.region ?? "");
    setAddrCity(result.comuna);
    setAddrPostal(result.postalCode);
  }, []);

  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return updateBuyerProfile(formData);
    },
    null,
  );

  const [shippingState, shippingAction, shippingPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return updateShippingAddress(formData);
    },
    null,
  );

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return changePassword(formData);
    },
    null,
  );

  return (
    <div className="mt-8 max-w-md space-y-10">
      {/* Profile section */}
      <form action={profileAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={name}
            required
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-tertiary"
          />
        </div>

        {profileState?.error && (
          <p className="text-sm text-red-600">{profileState.error}</p>
        )}
        {profileState?.success && (
          <p className="text-sm text-green-600">Perfil actualizado correctamente</p>
        )}

        <button
          type="submit"
          disabled={profilePending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          {profilePending ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Shipping address section */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="font-serif text-lg font-light mb-4">Direcci&oacute;n de Env&iacute;o</h2>
        <form action={shippingAction} className="space-y-4">
          <div>
            <label htmlFor="shippingName" className="text-sm font-medium text-text mb-1 block">
              Nombre completo
            </label>
            <input
              id="shippingName"
              name="shippingName"
              type="text"
              defaultValue={shippingAddress.shippingName}
              required
              className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text mb-1 block">
              Dirección
            </label>
            <AddressAutocomplete
              defaultValue={shippingAddress.shippingAddress}
              onAddressSelect={handleAddressSelect}
            />
          </div>

          <input type="hidden" name="shippingCity" value={addrCity} />
          <input type="hidden" name="shippingRegion" value={addrRegion} />
          <input type="hidden" name="shippingPostalCode" value={addrPostal} />

          {(addrRegion || addrCity) && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Ciudad</label>
                <input value={addrCity} readOnly tabIndex={-1} className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-muted text-text-secondary cursor-default" />
              </div>
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Región</label>
                <input value={addrRegion} readOnly tabIndex={-1} className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-muted text-text-secondary cursor-default" />
              </div>
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Código Postal</label>
                <input value={addrPostal} readOnly tabIndex={-1} className="w-full border border-border rounded-lg px-4 py-2 text-sm bg-muted text-text-secondary cursor-default" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="shippingPhone" className="text-sm font-medium text-text mb-1 block">
              Teléfono
            </label>
            <div className="flex items-center gap-2">
              <span className="flex h-[38px] items-center rounded-lg border border-border bg-muted px-3 text-sm text-text-secondary">+56</span>
              <input
                id="shippingPhone"
                name="shippingPhone"
                type="tel"
                inputMode="numeric"
                defaultValue={shippingAddress.shippingPhone}
                placeholder="912345678"
                maxLength={9}
                className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-background"
              />
            </div>
            <p className="mt-1 text-xs text-text-tertiary">9 dígitos (celular o fijo)</p>
          </div>

          {shippingState?.error && (
            <p className="text-sm text-red-600">{shippingState.error}</p>
          )}
          {shippingState?.success && (
            <p className="text-sm text-green-600">Direcci&oacute;n de env&iacute;o actualizada correctamente</p>
          )}

          <button
            type="submit"
            disabled={shippingPending}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors text-sm disabled:opacity-50"
          >
            {shippingPending ? "Guardando..." : "Guardar Direcci\u00f3n"}
          </button>
        </form>
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Password section */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-light text-text">Cambiar Contraseña</h2>

        {!hasPassword && (
          <p className="text-sm text-text-tertiary">
            Si iniciaste sesión con Google, no necesitas contraseña
          </p>
        )}

        <form action={passwordAction} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-text">
              Contraseña actual
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {passwordState?.error && (
            <p className="text-sm text-red-600">{passwordState.error}</p>
          )}
          {passwordState?.success && (
            <p className="text-sm text-green-600">Contraseña actualizada correctamente</p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            {passwordPending ? "Cambiando..." : "Cambiar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
