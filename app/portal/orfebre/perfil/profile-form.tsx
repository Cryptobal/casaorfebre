"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { updateArtisanProfile, updateProfileImage } from "@/lib/actions/profile";
import { useState } from "react";

interface ProfileFormProps {
  artisan: {
    displayName: string;
    bio: string;
    story: string | null;
    specialty: string;
    materials: string[];
    location: string;
    videoUrl: string | null;
    profileImage: string | null;
    slug: string;
  };
}

export function ProfileForm({ artisan }: ProfileFormProps) {
  const [profileStatus, setProfileStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [imageStatus, setImageStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleProfileSubmit(formData: FormData) {
    setSaving(true);
    setProfileStatus(null);
    const result = await updateArtisanProfile(formData);
    setProfileStatus(result);
    setSaving(false);
  }

  async function handleImageSubmit(formData: FormData) {
    setUploading(true);
    setImageStatus(null);
    const result = await updateProfileImage(formData);
    setImageStatus(result);
    setUploading(false);
  }

  return (
    <div className="space-y-6">
      {/* Profile image upload */}
      <Card>
        <h2 className="text-sm font-medium text-text-secondary">Foto de perfil</h2>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-border bg-background">
            {artisan.profileImage ? (
              <Image
                src={artisan.profileImage}
                alt={artisan.displayName}
                width={64}
                height={64}
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
          <form action={handleImageSubmit} className="flex items-center gap-3">
            <Input
              type="file"
              name="file"
              accept="image/*"
              required
              className="max-w-xs text-sm"
            />
            <Button type="submit" size="sm" variant="secondary" loading={uploading}>
              Subir
            </Button>
          </form>
        </div>
        {imageStatus?.success && (
          <p className="mt-2 text-sm text-green-700">Imagen actualizada</p>
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
              <Label htmlFor="location">Ubicacion</Label>
              <Input
                id="location"
                name="location"
                defaultValue={artisan.location}
                required
                className="mt-1"
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
