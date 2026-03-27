"use client";

import { useState } from "react";
import { updatePlan } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MembershipPlan } from "@prisma/client";

const PLAN_LABELS: Record<string, string> = {
  esencial: "Esencial",
  artesano: "Artesano",
  maestro: "Maestro",
};

interface PlanEditorProps {
  plan: MembershipPlan;
}

export function PlanEditor({ plan }: PlanEditorProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setMessage(null);
    const result = await updatePlan(plan.id, formData);
    setSaving(false);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Plan actualizado");
      setEditing(false);
    }
  }

  const label = PLAN_LABELS[plan.name] || plan.name;

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-medium text-text">{label}</h2>
          <p className="text-sm text-text-tertiary">
            {plan.price === 0
              ? "Gratis"
              : `$${plan.price.toLocaleString("es-CL")}/mes`}
            {" · "}Comisión {Math.round(plan.commissionRate * 100)}%
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Cancelar" : "Editar"}
        </Button>
      </div>

      {message && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            message.includes("actualizado")
              ? "bg-green-50 text-green-700"
              : "bg-error/10 text-error"
          }`}
        >
          {message}
        </p>
      )}

      {!editing ? (
        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Precio mensual" value={`$${plan.price.toLocaleString("es-CL")}`} />
          <Stat label="Precio anual" value={plan.annualPrice ? `$${plan.annualPrice.toLocaleString("es-CL")}` : "—"} />
          <Stat label="Comisión" value={`${Math.round(plan.commissionRate * 100)}%`} />
          <Stat label="Max productos" value={plan.maxProducts === 0 ? "Ilimitados" : String(plan.maxProducts)} />
          <Stat label="Max fotos/pieza" value={plan.maxPhotosPerProduct === 0 ? "Ilimitadas" : String(plan.maxPhotosPerProduct)} />
          <Stat label="Video" value={plan.videoEnabled ? "Sí" : "No"} />
          <Stat label="Badge" value={plan.badgeText || "—"} />
          <Stat label="Peso búsqueda" value={`${plan.searchWeight}x`} />
          <Stat label="Frecuencia pago" value={plan.payoutFrequency} />
          <Stat label="Posts/mes" value={String(plan.socialPostsPerMonth)} />
          <Stat label="Soporte" value={plan.supportLevel} />
          <Stat label="Certificado" value={plan.hasCertificate ? "Sí" : "No"} />
          <Stat label="Estadísticas" value={plan.hasAdvancedStats ? "Avanzadas" : plan.hasBasicStats ? "Básicas" : "No"} />
          <Stat label="Destaque home" value={plan.homeHighlight ? "Sí" : "No"} />
        </div>
      ) : (
        <form action={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Precio mensual (CLP)" name="price" type="number" defaultValue={plan.price} />
            <Field label="Precio anual (CLP)" name="annualPrice" type="number" defaultValue={plan.annualPrice ?? ""} />
            <Field label="Comisión (decimal)" name="commissionRate" type="number" step="0.01" defaultValue={plan.commissionRate} />
            <Field label="Max productos (0=ilimitado)" name="maxProducts" type="number" defaultValue={plan.maxProducts} />
            <Field label="Max fotos/pieza (0=ilimitado)" name="maxPhotosPerProduct" type="number" defaultValue={plan.maxPhotosPerProduct} />
            <SelectField label="Video habilitado" name="videoEnabled" value={plan.videoEnabled} options={[["true", "Sí"], ["false", "No"]]} />
            <Field label="Badge texto" name="badgeText" defaultValue={plan.badgeText ?? ""} />
            <Field label="Badge tipo" name="badgeType" defaultValue={plan.badgeType ?? ""} />
            <Field label="Peso búsqueda" name="searchWeight" type="number" step="0.1" defaultValue={plan.searchWeight} />
            <Field label="Frecuencia pago" name="payoutFrequency" defaultValue={plan.payoutFrequency} />
            <Field label="Posts redes/mes" name="socialPostsPerMonth" type="number" defaultValue={plan.socialPostsPerMonth} />
            <Field label="Soporte" name="supportLevel" defaultValue={plan.supportLevel} />
            <SelectField label="Certificado" name="hasCertificate" value={plan.hasCertificate} options={[["true", "Sí"], ["false", "No"]]} />
            <SelectField label="Estadísticas básicas" name="hasBasicStats" value={plan.hasBasicStats} options={[["true", "Sí"], ["false", "No"]]} />
            <SelectField label="Estadísticas avanzadas" name="hasAdvancedStats" value={plan.hasAdvancedStats} options={[["true", "Sí"], ["false", "No"]]} />
            <SelectField label="Destaque home" name="homeHighlight" value={plan.homeHighlight} options={[["true", "Sí"], ["false", "No"]]} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" size="sm" loading={saving}>
              Guardar cambios
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-text-tertiary">{label}: </span>
      <span className="font-medium text-text">{value}</span>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue: string | number;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        className="mt-1"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value: boolean;
  options: [string, string][];
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <select
        name={name}
        defaultValue={String(value)}
        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
      >
        {options.map(([val, lbl]) => (
          <option key={val} value={val}>
            {lbl}
          </option>
        ))}
      </select>
    </div>
  );
}
