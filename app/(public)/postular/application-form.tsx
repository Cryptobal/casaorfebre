"use client";

import { useActionState, useState } from "react";
import { submitApplication } from "@/lib/actions/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { TagSelect } from "@/components/ui/tag-select";
import { CHILEAN_REGIONS, citiesForRegion } from "@/lib/chile-cities";

/** Especialidades técnicas / de oficio (catálogo `specialties`). */
const DEFAULT_ESPECIALIDADES = [
  "Joyería de autor",
  "Engastado de piedras",
  "Fundición y modelado",
  "Orfebrería tradicional",
  "Alta joyería",
  "Joyería contemporánea",
];

/** Tipos de pieza (catálogo `categories`); fallback si no hay BD. */
const CATEGORIAS_FALLBACK = [
  "Aros",
  "Collar",
  "Anillo",
  "Pulsera",
  "Broche",
  "Colgante",
  "Bisutería",
  "Otro",
];

const DEFAULT_MATERIALES = [
  "Plata 950", "Plata 925", "Oro 18K", "Oro 14K", "Cobre", "Bronce",
  "Alpaca", "Cuarzo", "Lapislázuli", "Turquesa", "Ágata", "Amatista",
  "Ónix", "Perla", "Madreperla", "Resina", "Madera", "Cuero", "Hilo encerado",
];

interface ApplicationFormProps {
  /** Nombres de especialidades de orfebrería (tabla `specialties`). */
  specialties?: string[];
  /** Nombres de categorías de pieza (tabla `categories`). */
  categories?: string[];
  materials?: string[];
}

export function ApplicationForm({
  specialties: specialtiesProp,
  categories: categoriesProp,
  materials: materialsProp,
}: ApplicationFormProps) {
  const opcionesEspecialidad =
    specialtiesProp && specialtiesProp.length > 0 ? specialtiesProp : DEFAULT_ESPECIALIDADES;
  const opcionesCategoria =
    categoriesProp && categoriesProp.length > 0 ? categoriesProp : CATEGORIAS_FALLBACK;
  const MATERIALES =
    materialsProp && materialsProp.length > 0 ? materialsProp : DEFAULT_MATERIALES;
  const [state, formAction, pending] = useActionState(submitApplication, null);
  const [region, setRegion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [materiales, setMateriales] = useState<string[]>([]);

  const regionOptions = CHILEAN_REGIONS.map((r) => ({ value: r, label: r }));
  const cityOptions = citiesForRegion(region).map((c) => ({ value: c, label: c }));

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

      {/* Hidden inputs for form data */}
      <input type="hidden" name="region" value={region} />
      <input type="hidden" name="location" value={ciudad} />
      <input type="hidden" name="categories" value={categorias.join(",")} />

      {/* ─── Section 1: Datos personales ─── */}
      <div>
        <h3 className="font-serif text-lg font-light text-text mb-4">Datos personales</h3>

        <div className="space-y-6">
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
              <Label>Región *</Label>
              <SelectDropdown
                options={regionOptions}
                value={region}
                onChange={(v) => {
                  setRegion(v);
                  setCiudad("");
                }}
                placeholder="Selecciona tu región..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Ciudad *</Label>
              <SelectDropdown
                options={cityOptions}
                value={ciudad}
                onChange={setCiudad}
                placeholder={region ? "Selecciona tu ciudad..." : "Selecciona una región primero"}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 2: Tu oficio ─── */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="font-serif text-lg font-light text-text mb-4">Tu oficio</h3>

        <div className="space-y-6">
          <div>
            <Label>Especialidad en orfebrería *</Label>
            <TagSelect
              options={opcionesEspecialidad}
              selected={especialidades}
              onChange={setEspecialidades}
              name="specialty"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label>Categorías de piezas que produces *</Label>
            <TagSelect
              options={opcionesCategoria}
              selected={categorias}
              onChange={setCategorias}
              name="_categories_display"
              required
              className="mt-2"
            />
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
        </div>
      </div>

      {/* ─── Section 3: Sobre ti ─── */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="font-serif text-lg font-light text-text mb-4">Sobre ti</h3>

        <div className="space-y-6">
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
            <Label>Fotos de tu trabajo (opcional)</Label>
            <p className="mt-1 text-sm text-text-tertiary italic">Próximamente</p>
          </div>
        </div>
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
