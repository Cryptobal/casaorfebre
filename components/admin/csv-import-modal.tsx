"use client";

import { useState, useTransition, useCallback } from "react";
import { bulkCreateInvitations } from "@/lib/actions/invitations";

type Campaign = { name: string; count: number };
type CsvRow = { name: string; email: string };
type ImportResult = {
  name: string;
  email: string;
  code: string;
  status: "created" | "error" | "skipped";
  error?: string;
};

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const nameIdx = header.findIndex(
    (h) => h === "nombre" || h === "name",
  );
  const emailIdx = header.findIndex((h) => h === "email");

  if (nameIdx === -1 || emailIdx === -1) return [];

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return { name: cols[nameIdx] || "", email: cols[emailIdx] || "" };
    })
    .filter((r) => r.name && r.email && r.email.includes("@"));
}

export function CsvImportModal({
  campaigns,
  onClose,
}: {
  campaigns: Campaign[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [planName, setPlanName] = useState("maestro");
  const [durationDays, setDurationDays] = useState(90);
  const [campaign, setCampaign] = useState(
    campaigns[0]?.name || "PIONEROS_2026",
  );
  const [sendEmails, setSendEmails] = useState(true);
  const [error, setError] = useState("");

  const defaultExpiry = new Date();
  defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
  const [expiresAt, setExpiresAt] = useState(
    defaultExpiry.toISOString().split("T")[0],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setError(
          'CSV inválido. Debe tener columnas "nombre" (o "name") y "email".',
        );
        return;
      }
      setError("");
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleImport() {
    if (rows.length === 0) return;

    startTransition(async () => {
      try {
        const res = await bulkCreateInvitations(rows, {
          planName,
          durationDays,
          campaign,
          expiresAt: new Date(expiresAt),
          sendEmails,
        });
        setResults(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    });
  }

  const created = results?.filter((r) => r.status === "created").length ?? 0;
  const skipped = results?.filter((r) => r.status === "skipped").length ?? 0;
  const errors = results?.filter((r) => r.status === "error").length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-light">Importar CSV</h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text"
          >
            &#10005;
          </button>
        </div>

        {/* Results view */}
        {results ? (
          <div>
            <div className="mb-4 flex gap-3 text-sm">
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                {created} creados
              </span>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
                {skipped} saltados
              </span>
              {errors > 0 && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                  {errors} errores
                </span>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-text-tertiary">
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-text-tertiary">{r.email}</td>
                    <td className="px-3 py-2">
                      {r.code && (
                        <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                          {r.code}
                        </code>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.status === "created" && (
                        <span className="text-green-600">Creado</span>
                      )}
                      {r.status === "skipped" && (
                        <span className="text-yellow-600" title={r.error}>
                          Saltado
                        </span>
                      )}
                      {r.status === "error" && (
                        <span className="text-red-600" title={r.error}>
                          Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dropzone */}
            {rows.length === 0 ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-center"
              >
                <p className="mb-2 text-sm text-text-secondary">
                  Arrastra un archivo CSV aquí
                </p>
                <p className="mb-4 text-xs text-text-tertiary">
                  Columnas requeridas: nombre, email
                </p>
                <label className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) readFile(file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <>
                {/* Preview */}
                <div className="mb-4 max-h-60 overflow-y-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-background text-left text-xs uppercase tracking-widest text-text-tertiary">
                        <th className="px-3 py-2">Nombre</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2 text-text-tertiary">
                            {row.email}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => removeRow(i)}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              &#10005;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mb-4 text-sm text-text-secondary">
                  {rows.length} orfebres listos para importar
                </p>

                {/* Config */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">
                      Plan
                    </label>
                    <select
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="maestro">Maestro</option>
                      <option value="artesano">Artesano</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">
                      Duración (días)
                    </label>
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">
                      Campaña
                    </label>
                    <select
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      {campaigns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">
                      Expiración
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <label className="mb-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sendEmails}
                    onChange={(e) => setSendEmails(e.target.checked)}
                    className="accent-accent"
                  />
                  Enviar emails al importar
                </label>
              </>
            )}

            {error && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {rows.length > 0 && !results && (
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRows([]);
                    setError("");
                  }}
                  className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:bg-background"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isPending}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
                >
                  {isPending
                    ? "Importando..."
                    : `Crear ${rows.length} invitaciones`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
