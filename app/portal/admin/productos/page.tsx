import { getPendingProducts, getAllProductsForAdmin } from "@/lib/queries/admin";
import { ExpandableProductRow } from "./expandable-product-row";
import { ProductListManager } from "./product-list-manager";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductosAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = (params.view as string) || "moderation";
  const statusFilter = (params.status as string) || "APPROVED";

  const [pendingProducts, allProducts] = await Promise.all([
    getPendingProducts(),
    view === "manage" ? getAllProductsForAdmin(statusFilter) : Promise.resolve([]),
  ]);

  const TAB_ITEMS = [
    { key: "moderation", label: "Moderacion", count: pendingProducts.length },
    { key: "manage", label: "Gestion" },
  ];

  const STATUS_TABS = [
    { key: "APPROVED", label: "Publicados" },
    { key: "PAUSED", label: "Pausados" },
    { key: "REJECTED", label: "Rechazados" },
    { key: "DRAFT", label: "Borradores" },
    { key: "PENDING_REVIEW", label: "Pendientes" },
    { key: "all", label: "Todos" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Productos</h1>

      {/* Main tabs */}
      <div className="mt-4 flex gap-1 border-b border-border">
        {TAB_ITEMS.map((tab) => (
          <Link
            key={tab.key}
            href={`/portal/admin/productos?view=${tab.key}`}
            className={`px-4 py-2 text-sm transition-colors ${
              view === tab.key
                ? "border-b-2 border-accent font-medium text-text"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ─── Moderation view ─── */}
      {view === "moderation" && (
        <>
          {pendingProducts.length === 0 ? (
            <p className="mt-8 text-center text-sm text-text-tertiary">
              No hay productos pendientes de aprobacion
            </p>
          ) : (
            <>
              <p className="mt-4 text-xs text-text-tertiary">
                {pendingProducts.length} producto{pendingProducts.length !== 1 ? "s" : ""} pendiente{pendingProducts.length !== 1 ? "s" : ""}
              </p>
              <div className="mt-2 space-y-2">
                {pendingProducts.map((product) => (
                  <ExpandableProductRow
                    key={product.id}
                    product={product as unknown as Parameters<typeof ExpandableProductRow>[0]["product"]}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ─── Management view ─── */}
      {view === "manage" && (
        <>
          <div className="mt-4 flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/portal/admin/productos?view=manage&status=${tab.key}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-accent/10 text-accent"
                    : "bg-background text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <ProductListManager
            products={allProducts as unknown as Parameters<typeof ProductListManager>[0]["products"]}
            showBulkActions
          />
        </>
      )}
    </div>
  );
}
