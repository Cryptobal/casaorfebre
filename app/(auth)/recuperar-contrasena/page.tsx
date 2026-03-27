"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RecuperarContrasenaPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null);

  return (
    <div>
      <h1 className="text-center font-serif text-2xl font-light">Recuperar contraseña</h1>
      <p className="mt-2 text-center text-sm text-text-tertiary">
        Si hay una cuenta con tu correo, te enviamos un enlace para crear o cambiar tu contraseña (también sirve para el primer acceso con email).
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        {state?.error && (
          <p className="rounded-md bg-error/10 px-3 py-2 text-sm text-error">{state.error}</p>
        )}
        {state?.success && state.message && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{state.message}</p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1"
            placeholder="tu@email.com"
          />
        </div>
        <Button type="submit" className="w-full" loading={pending}>
          Enviar enlace
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-tertiary">
        <Link href="/login" className="text-accent hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
