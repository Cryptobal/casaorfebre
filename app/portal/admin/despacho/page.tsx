import { getAllShippingZones, getShippingSettings } from "@/lib/queries/shipping";
import { Card } from "@/components/ui/card";
import { formatCLP } from "@/lib/utils";
import { ShippingAdmin } from "./shipping-admin";

export default async function DespachoPage() {
  const [zones, settings] = await Promise.all([
    getAllShippingZones(),
    getShippingSettings(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-light sm:text-3xl">Despacho</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Configura zonas de envío y precios para todo Chile.
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Zonas activas</p>
          <p className="mt-1 text-2xl font-medium">{zones.filter((z) => z.isActive).length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Envío gratis</p>
          <p className="mt-1 text-2xl font-medium">{settings.freeShippingEnabled ? `Desde ${formatCLP(settings.freeShippingThreshold)}` : "Deshabilitado"}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs uppercase tracking-widest text-text-tertiary">Regiones cubiertas</p>
          <p className="mt-1 text-2xl font-medium">{zones.reduce((sum, z) => sum + z.regions.length, 0)} / 16</p>
        </Card>
      </div>

      <div className="mt-8">
        <ShippingAdmin
          initialZones={zones.map((z) => ({
            ...z,
            createdAt: z.createdAt.toISOString(),
            updatedAt: z.updatedAt.toISOString(),
          }))}
          initialSettings={{
            freeShippingEnabled: settings.freeShippingEnabled,
            freeShippingThreshold: settings.freeShippingThreshold,
          }}
        />
      </div>
    </div>
  );
}
