"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PLAN_COLORS: Record<string, string> = {
  Esencial: "#94a3b8",
  Artesano: "#8B7355",
  Maestro: "#d4a843",
};

function formatK(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function SalesChart({ data }: { data: { label: string; gmv: number }[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
        Ventas últimos 6 meses
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} width={60} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString("es-CL")}`, "GMV"]}
            />
            <Bar dataKey="gmv" fill="#8B7355" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PlanDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
        Orfebres por plan
      </h3>
      <div className="flex items-center gap-8">
        <div className="h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || "#ccc"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: PLAN_COLORS[d.name] || "#ccc" }}
              />
              <span className="text-text-secondary">{d.name}</span>
              <span className="font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
