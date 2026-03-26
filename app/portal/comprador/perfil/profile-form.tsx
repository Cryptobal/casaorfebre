"use client";

import { useActionState } from "react";
import { updateBuyerProfile, changePassword, updateShippingAddress } from "@/lib/actions/buyer-profile";

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
            <label htmlFor="shippingAddress" className="text-sm font-medium text-text mb-1 block">
              Direcci&oacute;n
            </label>
            <input
              id="shippingAddress"
              name="shippingAddress"
              type="text"
              defaultValue={shippingAddress.shippingAddress}
              required
              placeholder="Av. Principal 123, Depto 4B"
              className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-background"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shippingCity" className="text-sm font-medium text-text mb-1 block">
                Ciudad
              </label>
              <input
                id="shippingCity"
                name="shippingCity"
                type="text"
                defaultValue={shippingAddress.shippingCity}
                required
                placeholder="Santiago"
                className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-background"
              />
            </div>
            <div>
              <label htmlFor="shippingRegion" className="text-sm font-medium text-text mb-1 block">
                Regi&oacute;n
              </label>
              <input
                id="shippingRegion"
                name="shippingRegion"
                type="text"
                defaultValue={shippingAddress.shippingRegion}
                required
                placeholder="Metropolitana de Santiago"
                className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-background"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shippingPostalCode" className="text-sm font-medium text-text mb-1 block">
                C&oacute;digo Postal
              </label>
              <input
                id="shippingPostalCode"
                name="shippingPostalCode"
                type="text"
                defaultValue={shippingAddress.shippingPostalCode}
                placeholder="7500000"
                className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-background"
              />
            </div>
            <div>
              <label htmlFor="shippingPhone" className="text-sm font-medium text-text mb-1 block">
                Tel&eacute;fono
              </label>
              <input
                id="shippingPhone"
                name="shippingPhone"
                type="text"
                defaultValue={shippingAddress.shippingPhone}
                placeholder="+56 9 1234 5678"
                className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-background"
              />
            </div>
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
