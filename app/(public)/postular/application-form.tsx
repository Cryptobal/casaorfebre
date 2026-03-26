"use client";

import { useActionState } from "react";
import { submitApplication } from "@/lib/actions/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(submitApplication, null);

  if (state?.success) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-medium">
          ¡Postulación enviada!
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Revisaremos tu postulación y te contactaremos pronto. El proceso
          puede tomar entre 3 y 7 días hábiles.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-md bg-error/10 px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            name="name"
            required
            className="mt-1"
            placeholder="Tu nombre artístico o real"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="location">Ciudad *</Label>
          <Input
            id="location"
            name="location"
            required
            className="mt-1"
            placeholder="Ej: Valparaíso"
          />
        </div>
        <div>
          <Label htmlFor="specialty">Especialidad *</Label>
          <Input
            id="specialty"
            name="specialty"
            required
            className="mt-1"
            placeholder="Ej: Plata & Piedras Naturales"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="materials">Materiales con los que trabajas *</Label>
        <Input
          id="materials"
          name="materials"
          required
          className="mt-1"
          placeholder="Separados por coma: Plata 950, Cobre, Cuarzo"
        />
        <p className="mt-1 text-xs text-text-tertiary">
          Separa cada material con una coma
        </p>
      </div>

      <div>
        <Label htmlFor="bio">Sobre ti y tu trabajo *</Label>
        <textarea
          id="bio"
          name="bio"
          required
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          placeholder="Cuéntanos sobre tu trayectoria, tu inspiración y qué hace únicas tus piezas..."
        />
      </div>

      <div>
        <Label htmlFor="experience">Experiencia (opcional)</Label>
        <textarea
          id="experience"
          name="experience"
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          placeholder="Años de experiencia, formación, exposiciones, premios..."
        />
      </div>

      <div>
        <Label htmlFor="portfolioUrl">Link a tu portafolio (opcional)</Label>
        <Input
          id="portfolioUrl"
          name="portfolioUrl"
          type="url"
          className="mt-1"
          placeholder="https://tu-portafolio.com o Instagram"
        />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono de contacto (opcional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          className="mt-1"
          placeholder="+56 9 1234 5678"
        />
        <p className="mt-1 text-xs text-text-tertiary">
          Solo para uso interno. Nunca será visible al público.
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Enviar Postulación
      </Button>

      <p className="text-center text-xs text-text-tertiary">
        Al postular, aceptas que revisemos tu trabajo para determinar si cumple
        con los estándares de curaduría de Casa Orfebre.
      </p>
    </form>
  );
}
