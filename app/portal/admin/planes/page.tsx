import { getAllPlans } from "@/lib/queries/catalog";
import { PlanEditor } from "./plan-editor";

export default async function PlanesPage() {
  const plans = await getAllPlans();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Gestión de Planes</h1>
      <p className="mt-2 text-sm text-text-tertiary">
        Modifica los parámetros de cada plan. Los cambios afectan a todos los
        orfebres del plan excepto los que tengan overrides individuales.
      </p>

      <div className="mt-8 space-y-6">
        {plans.map((plan) => (
          <PlanEditor key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
