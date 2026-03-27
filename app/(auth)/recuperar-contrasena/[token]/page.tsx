"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordWithToken } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NuevaContrasenaPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const [state, formAction, pending] = useActionState(resetPasswordWithToken, null);

  return (
    <div>
      <h1 className="text-center font-serif text-2xl font-light">Nueva contraseña</h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        Elige una contraseña segura para tu cuenta.
      </p>

      {!token ? (
        <p className="mt-8 rounded-md bg-error/10 px-3 py-2 text-sm text-error">
          Enlace inválido.{" "}
          <Link href="/recuperar-contrasena" className="text-accent underline">
            Solicitar uno nuevo
          </Link>
        </p>
      ) : (
      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />
        {state?.error && (
          <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{state.error}</p>
        )}
        <div>
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1"
            placeholder="Repite la contraseña"
          />
        </div>
        <Button type="submit" className="w-full" loading={pending}>
          Guardar contraseña
        </Button>
      </form>
      )}

      <p className="mt-6 text-center text-sm text-text-tertiary">
        <Link href="/login" className="text-accent hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
