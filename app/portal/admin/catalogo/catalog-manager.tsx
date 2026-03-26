"use client";

import { useState, useTransition } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  createOccasion,
  updateOccasion,
  deleteOccasion,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "@/lib/actions/catalog";

interface CatalogItem {
  id: string;
  name: string;
  slug?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CatalogManagerProps {
  initialCategories: CatalogItem[];
  initialMaterials: CatalogItem[];
  initialOccasions: CatalogItem[];
  initialSpecialties: CatalogItem[];
}

// ─── Inline edit state ───
interface EditState {
  id: string;
  name: string;
}

function CatalogSection({
  title,
  items,
  onAdd,
  onToggle,
  onDelete,
  onRename,
  placeholder,
}: {
  title: string;
  items: CatalogItem[];
  onAdd: (name: string) => Promise<void>;
  onToggle: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  placeholder: string;
}) {
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<EditState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await onAdd(trimmed);
      setNewName("");
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await onToggle(id, !current);
    });
  }

  function handleDelete(id: string, name: string) {
    if (confirmDelete === id) {
      startTransition(async () => {
        await onDelete(id, name);
        setConfirmDelete(null);
      });
    } else {
      setConfirmDelete(id);
    }
  }

  function startEdit(item: CatalogItem) {
    setEditing({ id: item.id, name: item.name });
  }

  function handleRename() {
    if (!editing) return;
    const trimmed = editing.name.trim();
    if (!trimmed || trimmed === "") return;
    startTransition(async () => {
      await onRename(editing.id, trimmed);
      setEditing(null);
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="font-serif text-lg font-light mb-4">{title}</h2>

      {/* Item list */}
      <div className="space-y-0 divide-y divide-border mb-4">
        {items.length === 0 && (
          <p className="text-sm text-text-tertiary py-3">Sin elementos</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-3 first:pt-0"
          >
            {/* Name / inline edit */}
            <div className="flex-1 min-w-0">
              {editing?.id === item.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                    autoFocus
                  />
                  <button
                    onClick={handleRename}
                    disabled={isPending}
                    className="text-accent hover:text-accent-dark text-xs font-medium whitespace-nowrap"
                  >
                    OK
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-text-tertiary hover:text-text text-xs whitespace-nowrap"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm truncate ${
                      item.isActive ? "text-text" : "text-text-tertiary line-through"
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.isActive ? (
                    <span className="text-xs rounded-full px-2 py-0.5 bg-success/10 text-success flex-shrink-0">
                      activo
                    </span>
                  ) : (
                    <span className="text-xs rounded-full px-2 py-0.5 bg-border text-text-tertiary flex-shrink-0">
                      inactivo
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {editing?.id !== item.id && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Edit button */}
                <button
                  onClick={() => startEdit(item)}
                  className="text-text-tertiary hover:text-text rounded-md px-2 py-1 text-sm transition-colors"
                  title="Editar nombre"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Toggle active */}
                <button
                  onClick={() => handleToggle(item.id, item.isActive)}
                  disabled={isPending}
                  className={`rounded-md px-2 py-1 text-xs transition-colors ${
                    item.isActive
                      ? "text-text-secondary hover:bg-warning/10 hover:text-warning"
                      : "text-success hover:bg-success/10"
                  }`}
                  title={item.isActive ? "Desactivar" : "Activar"}
                >
                  {item.isActive ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  disabled={isPending}
                  className={`rounded-md px-2 py-1 text-sm transition-colors ${
                    confirmDelete === item.id
                      ? "bg-error text-white"
                      : "text-error hover:bg-error/10"
                  }`}
                  title={
                    confirmDelete === item.id
                      ? "Click de nuevo para confirmar"
                      : "Eliminar"
                  }
                  onBlur={() => setConfirmDelete(null)}
                >
                  {confirmDelete === item.id ? (
                    <span className="text-xs font-medium">Confirmar</span>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !newName.trim()}
          className="bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent-dark transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

export function CatalogManager({
  initialCategories,
  initialMaterials,
  initialOccasions,
  initialSpecialties,
}: CatalogManagerProps) {
  return (
    <div className="space-y-8">
      <CatalogSection
        title="Categorías"
        items={initialCategories}
        placeholder="Nueva categoría..."
        onAdd={async (name) => {
          await createCategory(name);
        }}
        onToggle={async (id, isActive) => {
          await updateCategory(id, { isActive });
        }}
        onDelete={async (id) => {
          await deleteCategory(id);
        }}
        onRename={async (id, name) => {
          await updateCategory(id, { name });
        }}
      />
      <CatalogSection
        title="Materiales"
        items={initialMaterials}
        placeholder="Nuevo material..."
        onAdd={async (name) => {
          await createMaterial(name);
        }}
        onToggle={async (id, isActive) => {
          await updateMaterial(id, { isActive });
        }}
        onDelete={async (id) => {
          await deleteMaterial(id);
        }}
        onRename={async (id, name) => {
          await updateMaterial(id, { name });
        }}
      />
      <CatalogSection
        title="Especialidades"
        items={initialSpecialties}
        placeholder="Nueva especialidad..."
        onAdd={async (name) => {
          await createSpecialty(name);
        }}
        onToggle={async (id, isActive) => {
          await updateSpecialty(id, { isActive });
        }}
        onDelete={async (id) => {
          await deleteSpecialty(id);
        }}
        onRename={async (id, name) => {
          await updateSpecialty(id, { name });
        }}
      />
      <CatalogSection
        title="Ocasiones"
        items={initialOccasions}
        placeholder="Nueva ocasión..."
        onAdd={async (name) => {
          await createOccasion(name);
        }}
        onToggle={async (id, isActive) => {
          await updateOccasion(id, { isActive });
        }}
        onDelete={async (id) => {
          await deleteOccasion(id);
        }}
        onRename={async (id, name) => {
          await updateOccasion(id, { name });
        }}
      />
    </div>
  );
}
