import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-shrink-0 border-r border-border bg-surface p-6 md:block">
        <p className="mb-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">Portal</p>
        <nav className="space-y-2">
          {session.user.role === "ADMIN" && (
            <>
              <Link href="/portal/admin" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Dashboard</Link>
              <Link href="/portal/admin/postulaciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Postulaciones</Link>
              <Link href="/portal/admin/productos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Productos</Link>
              <Link href="/portal/admin/fotos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Fotos</Link>
              <Link href="/portal/admin/orfebres" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Orfebres</Link>
              <Link href="/portal/admin/pedidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Pedidos</Link>
              <Link href="/portal/admin/disputas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Disputas</Link>
              <Link href="/portal/admin/devoluciones" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Devoluciones</Link>
              <Link href="/portal/admin/finanzas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Finanzas</Link>
            </>
          )}
          {session.user.role === "ARTISAN" && (
            <>
              <Link href="/portal/orfebre" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Taller</Link>
              <Link href="/portal/orfebre/productos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Piezas</Link>
              <Link href="/portal/orfebre/pedidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Pedidos</Link>
              <Link href="/portal/orfebre/preguntas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Preguntas</Link>
              <Link href="/portal/orfebre/finanzas" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Finanzas</Link>
              <Link href="/portal/orfebre/perfil" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Perfil</Link>
            </>
          )}
          <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-widest text-text-tertiary">Comprador</p>
          <Link href="/portal/comprador/pedidos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mis Pedidos</Link>
          <Link href="/portal/comprador/favoritos" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Favoritos</Link>
          <Link href="/portal/comprador/perfil" className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text">Mi Cuenta</Link>
        </nav>
      </aside>
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
}
