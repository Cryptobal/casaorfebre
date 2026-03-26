"use client";

import { useActionState, useState } from "react";
import { submitApplication } from "@/lib/actions/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { TagSelect } from "@/components/ui/tag-select";

const CIUDADES = [
  "Arica",
  "Iquique",
  "Antofagasta",
  "Copiapó",
  "La Serena",
  "Valparaíso",
  "Viña del Mar",
  "Santiago",
  "Rancagua",
  "Talca",
  "Chillán",
  "Concepción",
  "Temuco",
  "Valdivia",
  "Osorno",
  "Puerto Montt",
  "Coyhaique",
  "Punta Arenas",
];

const ESPECIALIDADES = [
  "Plata",
  "Oro",
  "Cobre",
  "Bronce",
  "Piedras Naturales",
  "Piedras Preciosas",
  "Esmalte",
  "Filigrana",
  "Grabado",
  "Forja",
];

const MATERIALES = [
  "Plata 950",
  "Plata 925",
  "Oro 18K",
  "Oro 14K",
  "Cobre",
  "Bronce",
  "Alpaca",
  "Cuarzo",
  "Lapislázuli",
  "Turquesa",
  "Ágata",
  "Amatista",
  "Ónix",
  "Perla",
  "Madreperla",
  "Resina",
  "Madera",
  "Cuero",
  "Hilo encerado",
];

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(submitApplication, null);
  const [ciudad, setCiudad] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [materiales, setMateriales] = useState<string[]>([]);

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
          <Label>Ciudad *</Label>
          <Combobox
            options={CIUDADES}
            value={ciudad}
            onChange={setCiudad}
            name="location"
            required
            placeholder="Escribe tu ciudad..."
            className="mt-1"
          />
        </div>
        <div>
          <Label>Especialidad *</Label>
          <TagSelect
            options={ESPECIALIDADES}
            selected={especialidades}
            onChange={setEspecialidades}
            name="specialty"
            required
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>Materiales con los que trabajas *</Label>
        <TagSelect
          options={MATERIALES}
          selected={materiales}
          onChange={setMateriales}
          name="materials"
          required
          className="mt-2"
        />
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
        <Label htmlFor="phone">Teléfono de contacto *</Label>
        <div className="mt-1 flex items-center gap-2">
          <span className="flex h-[38px] items-center rounded-md border border-border bg-background px-3 text-sm text-text-secondary">
            +56 9
          </span>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="numeric"
            pattern="[0-9]{8}"
            maxLength={8}
            placeholder="1234 5678"
            onKeyDown={(e) => {
              // Allow control keys
              if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === "Tab" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.ctrlKey ||
                e.metaKey
              )
                return;
              // Block non-numeric
              if (!/[0-9]/.test(e.key)) e.preventDefault();
            }}
          />
        </div>
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
