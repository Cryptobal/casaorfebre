import { getFinanceStats } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default async function FinanzasPage() {
  const stats = await getFinanceStats();

  const cards = [
    { label: "GMV Total", value: formatCLP(stats.gmvTotal) },
    { label: "Comisiones Brutas", value: formatCLP(stats.commissionsGross) },
    {
      label: "Costo Estimado MP (~4.5%)",
      value: formatCLP(stats.mpCostEstimate),
    },
    { label: "Comisiones Netas", value: formatCLP(stats.commissionsNet) },
    {
      label: "Pagos Pendientes a Orfebres",
      value: formatCLP(stats.pendingPayouts),
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Finanzas</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs uppercase tracking-widest text-text-tertiary">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-medium">{card.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
