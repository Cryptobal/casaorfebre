"use client";

import { useActionState, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/products/image-upload";
import { VideoUploader } from "@/components/products/video-uploader";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { ErrorModal } from "@/components/ui/error-modal";
import { createProduct, updateProduct, saveAndSubmitForReview } from "@/lib/actions/products";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "border-gray-300 bg-gray-50 text-gray-700" },
  PENDING_REVIEW: { label: "Pendiente de revisión", className: "border-amber-300 bg-amber-50 text-amber-800" },
  APPROVED: { label: "Aprobado", className: "border-green-300 bg-green-50 text-green-800" },
  REJECTED: { label: "Rechazado", className: "border-red-300 bg-red-50 text-red-700" },
  PAUSED: { label: "Pausado", className: "border-blue-300 bg-blue-50 text-blue-700" },
};

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
    coleccion: string | null;
    tallas: string[];
    guiaTallas: string | null;
    largoCadenaCm: number | null;
    diametroMm: number | null;
    personalizable: boolean;
    detallePersonalizacion: string | null;
    tiempoElaboracionDias: number | null;
    cantidadEdicion: number | null;
    cuidados: string | null;
    empaque: string | null;
    garantia: string | null;
  };
  artisanId: string;
  specialties?: { id: string; name: string }[];
  occasions?: { id: string; name: string }[];
  videoEnabled?: boolean;
}

export function ProductForm({ product, artisanId, specialties = [], occasions = [], videoEnabled = false }: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const precioFromCalculadora = searchParams.get("precio");
  const isEditing = !!product;

  const [category, setCategory] = useState(product?.category ?? "ANILLO");
  const [materials, setMaterials] = useState<string[]>(product?.materials ?? []);
  const [materialInput, setMaterialInput] = useState("");
  const [isUnique, setIsUnique] = useState(product?.isUnique ?? true);
  const [isCustomMade, setIsCustomMade] = useState(product?.isCustomMade ?? false);
  const [specialtyId, setSpecialtyId] = useState(product?.specialtyId ?? "");
  const [selectedOccasionIds, setSelectedOccasionIds] = useState<string[]>(product?.occasionIds ?? []);
  const [tallas, setTallas] = useState<string[]>(product?.tallas ?? []);
  const [tallaInput, setTallaInput] = useState("");
  const [personalizable, setPersonalizable] = useState(product?.personalizable ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const updateBound = product
    ? updateProduct.bind(null, product.id)
    : null;

  const [state, formAction, pending] = useActionState(
    isEditing ? updateBound! : createProduct,
    null
  );

  // Handle redirect after successful create
  useEffect(() => {
    if (state?.success && "productId" in state && state.productId) {
      router.push(`/portal/orfebre/productos/${state.productId}`);
    }
  }, [state, router]);

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

  const addTalla = useCallback(() => {
    const value = tallaInput.trim();
    if (value && !tallas.includes(value)) {
      setTallas((prev) => [...prev, value]);
    }
    setTallaInput("");
  }, [tallaInput, tallas]);

  const removeTalla = useCallback((t: string) => {
    setTallas((prev) => prev.filter((x) => x !== t));
  }, []);

  const handleTallaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTalla();
      }
    },
    [addTalla]
  );

  const needsTallas = category === "ANILLO";
  const needsLargoCadena = category === "COLLAR" || category === "COLGANTE";
  const needsDiametro = category === "AROS" || category === "PULSERA";

  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleSubmitForReview = async () => {
    if (!product || !formRef.current) return;
    setSubmitting(true);
    const formData = new FormData(formRef.current);
    const result = await saveAndSubmitForReview(product.id, formData);
    setSubmitting(false);
    if (result.error) {
      setErrorModal(result.error);
    } else if (result.success) {
      setShowReviewModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error modal */}
      {errorModal && (
        <ErrorModal
          title="No se pudo enviar a revisión"
          message={errorModal}
          onClose={() => setErrorModal(null)}
        />
      )}

      {/* Review submitted modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-medium text-text">Pieza enviada a revisión</h3>
                <p className="mt-1.5 text-sm text-text-secondary">
                  Nuestro equipo revisará tu pieza para asegurar que cumple con los estándares de Casa Orfebre. Te notificaremos por correo electrónico cuando sea aprobada.
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Este proceso suele tomar entre 24 y 48 horas.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => router.push("/portal/orfebre/productos")}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status badge */}
      {product?.status && (
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${STATUS_CONFIG[product.status]?.className ?? "border-border text-text-secondary"}`}>
          <span className="h-2 w-2 rounded-full bg-current opacity-60" />
          {STATUS_CONFIG[product.status]?.label ?? product.status}
        </div>
      )}

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

      <form ref={formRef} action={formAction} className="space-y-6">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="price">Precio (CLP)</Label>
              <a
                href="/portal/orfebre/herramientas/calculadora"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline"
              >
                ¿No sabes qué precio poner? Usa la calculadora →
              </a>
            </div>
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              required
              defaultValue={precioFromCalculadora || product?.price || ""}
              placeholder="50000"
              onKeyDown={(e) => {
                if (e.key === "." || e.key === ",") e.preventDefault();
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/[.,]/.test(text)) {
                  e.preventDefault();
                  const clean = text.replace(/[.,]/g, "");
                  const input = e.currentTarget;
                  document.execCommand("insertText", false, clean);
                }
              }}
            />
            <p className="text-[11px] text-text-secondary/70">Solo números, sin punto ni coma</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compareAtPrice">Precio anterior</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              defaultValue={product?.compareAtPrice ?? ""}
              placeholder="Opcional, para mostrar descuento"
              onKeyDown={(e) => {
                if (e.key === "." || e.key === ",") e.preventDefault();
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                if (/[.,]/.test(text)) {
                  e.preventDefault();
                  const clean = text.replace(/[.,]/g, "");
                  document.execCommand("insertText", false, clean);
                }
              }}
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
            <p className="text-[11px] text-text-secondary/70">Usa punto como separador decimal (ej: 12.5)</p>
          </div>
        </div>

        {/* ── Measurements by category ── */}
        {needsTallas && (
          <div className="space-y-1.5 rounded-md border border-accent/20 bg-accent/5 p-4">
            <Label>Tallas disponibles <span className="text-red-500">*</span></Label>
            <p className="text-xs text-text-secondary">Obligatorio para anillos. Agrega las tallas disponibles.</p>
            <input type="hidden" name="tallas" value={tallas.join(",")} />
            <div className="flex gap-2">
              <Input
                type="text"
                value={tallaInput}
                onChange={(e) => setTallaInput(e.target.value)}
                onKeyDown={handleTallaKeyDown}
                placeholder="Ej: 5, 6, 7..."
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTalla}>
                Agregar
              </Button>
            </div>
            {tallas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tallas.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                  >
                    {t}
                    <button type="button" onClick={() => removeTalla(t)} className="ml-0.5 text-accent/60 hover:text-accent" aria-label={`Eliminar talla ${t}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="guiaTallas">Guía de tallas</Label>
              <Input id="guiaTallas" name="guiaTallas" type="text" defaultValue={product?.guiaTallas ?? ""} placeholder="Link o instrucciones de tallas" />
            </div>
          </div>
        )}

        {needsLargoCadena && (
          <div className="space-y-1.5 rounded-md border border-accent/20 bg-accent/5 p-4">
            <Label htmlFor="largoCadenaCm">Largo de cadena (cm) <span className="text-red-500">*</span></Label>
            <p className="text-xs text-text-secondary">Obligatorio para collares y colgantes.</p>
            <Input id="largoCadenaCm" name="largoCadenaCm" type="number" step="0.1" defaultValue={product?.largoCadenaCm ?? ""} placeholder="Ej: 45" />
          </div>
        )}

        {needsDiametro && (
          <div className="space-y-1.5 rounded-md border border-accent/20 bg-accent/5 p-4">
            <Label htmlFor="diametroMm">Diámetro / largo (mm) <span className="text-red-500">*</span></Label>
            <p className="text-xs text-text-secondary">Obligatorio para {category === "AROS" ? "aros" : "pulseras"}.</p>
            <Input id="diametroMm" name="diametroMm" type="number" step="0.1" defaultValue={product?.diametroMm ?? ""} placeholder="Ej: 25" />
          </div>
        )}

        {/* ── Additional detail fields ── */}
        <div className="space-y-1.5">
          <Label htmlFor="coleccion">Colección</Label>
          <Input id="coleccion" name="coleccion" type="text" defaultValue={product?.coleccion ?? ""} placeholder='Ej: "Raíces", "Luna Austral"' />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="personalizable"
              checked={personalizable}
              onChange={(e) => setPersonalizable(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-medium text-text">Personalizable (acepta grabado o modificación)</span>
          </label>
          {personalizable && (
            <div className="space-y-1.5 pl-7">
              <Label htmlFor="detallePersonalizacion">Detalle de personalización</Label>
              <textarea
                id="detallePersonalizacion"
                name="detallePersonalizacion"
                defaultValue={product?.detallePersonalizacion ?? ""}
                rows={2}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                placeholder="Qué se puede personalizar..."
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tiempoElaboracionDias">Tiempo de elaboración (días)</Label>
          <Input id="tiempoElaboracionDias" name="tiempoElaboracionDias" type="number" min={1} defaultValue={product?.tiempoElaboracionDias ?? ""} placeholder="Ej: 7" />
        </div>

        {!isUnique && (
          <div className="space-y-1.5">
            <Label htmlFor="cantidadEdicion">Cantidad de edición</Label>
            <p className="text-xs text-text-secondary">Ej: "5 de 20" — el total de la edición</p>
            <Input id="cantidadEdicion" name="cantidadEdicion" type="number" min={1} defaultValue={product?.cantidadEdicion ?? ""} placeholder="Ej: 20" />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="cuidados">Cuidados</Label>
          <textarea
            id="cuidados"
            name="cuidados"
            defaultValue={product?.cuidados ?? ""}
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            placeholder="Instrucciones de cuidado de la pieza..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="empaque">Empaque</Label>
            <Input id="empaque" name="empaque" type="text" defaultValue={product?.empaque ?? ""} placeholder="Descripción del empaque" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="garantia">Garantía</Label>
            <Input id="garantia" name="garantia" type="text" defaultValue={product?.garantia ?? ""} placeholder="Política de garantía" />
          </div>
        </div>

        {/* Measurement validation warning */}
        {needsTallas && tallas.length === 0 && (
          <p className="text-sm text-amber-600">⚠ Debes agregar al menos una talla para poder enviar a revisión.</p>
        )}

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
