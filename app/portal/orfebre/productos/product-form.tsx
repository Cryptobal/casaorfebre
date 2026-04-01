"use client";

import { useActionState, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/products/image-upload";
import { VideoUploader } from "@/components/products/video-uploader";
import { ErrorModal } from "@/components/ui/error-modal";
import { createProduct, updateProduct, saveAndSubmitForReview, reactivateProduct } from "@/lib/actions/products";
import { PresetSelector } from "@/components/forms/preset-selector";
import { TagInput } from "@/components/forms/tag-input";
import { CARE_PRESETS, PACKAGING_PRESETS, WARRANTY_PRESETS } from "@/lib/constants";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "border-gray-300 bg-gray-50 text-gray-700" },
  PENDING_REVIEW: { label: "Pendiente de revisión", className: "border-amber-300 bg-amber-50 text-amber-800" },
  APPROVED: { label: "Aprobado", className: "border-green-300 bg-green-50 text-green-800" },
  REJECTED: { label: "Rechazado", className: "border-red-300 bg-red-50 text-red-700" },
  PAUSED: { label: "Pausado", className: "border-blue-300 bg-blue-50 text-blue-700" },
  SOLD_OUT: { label: "Agotado", className: "border-zinc-300 bg-zinc-50 text-zinc-600" },
};

const RING_SIZES = [
  "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
  "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5",
  "12", "12.5", "13",
];

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description: string;
    story: string | null;
    categoryIds: string[];
    materialIds: string[];
    technique: string | null;
    price: number;
    compareAtPrice: number | null;
    productionType: string;
    isCustomizable: boolean;
    elaborationDays: number | null;
    stock: number;
    dimensions: string | null;
    weight: number | null;
    status: string;
    adminNotes: string | null;
    images: { id: string; url: string; altText: string | null; position: number }[];
    video?: { cloudflareStreamUid: string; status: string; muted: boolean } | null;
    specialtyIds: string[];
    occasionIds: string[];
    variants: { size: string; stock: number }[];
    collectionId: string | null;
    tallas: string[];
    tallaUnica: string | null;
    tallaAjusteArriba: number | null;
    tallaAjusteAbajo: number | null;
    guiaTallas: string | null;
    largoCadenaCm: number | null;
    tieneCadena: boolean | null;
    espesorCadenaMm: number | null;
    diametroMm: number | null;
    audiencia: string;
    pendantWidth: number | null;
    pendantHeight: number | null;
    earringWidth: number | null;
    earringDrop: number | null;
    broochWidth: number | null;
    broochHeight: number | null;
    piercingGauge: string | null;
    piercingBarLength: number | null;
    stones: { id: string; stoneType: string; stoneCarat: number | null; stoneColor: string | null; stoneCut: string | null; stoneOrigin: string | null; stoneClarity: string | null; quantity: number }[];
    personalizable: boolean;
    detallePersonalizacion: string | null;
    tiempoElaboracionDias: number | null;
    cantidadEdicion: number | null;
    cuidados: string | null;
    empaque: string | null;
    garantia: string | null;
  };
  artisanId: string;
  categories?: { id: string; name: string; slug: string }[];
  materials?: { id: string; name: string }[];
  specialties?: { id: string; name: string }[];
  occasions?: { id: string; name: string }[];
  collections?: { id: string; name: string }[];
  videoEnabled?: boolean;
}

export function ProductForm({ product, artisanId, categories = [], materials = [], specialties = [], occasions = [], collections = [], videoEnabled = false }: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const precioFromCalculadora = searchParams.get("precio");
  const isEditing = !!product;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.categoryIds?.[0] ?? "");
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>(product?.materialIds ?? []);
  const [productionType, setProductionType] = useState(product?.productionType ?? "UNIQUE");
  const [isCustomizable, setIsCustomizable] = useState(product?.isCustomizable ?? false);
  const [elaborationDays, setElaborationDays] = useState<string>(
    product?.elaborationDays?.toString() ?? ""
  );
  const [variants, setVariants] = useState<{ size: string; stock: number }[]>(
    product?.variants ?? []
  );
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(product?.specialtyIds ?? []);
  const [selectedOccasionIds, setSelectedOccasionIds] = useState<string[]>(product?.occasionIds ?? []);
  const [tallas, setTallas] = useState<string[]>(product?.tallas ?? []);
  const [tallaInput, setTallaInput] = useState("");
  const [tallaUnica, setTallaUnica] = useState(product?.tallaUnica ?? "");
  const [tallaAjusteArriba, setTallaAjusteArriba] = useState(product?.tallaAjusteArriba?.toString() ?? "0");
  const [tallaAjusteAbajo, setTallaAjusteAbajo] = useState(product?.tallaAjusteAbajo?.toString() ?? "0");
  const [tieneCadena, setTieneCadena] = useState<boolean>(product?.tieneCadena ?? false);
  const [reactivating, setReactivating] = useState(false);
  const [personalizable, setPersonalizable] = useState(product?.personalizable ?? false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(product?.collectionId ?? "");
  const [localCollections, setLocalCollections] = useState(collections);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedAudiencia, setSelectedAudiencia] = useState(
    product?.audiencia ?? "SIN_ESPECIFICAR"
  );
  const [stones, setStones] = useState<Array<{
    id?: string;
    stoneType: string;
    stoneCarat: string;
    stoneColor: string;
    stoneCut: string;
    stoneOrigin: string;
    stoneClarity: string;
    quantity: string;
  }>>(
    product?.stones?.map((s) => ({
      id: s.id,
      stoneType: s.stoneType,
      stoneCarat: s.stoneCarat?.toString() ?? "",
      stoneColor: s.stoneColor ?? "",
      stoneCut: s.stoneCut ?? "",
      stoneOrigin: s.stoneOrigin ?? "",
      stoneClarity: s.stoneClarity ?? "",
      quantity: s.quantity?.toString() ?? "1",
    })) ?? []
  );
  const [showStones, setShowStones] = useState(!!product?.stones?.length);

  // Custom technique tags (stored in technique field)
  const [customTechniques, setCustomTechniques] = useState<string[]>(
    () => (product?.technique ?? "").split(/[,\n]/).map((t) => t.trim()).filter(Boolean)
  );

  // Preset selector state for cuidados, empaque, garantia
  const parsePresets = (value: string | null | undefined, presets: readonly string[]): { selected: string[]; customTags: string[] } => {
    if (!value) return { selected: [], customTags: [] };
    const lines = value.split("\n").map((l) => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
    const selected: string[] = [];
    const customTags: string[] = [];
    for (const line of lines) {
      if ((presets as readonly string[]).includes(line)) {
        selected.push(line);
      } else {
        customTags.push(line);
      }
    }
    return { selected, customTags };
  };

  const combinePresets = (selected: string[], customTags: string[]): string => {
    return [...selected, ...customTags].join("\n");
  };

  const [cuidadosSelected, setCuidadosSelected] = useState<string[]>(
    () => parsePresets(product?.cuidados, CARE_PRESETS).selected
  );
  const [cuidadosCustom, setCuidadosCustom] = useState<string[]>(
    () => parsePresets(product?.cuidados, CARE_PRESETS).customTags
  );
  const [empaqueSelected, setEmpaqueSelected] = useState<string[]>(
    () => parsePresets(product?.empaque, PACKAGING_PRESETS).selected
  );
  const [empaqueCustom, setEmpaqueCustom] = useState<string[]>(
    () => parsePresets(product?.empaque, PACKAGING_PRESETS).customTags
  );
  const [garantiaSelected, setGarantiaSelected] = useState<string[]>(
    () => parsePresets(product?.garantia, WARRANTY_PRESETS).selected
  );
  const [garantiaCustom, setGarantiaCustom] = useState<string[]>(
    () => parsePresets(product?.garantia, WARRANTY_PRESETS).customTags
  );

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

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedCategorySlugs = selectedCategory ? [selectedCategory.slug] : [];
  const needsTallas = selectedCategorySlugs.includes("anillo");
  const isColgante = selectedCategorySlugs.includes("colgante");
  const needsLargoCadena = selectedCategorySlugs.includes("collar") || selectedCategorySlugs.includes("cadena") || (isColgante && tieneCadena);
  const showCadenaToggle = isColgante;
  const needsDiametro = selectedCategorySlugs.includes("aros") || selectedCategorySlugs.includes("pulsera");

  const handleCreateInlineCollection = useCallback(async () => {
    if (!newCollectionName.trim() || creatingCollection) return;
    setCreatingCollection(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });
      const data = await res.json();
      if (data.id) {
        setLocalCollections((prev) => [...prev, { id: data.id, name: data.name }]);
        setSelectedCollectionId(data.id);
        setNewCollectionName("");
        setShowNewCollectionForm(false);
      }
    } finally {
      setCreatingCollection(false);
    }
  }, [newCollectionName, creatingCollection]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [originalityDeclared, setOriginalityDeclared] = useState(false);

  const handleSubmitForReview = async () => {
    if (!product || !formRef.current) return;
    if (!originalityDeclared) {
      setErrorModal("Debes marcar la declaración de originalidad para enviar a revisión.");
      return;
    }
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

        {/* Category — single select */}
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <input type="hidden" name="categoryIds" value={selectedCategoryId} />
          <p className="text-xs text-text-secondary">
            Selecciona la categoría de tu pieza
          </p>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((c) => {
                const isSelected = selectedCategoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(isSelected ? "" : c.id)}
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
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Audiencia / Público objetivo */}
        <div className="space-y-2">
          <Label>Público objetivo</Label>
          <p className="text-xs text-text-secondary">¿Para quién está diseñada esta pieza?</p>
          <input type="hidden" name="audiencia" value={selectedAudiencia} />
          <div className="flex flex-wrap gap-2">
            {[
              { value: "MUJER", label: "Mujer" },
              { value: "HOMBRE", label: "Hombre" },
              { value: "UNISEX", label: "Unisex" },
              { value: "NINOS", label: "Niños" },
              { value: "SIN_ESPECIFICAR", label: "Sin especificar" },
            ].map((opt) => {
              const isSelected = selectedAudiencia === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedAudiencia(opt.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-text-secondary hover:border-text-tertiary"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specialties + custom techniques */}
        <div className="space-y-1.5">
          <Label>Especialidades / Técnicas</Label>
          <input type="hidden" name="specialtyIds" value={selectedSpecialtyIds.join(",")} />
          <input type="hidden" name="technique" value={customTechniques.join("\n")} />
          <p className="text-xs text-text-secondary">
            Selecciona las técnicas utilizadas en esta pieza
          </p>
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {specialties.map((s) => {
                const isSelected = selectedSpecialtyIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setSelectedSpecialtyIds((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== s.id)
                          : [...prev, s.id]
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
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}
          <TagInput
            tags={customTechniques}
            onTagsChange={setCustomTechniques}
            placeholder="Agregar otra técnica..."
            label="¿Usas otra técnica? Escríbela y presiona Enter"
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

        {/* Materials — badge selector */}
        <div className="space-y-1.5">
          <Label>Materiales</Label>
          <input type="hidden" name="materialIds" value={selectedMaterialIds.join(",")} />
          <p className="text-xs text-text-secondary">
            Selecciona los materiales utilizados en esta pieza
          </p>
          {materials.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {materials.map((m) => {
                const isSelected = selectedMaterialIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setSelectedMaterialIds((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== m.id)
                          : [...prev, m.id]
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
                    {m.name}
                  </button>
                );
              })}
            </div>
          )}
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
            <Label htmlFor="compareAtPrice">Precio anterior (opcional)</Label>
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
            <p className="text-xs text-text-secondary">
              Si el precio anterior es mayor al precio actual, se mostrará tachado junto al precio indicando descuento.
            </p>
          </div>
        </div>

        {/* Production type */}
        <div className="space-y-3">
          <Label>Tipo de producción</Label>
          <input type="hidden" name="productionType" value={productionType} />
          <input type="hidden" name="variants" value={JSON.stringify(variants)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {([
              {
                value: "UNIQUE",
                title: "Pieza única",
                desc: "Solo existe una unidad. Al venderse, desaparece.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12l4 6-10 13L2 9z" />
                    <path d="M11 3l1 6h6" />
                    <path d="M7 9l5-6" />
                    <path d="M2 9h20" />
                  </svg>
                ),
              },
              {
                value: "MADE_TO_ORDER",
                title: "Hecha por encargo",
                desc: "Se fabrica después de la compra. No admite devolución.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                ),
              },
              {
                value: "LIMITED",
                title: "Producción limitada",
                desc: "Tienes varias unidades disponibles.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                ),
              },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setProductionType(opt.value)}
                className={`flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors ${
                  productionType === opt.value
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    productionType === opt.value ? "border-accent" : "border-border"
                  }`}>
                    {productionType === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <span className={productionType === opt.value ? "text-accent" : "text-text-tertiary"}>
                    {opt.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{opt.title}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* MADE_TO_ORDER: elaboration days */}
          {productionType === "MADE_TO_ORDER" && (
            <div className="space-y-3 pl-1">
              <div className="space-y-1.5">
                <Label htmlFor="elaborationDays">Tiempo estimado de elaboración (días) <span className="text-red-500">*</span></Label>
                <Input
                  id="elaborationDays"
                  name="elaborationDays"
                  type="number"
                  min={1}
                  required
                  value={elaborationDays}
                  onChange={(e) => setElaborationDays(e.target.value)}
                  placeholder="Ej: 7"
                />
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Las piezas hechas por encargo no admiten devolución. Esto se indicará al comprador antes de la compra.
              </div>
            </div>
          )}

          {/* LIMITED: stock by size or global */}
          {productionType === "LIMITED" && (
            <div className="space-y-3 pl-1">
              {needsTallas ? (
                <div className="space-y-3">
                  <Label>Stock por talla</Label>
                  <p className="text-xs text-text-secondary">Haz clic en las tallas disponibles e indica la cantidad de cada una.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {RING_SIZES.map((size) => {
                      const isSelected = variants.some((v) => v.size === size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setVariants((prev) => prev.filter((v) => v.size !== size));
                            } else {
                              setVariants((prev) => [...prev, { size, stock: 1 }]);
                            }
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-accent text-white"
                              : "border border-border text-text-secondary hover:border-accent/50"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {variants.length > 0 && (
                    <div className="space-y-2 rounded-md border border-border p-3">
                      {variants
                        .sort((a, b) => parseFloat(a.size) - parseFloat(b.size))
                        .map((v) => (
                        <div key={v.size} className="flex items-center gap-3">
                          <span className="w-12 text-sm font-medium text-text">Talla {v.size}</span>
                          <Input
                            type="number"
                            min={0}
                            value={v.stock}
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value, 10) || 0;
                              setVariants((prev) =>
                                prev.map((x) => x.size === v.size ? { ...x, stock: newStock } : x)
                              );
                            }}
                            className="w-20"
                          />
                          <span className="text-xs text-text-tertiary">unidades</span>
                          <button
                            type="button"
                            onClick={() => setVariants((prev) => prev.filter((x) => x.size !== v.size))}
                            className="ml-auto text-text-tertiary hover:text-text"
                            aria-label={`Eliminar talla ${v.size}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                      ))}
                      <p className="pt-1 text-xs font-medium text-accent">
                        Stock total: {variants.reduce((sum, v) => sum + v.stock, 0)} unidades
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Stock disponible</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min={1}
                    defaultValue={product?.stock ?? 1}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customizable toggle */}
        <div className="space-y-3">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="isCustomizable"
              checked={isCustomizable}
              onChange={(e) => setIsCustomizable(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <div>
              <span className="text-sm font-medium text-text">Personalizable</span>
              <p className="text-xs text-text-secondary">
                El comprador puede solicitar modificaciones como grabado personalizado, cambio de tamaño u otros ajustes.
              </p>
            </div>
          </label>
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

        {/* ── Ring sizing by category ── */}
        {needsTallas && productionType !== "LIMITED" && (
          <div className="space-y-3 rounded-md border border-accent/20 bg-accent/5 p-4">
            <div>
              <Label>Talla disponible <span className="text-red-500">*</span></Label>
              <p className="text-xs text-text-secondary">Selecciona la talla de este anillo.</p>
            </div>
            <input type="hidden" name="tallaUnica" value={tallaUnica} />
            <input type="hidden" name="tallas" value={tallaUnica || ""} />
            <div className="flex flex-wrap gap-1.5">
              {RING_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTallaUnica(tallaUnica === size ? "" : size)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    tallaUnica === size
                      ? "bg-accent text-white"
                      : "border border-border text-text-secondary hover:border-accent/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <Label>¿Se puede ajustar la talla?</Label>
              <p className="text-xs text-text-secondary">Indica cuántas tallas se puede agrandar o achicar este anillo.</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-tertiary">Achicar</span>
                  <Input
                    name="tallaAjusteAbajo"
                    type="number"
                    min={0}
                    max={4}
                    value={tallaAjusteAbajo}
                    onChange={(e) => setTallaAjusteAbajo(e.target.value)}
                    className="w-16 text-center"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-tertiary">Agrandar</span>
                  <Input
                    name="tallaAjusteArriba"
                    type="number"
                    min={0}
                    max={4}
                    value={tallaAjusteArriba}
                    onChange={(e) => setTallaAjusteArriba(e.target.value)}
                    className="w-16 text-center"
                  />
                </div>
                <span className="text-xs text-text-tertiary">tallas</span>
              </div>
              {tallaUnica && (parseInt(tallaAjusteAbajo) > 0 || parseInt(tallaAjusteArriba) > 0) && (
                <p className="text-xs text-accent">
                  Rango disponible: talla {Math.max(parseFloat(tallaUnica) - parseInt(tallaAjusteAbajo), 1)} a {parseFloat(tallaUnica) + parseInt(tallaAjusteArriba)}
                </p>
              )}
            </div>
          </div>
        )}
        {needsTallas && productionType === "LIMITED" && (
          <div className="space-y-1.5 rounded-md border border-accent/20 bg-accent/5 p-4">
            <Label>Tallas disponibles <span className="text-red-500">*</span></Label>
            <p className="text-xs text-text-secondary">Para producción limitada, agrega las tallas disponibles. El stock por talla se gestiona arriba.</p>
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

        {showCadenaToggle && (
          <div className="space-y-3 rounded-md border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>¿El colgante incluye cadena?</Label>
                <p className="text-xs text-text-secondary">Indica si el colgante se vende con cadena.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={tieneCadena}
                onClick={() => setTieneCadena(!tieneCadena)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  tieneCadena ? "bg-accent" : "bg-gray-300"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${tieneCadena ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <input type="hidden" name="tieneCadena" value={tieneCadena ? "on" : ""} />
          </div>
        )}

        {needsLargoCadena && (
          <div className="space-y-3 rounded-md border border-accent/20 bg-accent/5 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="largoCadenaCm">Largo de cadena (cm) <span className="text-red-500">*</span></Label>
              <p className="text-xs text-text-secondary">Obligatorio para collares y cadenas.</p>
              <Input id="largoCadenaCm" name="largoCadenaCm" type="number" step="0.1" defaultValue={product?.largoCadenaCm ?? ""} placeholder="Ej: 45" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="espesorCadenaMm">Espesor de cadena (mm) <span className="text-xs font-normal text-text-tertiary">(opcional)</span></Label>
              <Input id="espesorCadenaMm" name="espesorCadenaMm" type="number" step="0.1" defaultValue={product?.espesorCadenaMm ?? ""} placeholder="Ej: 1.5" />
            </div>
          </div>
        )}

        {needsDiametro && (
          <div className="space-y-1.5 rounded-md border border-accent/20 bg-accent/5 p-4">
            <Label htmlFor="diametroMm">Diámetro / largo (mm) <span className="text-red-500">*</span></Label>
            <p className="text-xs text-text-secondary">Obligatorio para {selectedCategorySlugs.includes("aros") ? "aros" : "pulseras"}.</p>
            <Input id="diametroMm" name="diametroMm" type="number" step="0.1" defaultValue={product?.diametroMm ?? ""} placeholder="Ej: 25" />
          </div>
        )}

        {/* ── Medidas específicas por tipo de joya ── */}
        {(selectedCategory?.slug === "colgante" || selectedCategory?.slug === "collar") && (
          <div className="space-y-4 rounded-lg border border-border bg-surface/30 p-4">
            <h3 className="text-sm font-medium text-text">
              {selectedCategory.slug === "colgante" ? "Medidas del colgante" : "Medidas del dije (si tiene)"}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pendantWidth">Ancho del {selectedCategory.slug === "colgante" ? "colgante" : "dije"} (mm)</Label>
                <Input id="pendantWidth" name="pendantWidth" type="number" step="0.1"
                  defaultValue={product?.pendantWidth ?? ""} placeholder="Ej: 18" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pendantHeight">Alto del {selectedCategory.slug === "colgante" ? "colgante" : "dije"} (mm)</Label>
                <Input id="pendantHeight" name="pendantHeight" type="number" step="0.1"
                  defaultValue={product?.pendantHeight ?? ""} placeholder="Ej: 25" />
              </div>
            </div>
          </div>
        )}

        {selectedCategory?.slug === "aros" && (
          <div className="space-y-4 rounded-lg border border-border bg-surface/30 p-4">
            <h3 className="text-sm font-medium text-text">Medidas de los aros</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="earringWidth">Ancho (mm)</Label>
                <Input id="earringWidth" name="earringWidth" type="number" step="0.1"
                  defaultValue={product?.earringWidth ?? ""} placeholder="Ej: 22" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="earringDrop">Largo de caída (mm)</Label>
                <Input id="earringDrop" name="earringDrop" type="number" step="0.1"
                  defaultValue={product?.earringDrop ?? ""} placeholder="Ej: 35" />
                <p className="text-xs text-text-tertiary">Distancia desde el lóbulo hacia abajo</p>
              </div>
            </div>
          </div>
        )}

        {(selectedCategory?.slug === "broche" || selectedCategory?.slug === "diadema-tiara" || selectedCategory?.slug === "gemelos") && (
          <div className="space-y-4 rounded-lg border border-border bg-surface/30 p-4">
            <h3 className="text-sm font-medium text-text">
              Medidas {selectedCategory.slug === "broche" ? "del broche" : selectedCategory.slug === "diadema-tiara" ? "de la diadema" : "de los gemelos"}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="broochWidth">Ancho (mm)</Label>
                <Input id="broochWidth" name="broochWidth" type="number" step="0.1"
                  defaultValue={product?.broochWidth ?? ""} placeholder="Ej: 40" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="broochHeight">Alto (mm)</Label>
                <Input id="broochHeight" name="broochHeight" type="number" step="0.1"
                  defaultValue={product?.broochHeight ?? ""} placeholder="Ej: 30" />
              </div>
            </div>
          </div>
        )}

        {/* ── Piedras preciosas ── */}
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showStones}
              onChange={(e) => {
                setShowStones(e.target.checked);
                if (!e.target.checked) setStones([]);
              }}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-medium text-text">Esta pieza incluye piedra(s)</span>
          </label>

          {showStones && (
            <div className="ml-7 space-y-4">
              {stones.map((stone, index) => (
                <div key={index} className="relative rounded-lg border border-border p-4">
                  <button
                    type="button"
                    onClick={() => setStones(stones.filter((_, i) => i !== index))}
                    className="absolute right-2 top-2 text-text-tertiary hover:text-red-500"
                    title="Eliminar piedra"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                  <div className="mb-2 text-xs font-medium text-text-tertiary">
                    Piedra {index + 1}{index === 0 ? " (principal)" : ""}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label>Tipo de piedra *</Label>
                      <Input
                        value={stone.stoneType}
                        onChange={(e) => {
                          const updated = [...stones];
                          updated[index] = { ...updated[index], stoneType: e.target.value };
                          setStones(updated);
                        }}
                        placeholder="Ej: Lapislázuli"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Quilates (ct)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={stone.stoneCarat}
                        onChange={(e) => {
                          const updated = [...stones];
                          updated[index] = { ...updated[index], stoneCarat: e.target.value };
                          setStones(updated);
                        }}
                        placeholder="Ej: 0.50"
                      />
                      <p className="text-xs text-text-tertiary">1 quilate = 0.2 gramos</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={stone.quantity}
                        onChange={(e) => {
                          const updated = [...stones];
                          updated[index] = { ...updated[index], quantity: e.target.value };
                          setStones(updated);
                        }}
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Color</Label>
                      <Input
                        value={stone.stoneColor}
                        onChange={(e) => {
                          const updated = [...stones];
                          updated[index] = { ...updated[index], stoneColor: e.target.value };
                          setStones(updated);
                        }}
                        placeholder="Ej: azul intenso"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Corte / Talla</Label>
                      <select
                        value={stone.stoneCut}
                        onChange={(e) => {
                          const updated = [...stones];
                          updated[index] = { ...updated[index], stoneCut: e.target.value };
                          setStones(updated);
                        }}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Seleccionar</option>
                        <option value="cabujon">Cabujón</option>
                        <option value="facetado">Facetado</option>
                        <option value="briolette">Briolette</option>
                        <option value="rosa">Rosa</option>
                        <option value="bruta">Bruta / Sin tallar</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Origen</Label>
                      <select
                        value={stone.stoneOrigin}
                        onChange={(e) => {
                          const updated = [...stones];
                          updated[index] = { ...updated[index], stoneOrigin: e.target.value };
                          setStones(updated);
                        }}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Seleccionar</option>
                        <option value="natural">Natural</option>
                        <option value="laboratorio">Laboratorio</option>
                        <option value="sintetica">Sintética</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Claridad</Label>
                      <select
                        value={stone.stoneClarity}
                        onChange={(e) => {
                          const updated = [...stones];
                          updated[index] = { ...updated[index], stoneClarity: e.target.value };
                          setStones(updated);
                        }}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Seleccionar</option>
                        <option value="transparente">Transparente</option>
                        <option value="translucida">Translúcida</option>
                        <option value="opaca">Opaca</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setStones([
                    ...stones,
                    {
                      stoneType: "",
                      stoneCarat: "",
                      stoneColor: "",
                      stoneCut: "",
                      stoneOrigin: "",
                      stoneClarity: "",
                      quantity: "1",
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                Agregar piedra
              </button>

              <input type="hidden" name="stonesJson" value={JSON.stringify(stones)} />
            </div>
          )}
        </div>

        {/* ── Collection selector ── */}
        <div className="space-y-1.5">
          <Label>Coleccion (opcional)</Label>
          <input type="hidden" name="collectionId" value={selectedCollectionId} />
          {localCollections.length === 0 && !selectedCollectionId ? (
            <p className="text-sm text-text-tertiary">Aún no tienes colecciones.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCollectionId("")}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition ${
                  !selectedCollectionId
                    ? "bg-accent/10 border-accent text-accent"
                    : "border-border text-text-secondary hover:border-accent/50"
                }`}
              >
                {!selectedCollectionId && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                Sin colección
              </button>
              {localCollections.map((c) => {
                const isSelected = selectedCollectionId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCollectionId(isSelected ? "" : c.id)}
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
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
          {!showNewCollectionForm ? (
            <button
              type="button"
              onClick={() => setShowNewCollectionForm(true)}
              className="text-xs font-medium text-accent hover:underline"
            >
              + Crear nueva coleccion
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-border bg-background p-2">
              <Input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Nombre de la coleccion"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateInlineCollection();
                  }
                }}
              />
              <button
                type="button"
                disabled={creatingCollection || !newCollectionName.trim()}
                onClick={handleCreateInlineCollection}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                {creatingCollection ? "..." : "Crear"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCollectionForm(false);
                  setNewCollectionName("");
                }}
                className="text-text-tertiary hover:text-text"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          )}
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

        {productionType === "LIMITED" && (
          <div className="space-y-1.5">
            <Label htmlFor="cantidadEdicion">Cantidad de edición</Label>
            <p className="text-xs text-text-secondary">Ej: &quot;5 de 20&quot; — el total de la edición</p>
            <Input id="cantidadEdicion" name="cantidadEdicion" type="number" min={1} defaultValue={product?.cantidadEdicion ?? ""} placeholder="Ej: 20" />
          </div>
        )}

        <PresetSelector
          label="Cuidados de la pieza"
          presets={CARE_PRESETS}
          selected={cuidadosSelected}
          onSelectedChange={setCuidadosSelected}
          customTags={cuidadosCustom}
          onCustomTagsChange={setCuidadosCustom}
          customPlaceholder="Agregar indicación de cuidado..."
        />
        <input type="hidden" name="cuidados" value={combinePresets(cuidadosSelected, cuidadosCustom)} />

        <PresetSelector
          label="Empaque"
          presets={PACKAGING_PRESETS}
          selected={empaqueSelected}
          onSelectedChange={setEmpaqueSelected}
          customTags={empaqueCustom}
          onCustomTagsChange={setEmpaqueCustom}
          customPlaceholder="Agregar detalle de empaque..."
        />
        <input type="hidden" name="empaque" value={combinePresets(empaqueSelected, empaqueCustom)} />

        <PresetSelector
          label="Garantía"
          presets={WARRANTY_PRESETS}
          selected={garantiaSelected}
          onSelectedChange={setGarantiaSelected}
          customTags={garantiaCustom}
          onCustomTagsChange={setGarantiaCustom}
          customPlaceholder="Agregar detalle de garantía..."
        />
        <input type="hidden" name="garantia" value={combinePresets(garantiaSelected, garantiaCustom)} />

        {/* Measurement validation warning */}
        {needsTallas && tallas.length === 0 && !tallaUnica && (
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

        {/* Declaración de originalidad */}
        <input type="hidden" name="originalityDeclared" value={originalityDeclared ? "true" : "false"} />
        {product && product.status !== "PENDING_REVIEW" && product.status !== "PAUSED" && product.status !== "SOLD_OUT" && (
          <div className="rounded-md border border-border bg-background px-4 py-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={originalityDeclared}
                onChange={(e) => setOriginalityDeclared(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-xs font-light text-text-tertiary leading-relaxed">
                Declaro que esta pieza es de mi propia autoría o taller, que los
                materiales declarados son veraces, y que las fotografías
                corresponden al producto real que recibirá el comprador.
              </span>
            </label>
          </div>
        )}

        {/* Action buttons */}
        <div className="border-t border-border pt-6">
          {product?.status === "SOLD_OUT" ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-text-secondary">
                Esta pieza está agotada. Puedes reactivarla para volver a publicarla.
              </p>
              <Button
                type="button"
                variant="primary"
                loading={reactivating}
                disabled={reactivating}
                onClick={async () => {
                  setReactivating(true);
                  const stock = productionType === "UNIQUE" ? 1 : parseInt(prompt("¿Cuántas unidades tienes disponibles?") || "0", 10);
                  if (stock < 1) { setReactivating(false); return; }
                  const result = await reactivateProduct(product.id, stock);
                  if (result.error) {
                    setErrorModal(result.error);
                  } else {
                    router.refresh();
                  }
                  setReactivating(false);
                }}
              >
                Reactivar publicación
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end sm:items-start">
              <div className="flex flex-col items-center gap-1 sm:items-end">
                <Button
                  type="submit"
                  variant="secondary"
                  loading={pending}
                  disabled={pending}
                >
                  Guardar borrador
                </Button>
                <p className="text-[11px] text-text-tertiary">
                  Guarda los cambios sin publicar. Puedes seguir editando después.
                </p>
              </div>
              {product && product.status !== "PENDING_REVIEW" && product.status !== "PAUSED" && (
                <div className="flex flex-col items-center gap-1 sm:items-end">
                  <Button
                    type="button"
                    variant="primary"
                    loading={submitting}
                    disabled={submitting || pending}
                    onClick={handleSubmitForReview}
                  >
                    Enviar a revisión
                  </Button>
                  <p className="text-[11px] text-text-tertiary">
                    {product.status === "APPROVED"
                      ? "Guarda los cambios y envía a revisión. Tu pieza no estará visible hasta que sea aprobada."
                      : "Envía tu pieza al equipo de Casa Orfebre para aprobación y publicación."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
