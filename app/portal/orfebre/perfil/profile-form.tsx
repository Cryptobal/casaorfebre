"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { updateArtisanProfile, updateProfileImage } from "@/lib/actions/profile";
import { useState } from "react";
import { CHILEAN_REGIONS, citiesForRegion } from "@/lib/chile-cities";

interface ProfileFormProps {
  artisan: {
    displayName: string;
    bio: string;
    story: string | null;
    specialty: string;
    materials: string[];
    location: string;
    region: string | null;
    videoUrl: string | null;
    profileImage: string | null;
    slug: string;
    yearsExperience: number | null;
    awards: string[];
  };
}

export function ProfileForm({ artisan }: ProfileFormProps) {
  const [profileStatus, setProfileStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [imageStatus, setImageStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [awards, setAwards] = useState<string[]>(artisan.awards);
  const [awardInput, setAwardInput] = useState("");
  const [region, setRegion] = useState(artisan.region ?? "");
  const [ciudad, setCiudad] = useState(artisan.location ?? "");

  const regionOptions = CHILEAN_REGIONS.map((r) => ({ value: r, label: r }));
  const cityOptions = citiesForRegion(region).map((c) => ({ value: c, label: c }));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleProfileSubmit(formData: FormData) {
    setSaving(true);
    setProfileStatus(null);
    const result = await updateArtisanProfile(formData);
    setProfileStatus(result);
    setSaving(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setImageStatus(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await updateProfileImage(formData);
      setImageStatus(result);
    } catch {
      setImageStatus({ error: "Error de conexión al subir la imagen." });
    }
    setUploading(false);
  }

  return (
    <div className="space-y-6">
      {/* Profile image upload */}
      <Card>
        <h2 className="text-sm font-medium text-text-secondary">Foto de perfil</h2>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-border bg-background">
            {uploading ? (
              <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            ) : previewUrl || artisan.profileImage ? (
              <img
                src={previewUrl || artisan.profileImage!}
                alt={artisan.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background">
              Cambiar foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
        {imageStatus?.success && (
          <p className="mt-2 text-sm text-green-700">Foto actualizada</p>
        )}
        {imageStatus?.error && (
          <p className="mt-2 text-sm text-red-600">{imageStatus.error}</p>
        )}
      </Card>

      {/* Profile form */}
      <Card>
        <h2 className="text-sm font-medium text-text-secondary">Informacion del perfil</h2>
        <form action={handleProfileSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="displayName">Nombre de artista</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={artisan.displayName}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={artisan.bio}
              required
              rows={3}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            />
          </div>

          <div>
            <Label htmlFor="story">Historia (opcional)</Label>
            <textarea
              id="story"
              name="story"
              defaultValue={artisan.story ?? ""}
              rows={4}
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                name="specialty"
                defaultValue={artisan.specialty}
                required
                className="mt-1"
              />
            </div>
            <div>
              <input type="hidden" name="region" value={region} />
              <input type="hidden" name="location" value={ciudad} />
              <Label>Región</Label>
              <SelectDropdown
                options={regionOptions}
                value={region}
                onChange={(v) => { setRegion(v); setCiudad(""); }}
                placeholder="Selecciona tu región..."
              />
            </div>
            <div>
              <Label>Ciudad</Label>
              <SelectDropdown
                options={cityOptions}
                value={ciudad}
                onChange={setCiudad}
                placeholder={region ? "Selecciona tu ciudad..." : "Selecciona una región primero"}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="materials">Materiales (separados por coma)</Label>
            <Input
              id="materials"
              name="materials"
              defaultValue={artisan.materials.join(", ")}
              placeholder="Plata 950, Cobre, Piedras naturales"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="yearsExperience">¿Cuántos años llevas en la orfebrería?</Label>
            <Input
              id="yearsExperience"
              name="yearsExperience"
              type="number"
              min={0}
              max={80}
              defaultValue={artisan.yearsExperience ?? ""}
              placeholder="Ej: 12"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Premios, sellos de excelencia, certificaciones</Label>
            <input type="hidden" name="awards" value={awards.join("|||")} />
            <div className="mt-1 flex gap-2">
              <Input
                value={awardInput}
                onChange={(e) => setAwardInput(e.target.value)}
                placeholder="Ej: Sello de Excelencia Artesanías de Chile 2023"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = awardInput.trim();
                    if (val && !awards.includes(val)) {
                      setAwards([...awards, val]);
                      setAwardInput("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const val = awardInput.trim();
                  if (val && !awards.includes(val)) {
                    setAwards([...awards, val]);
                    setAwardInput("");
                  }
                }}
              >
                Agregar
              </Button>
            </div>
            {awards.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {awards.map((award) => (
                  <span
                    key={award}
                    className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent"
                  >
                    {award}
                    <button
                      type="button"
                      onClick={() => setAwards(awards.filter((a) => a !== award))}
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
            <Label htmlFor="videoUrl">URL de video (opcional)</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              defaultValue={artisan.videoUrl ?? ""}
              placeholder="https://youtube.com/watch?v=..."
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" loading={saving}>
              Guardar cambios
            </Button>
            {profileStatus?.success && (
              <p className="text-sm text-green-700">Perfil actualizado</p>
            )}
            {profileStatus?.error && (
              <p className="text-sm text-red-600">{profileStatus.error}</p>
            )}
          </div>
        </form>
      </Card>

      {/* Public profile link */}
      <div className="text-sm">
        <a
          href={`/orfebres/${artisan.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          Ver mi perfil publico
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
