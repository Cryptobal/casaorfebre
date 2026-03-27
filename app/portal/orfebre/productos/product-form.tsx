"use client";

import { useActionState, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/products/image-upload";
import { VideoUploader } from "@/components/products/video-uploader";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { createProduct, updateProduct, submitForReview } from "@/lib/actions/products";

const CATEGORY_LABELS: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collar",
  ANILLO: "Anillo",
  PULSERA: "Pulsera",
  BROCHE: "Broche",
  COLGANTE: "Colgante",
  OTRO: "Otro",
};

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description: string;
    story: string | null;
    category: string;
    materials: string[];
    technique: string | null;
    price: number;
    compareAtPrice: number | null;
    isUnique: boolean;
    editionSize: number | null;
    stock: number;
    isCustomMade: boolean;
    dimensions: string | null;
    weight: number | null;
    status: string;
    adminNotes: string | null;
    images: { id: string; url: string; altText: string | null; position: number }[];
    video?: { cloudflareStreamUid: string; status: string } | null;
    specialtyId: string | null;
    occasionIds: string[];
  };
  artisanId: string;
  specialties?: { id: string; name: string }[];
  occasions?: { id: string; name: string }[];
  videoEnabled?: boolean;
}

export function ProductForm({ product, artisanId, specialties = [], occasions = [], videoEnabled = false }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [category, setCategory] = useState(product?.category ?? "ANILLO");
  const [materials, setMaterials] = useState<string[]>(product?.materials ?? []);
  const [materialInput, setMaterialInput] = useState("");
  const [isUnique, setIsUnique] = useState(product?.isUnique ?? true);
  const [isCustomMade, setIsCustomMade] = useState(product?.isCustomMade ?? false);
  const [specialtyId, setSpecialtyId] = useState(product?.specialtyId ?? "");
  const [selectedOccasionIds, setSelectedOccasionIds] = useState<string[]>(product?.occasionIds ?? []);
  const [submitting, setSubmitting] = useState(false);

  const updateBound = product
    ? updateProduct.bind(null, product.id)
    : null;

  const [state, formAction, pending] = useActionState(
    isEditing ? updateBound! : createProduct,
    null
  );

  // Handle redirect after successful create
  if (state?.success && "productId" in state && state.productId) {
    router.push(`/portal/orfebre/productos/${state.productId}`);
  }

  const addMaterial = useCallback(() => {
    const value = materialInput.trim();
    if (value && !materials.includes(value)) {
      setMaterials((prev) => [...prev, value]);
    }
    setMaterialInput("");
  }, [materialInput, materials]);

  const removeMaterial = useCallback((mat: string) => {
    setMaterials((prev) => prev.filter((m) => m !== mat));
  }, []);

  const handleMaterialKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addMaterial();
      }
    },
    [addMaterial]
  );

  const handleSubmitForReview = async () => {
    if (!product) return;
    setSubmitting(true);
    const result = await submitForReview(product.id);
    setSubmitting(false);
    if (result.error) {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rejected banner */}
      {product?.status === "REJECTED" && product.adminNotes && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-medium text-red-800">Producto rechazado</h3>
          <p className="mt-1 text-sm text-red-700">{product.adminNotes}</p>
        </div>
      )}

      {/* Error display */}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Success display */}
      {state?.success && !("productId" in state) && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Producto actualizado correctamente
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={product?.name ?? ""}
            placeholder="Ej: Anillo Ondas del Mar"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Descripcion</Label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={product?.description ?? ""}
            rows={4}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            placeholder="Describe tu pieza en detalle..."
          />
        </div>

        {/* Story */}
        <div className="space-y-1.5">
          <Label htmlFor="story">Historia</Label>
          <p className="text-xs text-text-secondary">La historia detras de esta pieza</p>
          <textarea
            id="story"
            name="story"
            defaultValue={product?.story ?? ""}
            rows={3}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            placeholder="Que te inspiro a crear esta pieza..."
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="category">Categoria</Label>
          <input type="hidden" name="category" value={category} />
          <SelectDropdown
            value={category}
            onChange={setCategory}
            placeholder="Seleccionar categoría"
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            className="w-full"
          />
        </div>

        {/* Specialty */}
        <div className="space-y-1.5">
          <Label htmlFor="specialtyId">Especialidad</Label>
          <input type="hidden" name="specialtyId" value={specialtyId} />
          <SelectDropdown
            value={specialtyId}
            onChange={setSpecialtyId}
            placeholder="Seleccionar especialidad"
            options={[
              { value: "", label: "Sin especialidad" },
              ...specialties.map((s) => ({ value: s.id, label: s.name })),
            ]}
            className="w-full"
          />
        </div>

        {/* Occasions */}
        <div className="space-y-1.5">
          <Label>Ocasiones</Label>
          <input type="hidden" name="occasionIds" value={selectedOccasionIds.join(",")} />
          <p className="text-xs text-text-secondary">
            ¿Para qué ocasiones es ideal esta pieza?
          </p>
          {occasions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {occasions.map((o) => {
                const isSelected = selectedOccasionIds.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() =>
                      setSelectedOccasionIds((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== o.id)
                          : [...prev, o.id]
                      )
                    }
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition ${
                      isSelected
                        ? "bg-accent/10 border-accent text-accent"
                        : "border-border text-text-secondary hover:border-accent/50"
                    }`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {o.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Materials — tag input */}
        <div className="space-y-1.5">
          <Label>Materiales</Label>
          <input type="hidden" name="materials" value={materials.join(",")} />
          <div className="flex gap-2">
            <Input
              type="text"
              value={materialInput}
              onChange={(e) => setMaterialInput(e.target.value)}
              onKeyDown={handleMaterialKeyDown}
              placeholder="Agrega un material y presiona Enter"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addMaterial}>
              Agregar
            </Button>
          </div>
          {materials.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {materials.map((mat) => (
                <span
                  key={mat}
                  className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  {mat}
                  <button
                    type="button"
                    onClick={() => removeMaterial(mat)}
                    className="ml-0.5 text-accent/60 hover:text-accent"
                    aria-label={`Eliminar ${mat}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Technique */}
        <div className="space-y-1.5">
          <Label htmlFor="technique">Tecnica</Label>
          <Input
            id="technique"
            name="technique"
            type="text"
            defaultValue={product?.technique ?? ""}
            placeholder="Ej: Cera perdida, filigrana..."
          />
        </div>

        {/* Price row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="price">Precio (CLP)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              required
              min={1000}
              defaultValue={product?.price ?? ""}
              placeholder="50000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compareAtPrice">Precio anterior</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              defaultValue={product?.compareAtPrice ?? ""}
              placeholder="Opcional, para mostrar descuento"
            />
          </div>
        </div>

        {/* Unique toggle */}
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isUnique"
              checked={isUnique}
              onChange={(e) => setIsUnique(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-medium text-text">Pieza unica</span>
          </label>

          {!isUnique && (
            <div className="grid grid-cols-1 gap-4 pl-7 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="editionSize">Tamano de edicion</Label>
                <Input
                  id="editionSize"
                  name="editionSize"
                  type="number"
                  min={1}
                  defaultValue={product?.editionSize ?? ""}
                  placeholder="Ej: 10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock disponible</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min={0}
                  defaultValue={product?.stock ?? 1}
                />
              </div>
            </div>
          )}
        </div>

        {/* Custom made toggle */}
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isCustomMade"
              checked={isCustomMade}
              onChange={(e) => setIsCustomMade(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-medium text-text">Pieza personalizada</span>
          </label>

          {isCustomMade && (
            <div className="ml-7 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Las piezas personalizadas no admiten devolucion. Esto se indicara al comprador antes de la compra.
            </div>
          )}
        </div>

        {/* Dimensions and Weight */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dimensions">Dimensiones</Label>
            <Input
              id="dimensions"
              name="dimensions"
              type="text"
              defaultValue={product?.dimensions ?? ""}
              placeholder="Ej: 2cm x 1.5cm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight">Peso (gramos)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              defaultValue={product?.weight ?? ""}
              placeholder="Ej: 12.5"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-1.5">
          {product?.id ? (
            <ImageUpload
              productId={product.id}
              existingImages={product.images}
            />
          ) : (
            <div className="rounded-md border border-border bg-background px-4 py-6 text-center text-sm text-text-secondary">
              Guarda el borrador primero para subir imagenes
            </div>
          )}
        </div>

        {/* Video */}
        <div className="space-y-1.5">
          {product?.id ? (
            <VideoUploader
              productId={product.id}
              videoEnabled={videoEnabled}
              existingVideo={product.video}
            />
          ) : (
            <div className="rounded-md border border-border bg-background px-4 py-6 text-center text-sm text-text-secondary">
              Guarda el borrador primero para subir un video
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            variant="secondary"
            loading={pending}
            disabled={pending}
          >
            Guardar Borrador
          </Button>
          {product && (product.status === "DRAFT" || product.status === "REJECTED") && (
            <Button
              type="button"
              variant="primary"
              loading={submitting}
              disabled={submitting || pending}
              onClick={handleSubmitForReview}
            >
              Enviar a Revision
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
