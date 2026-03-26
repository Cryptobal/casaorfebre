"use client";

import { useActionState } from "react";
import { updateBuyerProfile, changePassword } from "@/lib/actions/buyer-profile";

interface ProfileFormProps {
  name: string;
  email: string;
  hasPassword: boolean;
}

export function ProfileForm({ name, email, hasPassword }: ProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return updateBuyerProfile(formData);
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
