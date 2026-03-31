"use client";

import { useActionState, useEffect, useState } from "react";
import { submitApplication } from "@/lib/actions/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { TagSelect } from "@/components/ui/tag-select";
import { CHILEAN_REGIONS, citiesForRegion } from "@/lib/chile-cities";
import { ApplicationPhotoUpload } from "@/components/postular/application-photo-upload";

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
  /** Plan seleccionado en el paso de pricing */
  selectedPlan?: string;
  /** Código promocional validado (viene del URL) */
  promoCode?: string;
}

function stripNonDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

/** Orden alfabético para etiquetas en español (incluye tildes y ñ). */
function sortAlphabeticalEs(items: string[]): string[] {
  return [...items].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

export function ApplicationForm({
  specialties: specialtiesProp,
  categories: categoriesProp,
  materials: materialsProp,
  selectedPlan,
  promoCode,
}: ApplicationFormProps) {
  const opcionesEspecialidad = sortAlphabeticalEs(
    specialtiesProp && specialtiesProp.length > 0 ? specialtiesProp : DEFAULT_ESPECIALIDADES
  );
  const opcionesCategoria = sortAlphabeticalEs(
    categoriesProp && categoriesProp.length > 0 ? categoriesProp : CATEGORIAS_FALLBACK
  );
  const MATERIALES = sortAlphabeticalEs(
    materialsProp && materialsProp.length > 0 ? materialsProp : DEFAULT_MATERIALES
  );
  const [state, formAction, pending] = useActionState(submitApplication, null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [region, setRegion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [materiales, setMateriales] = useState<string[]>([]);
  const [premios, setPremios] = useState<string[]>([]);
  const [premioInput, setPremioInput] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [acceptedSellerAgreement, setAcceptedSellerAgreement] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const allLegalAccepted = acceptedSellerAgreement && acceptedTerms && acceptedPrivacy;

  const regionOptions = CHILEAN_REGIONS.map((r) => ({ value: r, label: r }));
  const cityOptions = citiesForRegion(region).map((c) => ({ value: c, label: c }));

  useEffect(() => {
    if (state?.success) {
      window.dispatchEvent(new CustomEvent("casaorfebre:close-cart"));
    }
  }, [state?.success]);

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
      {selectedPlan && <input type="hidden" name="selectedPlan" value={selectedPlan} />}
      {promoCode && <input type="hidden" name="promoCode" value={promoCode} />}
      <input type="hidden" name="acceptedSellerAgreement" value={acceptedSellerAgreement ? "true" : "false"} />
      <input type="hidden" name="acceptedTerms" value={acceptedTerms ? "true" : "false"} />
      <input type="hidden" name="acceptedPrivacy" value={acceptedPrivacy ? "true" : "false"} />

      {/* ─── Section 1: Datos personales ─── */}
      <div>
        <h3 className="font-serif text-lg font-light text-text mb-4">Datos personales</h3>

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1"
                placeholder="Nombre"
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1"
                placeholder="Apellido"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Celular *</Label>
              <Input
                id="phone"
                name="phone"
                required
                pattern="[0-9]{9}"
                title="9 dígitos, sin espacios"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(stripNonDigits(e.target.value, 9))}
                className="mt-1"
                placeholder="912345678"
                maxLength={9}
                aria-invalid={phone.length > 0 && phone.length !== 9}
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Ingresa 9 dígitos (ej. 912345678)
              </p>
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
                searchable
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
                searchable
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
              value={bio}
              onChange={(e) => setBio(e.target.value)}
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
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
              placeholder="Años de experiencia, formación, exposiciones, premios..."
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="yearsExperience">Años de experiencia (opcional)</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min={0}
                max={80}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="mt-1"
                placeholder="Ej: 12"
              />
            </div>
          </div>

          <div>
            <Label>Premios y reconocimientos (opcional)</Label>
            <input type="hidden" name="awards" value={premios.join("|||")} />
            <div className="mt-1 flex gap-2">
              <Input
                value={premioInput}
                onChange={(e) => setPremioInput(e.target.value)}
                placeholder="Ej: Sello de Excelencia Artesanías de Chile 2023"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = premioInput.trim();
                    if (val && !premios.includes(val)) {
                      setPremios([...premios, val]);
                      setPremioInput("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const val = premioInput.trim();
                  if (val && !premios.includes(val)) {
                    setPremios([...premios, val]);
                    setPremioInput("");
                  }
                }}
              >
                Agregar
              </Button>
            </div>
            {premios.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {premios.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => setPremios(premios.filter((x) => x !== p))}
                      className="ml-1 text-accent/60 hover:text-accent"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="portfolioUrl">Link a tu portafolio (opcional)</Label>
            <Input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="mt-1"
              placeholder="https://tu-portafolio.com o Instagram"
            />
          </div>

          <div>
            <Label>Fotos de tu trabajo (opcional)</Label>
            <p className="mt-1 text-sm text-text-tertiary">
              Sube hasta 6 imágenes de tu taller o piezas representativas.
            </p>
            <div className="mt-2">
              <ApplicationPhotoUpload urls={portfolioUrls} onChange={setPortfolioUrls} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Aceptación legal ─── */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="font-serif text-lg font-light text-text mb-4">Aceptación legal</h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedSellerAgreement}
              onChange={(e) => setAcceptedSellerAgreement(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-light text-text-secondary">
              He leído y acepto el{" "}
              <a
                href="/acuerdo-orfebre"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Acuerdo de Orfebre
              </a>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-light text-text-secondary">
              He leído y acepto los{" "}
              <a
                href="/terminos"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Términos y Condiciones
              </a>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-light text-text-secondary">
              He leído y acepto la{" "}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Política de Privacidad
              </a>
            </span>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" loading={pending} disabled={!allLegalAccepted}>
        Enviar Postulación
      </Button>

      <p className="text-center text-xs text-text-tertiary">
        Al postular, aceptas que revisemos tu trabajo para determinar si cumple
        con los estándares de curaduría de Casa Orfebre.
      </p>
    </form>
  );
}
