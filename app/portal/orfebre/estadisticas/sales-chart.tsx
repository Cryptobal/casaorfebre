"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthData {
  month: string;
  ventas: number;
  monto: number;
}

function formatCLP(amount: number) {
  return "$" + amount.toLocaleString("es-CL");
}

export function SalesChart({ data }: { data: MonthData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
        <Tooltip
          formatter={(value, name) =>
            name === "monto" ? formatCLP(Number(value)) : value
          }
          labelStyle={{ color: "var(--color-text)" }}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: 13,
          }}
        />
        <Bar dataKey="ventas" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Ventas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: MonthData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="var(--color-text-tertiary)"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value) => formatCLP(Number(value))}
          labelStyle={{ color: "var(--color-text)" }}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: 13,
          }}
        />
        <Bar dataKey="monto" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Ingreso" />
      </BarChart>
    </ResponsiveContainer>
  );
}
